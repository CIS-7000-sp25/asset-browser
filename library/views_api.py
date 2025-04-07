from django.http import JsonResponse, StreamingHttpResponse, HttpResponse
from django.db.models import Q, Max, Min
from .models import Asset, Author, Commit
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .utils.s3_utils import S3Manager 
from .utils.zipper import zip_files_from_memory
from django.utils import timezone
from django.db.models import OuterRef, Subquery
import os
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, inline_serializer
from drf_spectacular.types import OpenApiTypes
from rest_framework import serializers

# First, let's create serializers for our response types
class UserSerializer(serializers.Serializer):
    pennId = serializers.CharField()
    fullName = serializers.CharField()

class AssetReferenceSerializer(serializers.Serializer):
    name = serializers.CharField()
    id = serializers.CharField()

class CommitReferenceSerializer(serializers.Serializer):
    commitId = serializers.CharField()
    assetName = serializers.CharField()
    version = serializers.CharField()
    timestamp = serializers.DateTimeField()
    note = serializers.CharField()


class CommitSerializer(serializers.Serializer):
    commitId = serializers.CharField()
    pennKey = serializers.CharField()
    versionNum = serializers.CharField()
    note = serializers.CharField()
    commitDate = serializers.DateTimeField()
    hasMaterials = serializers.BooleanField()
    state = serializers.ListField(child=serializers.CharField())
    assetName = serializers.CharField()

class CommitDetailSerializer(CommitSerializer):
    authorName = serializers.CharField()
    assetId = serializers.CharField()

# Response serializers
class UsersResponseSerializer(serializers.Serializer):
    users = UserSerializer(many=True)

class CommitsResponseSerializer(serializers.Serializer):
    commits = CommitSerializer(many=True)

class CommitDetailResponseSerializer(serializers.Serializer):
    commit = CommitDetailSerializer()

class ErrorResponseSerializer(serializers.Serializer):
    error = serializers.CharField()

# Add these serializers at the top with the other serializers
class KeywordSerializer(serializers.Serializer):
    keyword = serializers.CharField()

class AssetSerializer(serializers.Serializer):
    name = serializers.CharField()
    thumbnailUrl = serializers.URLField(allow_null=True)
    version = serializers.CharField()
    creator = serializers.CharField()
    lastModifiedBy = serializers.CharField()
    checkedOutBy = serializers.CharField(allow_null=True)
    isCheckedOut = serializers.BooleanField()
    materials = serializers.BooleanField()
    keywords = serializers.ListField(child=serializers.CharField())
    description = serializers.CharField()
    createdAt = serializers.DateTimeField()
    updatedAt = serializers.DateTimeField()

class AssetsResponseSerializer(serializers.Serializer):
    assets = AssetSerializer(many=True)

class AssetDetailResponseSerializer(serializers.Serializer):
    asset = AssetSerializer()

# Add these serializers at the top with the other serializers
class CheckoutRequestSerializer(serializers.Serializer):
    pennkey = serializers.CharField(help_text="The pennkey of the user checking out the asset")

class CheckoutResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    asset = serializers.DictField(child=serializers.CharField(), help_text="Details of the checked out asset")

# Add these serializers at the top with the other serializers
class DownloadQueryParamsSerializer(serializers.Serializer):
    include_materials = serializers.BooleanField(
        required=False, 
        default=False,
        help_text="Whether to include material files in the download"
    )
    version = serializers.CharField(
        required=False, 
        help_text="Specific version to download. If not provided, downloads the latest version"
    )

# Update the get_assets endpoint with documentation
@extend_schema(
    summary="List all assets",
    description="""
    Returns a list of all assets in the system.
    
    Supports filtering by:
    - search: Search term for asset name or keywords
    - author: Filter by creator or last modifier
    - checkedInOnly: Show only assets that are not checked out
    
    Supports sorting by:
    - name: Sort by asset name
    - author: Sort by creator name
    - updated: Sort by last update time (default)
    - created: Sort by creation time
    
    The response includes for each asset:
    - name: Asset name (unique identifier)
    - thumbnailUrl: URL to the asset's thumbnail image
    - version: Current version number
    - creator: Name of the asset creator
    - lastModifiedBy: Name of the last person to modify the asset
    - checkedOutBy: PennKey of user who has checked out the asset (if any)
    - isCheckedOut: Whether the asset is currently checked out
    - materials: Whether the asset has associated materials
    - keywords: List of keywords/tags associated with the asset
    - description: Asset description from the latest commit
    - createdAt: Timestamp of asset creation
    - updatedAt: Timestamp of last modification
    """,
    parameters=[
        OpenApiParameter(
            name='search',
            location=OpenApiParameter.QUERY,
            description='Search term for filtering assets by name or keywords',
            required=False,
            type=str
        ),
        OpenApiParameter(
            name='author',
            location=OpenApiParameter.QUERY,
            description='Filter assets by creator or last modifier name',
            required=False,
            type=str
        ),
        OpenApiParameter(
            name='checkedInOnly',
            location=OpenApiParameter.QUERY,
            description='If true, only show assets that are not checked out',
            required=False,
            type=bool
        ),
        OpenApiParameter(
            name='sortBy',
            location=OpenApiParameter.QUERY,
            description='Field to sort by (name, author, updated, created)',
            required=False,
            type=str,
            default='updated'
        )
    ],
    responses={
        200: AssetsResponseSerializer,
        500: ErrorResponseSerializer,
    },
    examples=[
        OpenApiExample(
            'Success Response',
            description='Example of a successful response with multiple assets',
            value={
                'assets': [
                    {
                        'name': 'cool_character',
                        'thumbnailUrl': 'https://assets.example.com/thumbnails/cool_character.png',
                        'version': '2.1.0',
                        'creator': 'Will Cai',
                        'lastModifiedBy': 'Christina Qiu',
                        'checkedOutBy': 'chuu',
                        'isCheckedOut': True,
                        'materials': True,
                        'keywords': ['character', '3D', 'fantasy'],
                        'description': 'Updated character materials and textures',
                        'createdAt': '2025-02-18T02:20:00+00:00',
                        'updatedAt': '2025-02-18T02:20:00+00:00'
                    },
                    {
                        'name': 'environment_props',
                        'thumbnailUrl': 'https://assets.example.com/thumbnails/environment_props.png',
                        'version': '1.0.0',
                        'creator': 'Cindy Xu',
                        'lastModifiedBy': 'Cindy Xu',
                        'checkedOutBy': None,
                        'isCheckedOut': False,
                        'materials': True,
                        'keywords': ['environment', 'props', '3D'],
                        'description': 'Initial commit of environment props',
                        'createdAt': '2025-02-18T02:20:00+00:00',
                        'updatedAt': '2025-02-18T02:20:00+00:00'
                    }
                ]
            },
            response_only=True,
            status_codes=['200']
        ),
        OpenApiExample(
            'Error Response',
            description='Example of an error response',
            value={
                'error': 'Internal server error occurred while fetching assets'
            },
            response_only=True,
            status_codes=['500']
        )
    ]
)
@api_view(['GET'])
def get_assets(request):
    try:
        # Get query parameters
        search = request.GET.get('search')
        author = request.GET.get('author')
        checked_in_only = request.GET.get('checkedInOnly') == 'true'
        sort_by = request.GET.get('sortBy', 'updated')

        # Base queryset
        assets = Asset.objects.all()

        earliest_commit = Commit.objects.filter(asset=OuterRef('pk')).order_by('timestamp')
        latest_commit   = Commit.objects.filter(asset=OuterRef('pk')).order_by('-timestamp')

        assets = assets.annotate(
            first_author_first = Subquery(
                earliest_commit.values('author__firstName')[:1]
            ),
            first_author_last  = Subquery(
                earliest_commit.values('author__lastName')[:1]
            ),
            first_ts  = Subquery(earliest_commit.values('timestamp')[:1]),
            latest_ts = Subquery(latest_commit.values('timestamp')[:1]),
        )

        # Apply search filter
        if search:
            assets = assets.filter(
                Q(assetName__icontains=search) |
                Q(keywordsList__keyword__icontains=search)
            ).distinct()
        
        # Apply checked-in filter
        if checked_in_only:
            assets = assets.filter(checkedOutBy__isnull=True)

        # Apply author filter
        if author:
            for token in author.split():
                assets = assets.filter(
                    Q(first_author_first__icontains=token) |
                    Q(first_author_last__icontains=token)
                )

        # Apply sorting and ensure uniqueness
        if sort_by == 'name':
            assets = assets.order_by('assetName')

        elif sort_by == 'author':
            # sort by the *creator* (author of the first commit)
            assets = assets.order_by('first_author_first', 'first_author_last')

        elif sort_by == 'updated':
            # most recently touched asset first
            assets = assets.order_by('-latest_ts')

        elif sort_by == 'created':
            # asset whose *first* commit is newest comes first
            assets = assets.order_by('-first_ts')


        # Convert to frontend format
        assets_list = []
        s3Manager = S3Manager();
        for asset in assets:
            try:
                # Get latest and first commits
                latest_commit = Commit.objects.filter(asset=asset).order_by('-timestamp').first()
                first_commit = Commit.objects.filter(asset=asset).order_by('timestamp').first()
                thumbnail_url = s3Manager.generate_presigned_url(asset.thumbnailKey) if asset.thumbnailKey else None

                assets_list.append({
                    'name': asset.assetName,
                    'thumbnailUrl': thumbnail_url,  # You'll need to handle S3 URL generation
                    'version': latest_commit.version if latest_commit else "01.00.00",
                    'creator': f"{first_commit.author.firstName} {first_commit.author.lastName}" if first_commit and first_commit.author else "Unknown",
                    'lastModifiedBy': f"{latest_commit.author.firstName} {latest_commit.author.lastName}" if latest_commit and latest_commit.author else "Unknown",
                    'checkedOutBy': asset.checkedOutBy.pennkey if asset.checkedOutBy else None,
                    'isCheckedOut': asset.checkedOutBy is not None,
                    'materials': latest_commit.sublayers.exists() if latest_commit else False,
                    'keywords': [k.keyword for k in asset.keywordsList.all()],
                    'description': latest_commit.note if latest_commit else "No description available",
                    'createdAt': first_commit.timestamp.isoformat() if first_commit else None,
                    'updatedAt': latest_commit.timestamp.isoformat() if latest_commit else None,
                })
            except Exception as e:
                print(f"Error processing asset {asset.assetName}: {str(e)}")
                continue

        return Response({'assets': assets_list})

    except Exception as e:
        print(f"Error in get_assets: {str(e)}")
        return Response({'error': str(e)}, status=500)
    
@extend_schema(
    summary="Get asset details",
    description="""
    Returns detailed information about a specific asset.
    
    The response includes:
    - All basic asset information (name, version, etc.)
    - Current checkout status
    - Creator and last modifier information
    - Associated keywords and materials status
    - Creation and last update timestamps
    - Thumbnail URL if available
    """,
    parameters=[
        OpenApiParameter(
            name='asset_name',
            location=OpenApiParameter.PATH,
            description='The name of the asset to retrieve',
            required=True,
            type=str
        )
    ],
    responses={
        200: AssetDetailResponseSerializer,
        404: ErrorResponseSerializer,
        500: ErrorResponseSerializer,
    },
    examples=[
        OpenApiExample(
            'Success Response',
            description='Example of a successful response with asset details',
            value={
                'asset': {
                    'name': 'cool_character',
                    'thumbnailUrl': 'https://assets.example.com/thumbnails/cool_character.png',
                    'version': '2.1.0',
                    'creator': 'Will Cai',
                    'lastModifiedBy': 'Christina Qiu',
                    'checkedOutBy': 'chuu',
                    'isCheckedOut': True,
                    'materials': True,
                    'keywords': ['character', '3D', 'fantasy'],
                    'description': 'Updated character materials and textures',
                    'createdAt': '2025-02-18T02:20:00+00:00',
                    'updatedAt': '2025-02-18T02:20:00+00:00'
                }
            },
            response_only=True,
            status_codes=['200']
        ),
        OpenApiExample(
            'Not Found Response',
            description='Example when asset is not found',
            value={
                'error': 'Asset not found'
            },
            response_only=True,
            status_codes=['404']
        )
    ]
)
@api_view(['GET'])
def get_asset(request, asset_name):
    try:
        # Get the asset by name
        asset = Asset.objects.get(assetName=asset_name)
        
        # Get latest and first commits
        latest_commit = asset.commits.order_by('-timestamp').first()
        first_commit = asset.commits.order_by('timestamp').first()

        # Generate S3 URLs
        s3Manager = S3Manager();
        thumbnail_url = s3Manager.generate_presigned_url(asset.thumbnailKey) if asset.thumbnailKey else None

        # Format the response to match frontend's AssetWithDetails interface
        asset_data = {
            'name': asset.assetName,
            'thumbnailUrl': thumbnail_url,  # You'll need to handle S3 URL generation
            'version': latest_commit.version if latest_commit else "01.00.00",
            'creator': f"{first_commit.author.firstName} {first_commit.author.lastName}" if first_commit and first_commit.author else "Unknown",
            'lastModifiedBy': f"{latest_commit.author.firstName} {latest_commit.author.lastName}" if latest_commit and latest_commit.author else "Unknown",
            'checkedOutBy': asset.checkedOutBy.pennkey if asset.checkedOutBy else None,
            'isCheckedOut': asset.checkedOutBy is not None,
            'materials': latest_commit.sublayers.exists() if latest_commit else False,
            'keywords': [k.keyword for k in asset.keywordsList.all()],
            'description': latest_commit.note if latest_commit else "No description available",
            'createdAt': first_commit.timestamp.isoformat() if first_commit else None,
            'updatedAt': latest_commit.timestamp.isoformat() if latest_commit else None,
        }

        return Response({'asset': asset_data})

    except Asset.DoesNotExist:
        return Response({'error': 'Asset not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    
@api_view(['POST'])
def upload_S3_asset(request, asset_name):
    try:
        # On the frontend, we should first check if metadata exists
        # Metadata upload is a separate POST 
        s3 = S3Manager()

        prefix = f"{asset_name}"
        if len(s3.list_s3_files(prefix)) > 0:
            return Response({'error': 'Asset already found!'}, status=400)

        files = request.FILES.getlist('files')
        if not files:
            return Response({'error': 'Asset already found!'}, status=400)

        for file in files:
            s3.upload_file(file, f"{asset_name}/{file.name}")

        return Response({'message': 'Successfully uploaded'}, status=200)
    
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@extend_schema(
    summary="Checkout an asset",
    description="""
    Checks out an asset to a specific user. 
    
    Requirements:
    - The asset must exist
    - The asset must not be already checked out
    - The pennkey must correspond to an existing user
    - The pennkey must be provided in the request body
    
    The endpoint will:
    1. Verify the asset exists
    2. Verify the user (pennkey) exists
    3. Check if the asset is available for checkout
    4. Assign the asset to the user
    
    On success, returns a confirmation message and updated asset details.
    """,
    parameters=[
        OpenApiParameter(
            name='asset_name',
            location=OpenApiParameter.PATH,
            description='The name of the asset to check out',
            required=True,
            type=str
        )
    ],
    request=CheckoutRequestSerializer,
    responses={
        200: CheckoutResponseSerializer,
        400: ErrorResponseSerializer,
        404: ErrorResponseSerializer,
        500: ErrorResponseSerializer,
    },
    examples=[
        OpenApiExample(
            'Success Response',
            description='Example of a successful checkout',
            value={
                'message': 'Asset checked out successfully',
                'asset': {
                    'name': 'cool_character',
                    'checkedOutBy': 'willcai',
                    'isCheckedOut': True
                }
            },
            response_only=True,
            status_codes=['200']
        ),
        OpenApiExample(
            'Request Body Example',
            description='Example of the request body',
            value={
                'pennkey': 'willcai'
            },
            request_only=True
        ),
        OpenApiExample(
            'Asset Not Found Error',
            description='Example when the asset does not exist',
            value={
                'error': 'Asset not found'
            },
            response_only=True,
            status_codes=['404']
        ),
        OpenApiExample(
            'User Not Found Error',
            description='Example when the user does not exist',
            value={
                'error': 'User not found'
            },
            response_only=True,
            status_codes=['404']
        ),
        OpenApiExample(
            'Already Checked Out Error',
            description='Example when the asset is already checked out',
            value={
                'error': 'Asset is already checked out by Christina Qiu'
            },
            response_only=True,
            status_codes=['400']
        ),
        OpenApiExample(
            'Missing Pennkey Error',
            description='Example when pennkey is not provided',
            value={
                'error': 'pennkey is required'
            },
            response_only=True,
            status_codes=['400']
        )
    ],
    methods=['POST']
)
@api_view(['POST'])
def checkout_asset(request, asset_name):
    """
    Checkout an asset to a user.
    
    Args:
        request: The HTTP request containing the pennkey in the body
        asset_name: The name of the asset to check out
        
    Returns:
        Response with success message and asset details or error message
    """
    try:
        print(f"Request data: {request.data}")
        print(f"Request headers: {request.headers}")
        
        # Get the asset
        try:
            asset = Asset.objects.get(assetName=asset_name)
            print(f"Found asset: {asset.assetName}")
        except Asset.DoesNotExist as e:
            print(f"Asset not found: {asset_name}")
            return Response({'error': 'Asset not found'}, status=404)
        
        # Get the user's pennkey from the request
        pennkey = request.data.get('pennkey')
        print(f"Received pennkey: {pennkey}")
        
        if not pennkey:
            return Response({'error': 'pennkey is required'}, status=400)

        # Check if asset is already checked out
        if asset.checkedOutBy:
            print(f"Asset already checked out by: {asset.checkedOutBy}")
            return Response({
                'error': f'Asset is already checked out by {asset.checkedOutBy.firstName} {asset.checkedOutBy.lastName}'
            }, status=400)

        # Get the user
        try:
            user = Author.objects.get(pennkey=pennkey)
            print(f"Found user: {user.firstName} {user.lastName}")
        except Author.DoesNotExist as e:
            print(f"User not found: {pennkey}")
            return Response({'error': 'User not found'}, status=404)

        # Check out the asset
        try:
            asset.checkedOutBy = user
            asset.save()
            print("Asset checked out successfully")
        except Exception as e:
            print(f"Error saving asset: {str(e)}")
            raise

        return Response({
            'message': 'Asset checked out successfully',
            'asset': {
                'name': asset.assetName,
                'checkedOutBy': user.pennkey,
                'isCheckedOut': True
            }
        })

    except Exception as e:
        print(f"Unexpected error in checkout_asset: {str(e)}")
        return Response({'error': str(e)}, status=500)

@extend_schema(
    summary="Download asset files",
    description="""
    Downloads the asset files as a zip archive. 
    
    Features:
    - Downloads the asset's USD files and related resources
    - Returns a zip file containing all requested files
    
    """,
    parameters=[
        OpenApiParameter(
            name='asset_name',
            location=OpenApiParameter.PATH,
            description='The name of the asset to download',
            required=True,
            type=str
        )
    ],
    responses={
        200: inline_serializer(
            name='DownloadResponse',
            fields={
                'content': serializers.FileField(help_text="ZIP file containing the asset files")
            }
        ),
        404: ErrorResponseSerializer,
        400: ErrorResponseSerializer,
        500: ErrorResponseSerializer,
    },
    examples=[
        OpenApiExample(
            'Not Found Error',
            description='Example when the asset does not exist',
            value={
                'error': 'Asset not found'
            },
            response_only=True,
            status_codes=['404']
        ),
        OpenApiExample(
            'Access Error',
            description='Example when there is an error accessing the files',
            value={
                'error': 'Error accessing asset files from storage'
            },
            response_only=True,
            status_codes=['500']
        )
    ],
    methods=['GET']
)
@api_view(['GET'])
def download_asset(request, asset_name):
    """
    Download asset files as a zip archive.
    
    Args:
        request: The HTTP request containing optional query parameters
        asset_name: The name of the asset to download
        
    Returns:
        StreamingResponse with zip file or error response
    """
    try:
        # Make sure the asset exists in the DB first (helps 404 early)
        Asset.objects.get(assetName=asset_name)

        s3 = S3Manager()
        prefix = f"{asset_name}"
        keys = s3.list_s3_files(prefix)

        if not keys:
            return Response({'error': 'No files found for this asset'}, status=404)

        file_data = {}
        for key in keys:
            name_in_zip = os.path.relpath(key, prefix)
            file_bytes  = s3.download_s3_file(key)
            file_data[name_in_zip] = file_bytes

        zip_buffer = zip_files_from_memory(file_data)

        response = StreamingHttpResponse(zip_buffer, content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename="{asset_name}.zip"'
        return response

    except Asset.DoesNotExist:
        return Response({'error': 'Asset not found'}, status=404)
    except Exception as e:
        print(f"Error in download_asset: {str(e)}")
        return Response({'error': str(e)}, status=500)

@extend_schema(
    summary="List all commits",
    description="""
    Returns a list of all commits in the system.
    
    The response includes for each commit:
    - commitId: Unique identifier for the commit
    - pennKey: Author's Penn ID
    - versionNum: Version number of the commit
    - note: Commit message/notes
    - commitDate: Timestamp of the commit
    - hasMaterials: Whether the commit includes material changes
    - state: List of state flags
    - assetName: Name of the associated asset
    """,
    responses={
        200: CommitsResponseSerializer,
        500: ErrorResponseSerializer,
    },
    examples=[
        OpenApiExample(
            'Success Response',
            description='Example of a successful response with multiple commits',
            value={
                'commits': [
                    {
                        'commitId': '123e4567-e89b-12d3-a456-426614174000',
                        'pennKey': 'willcai',
                        'versionNum': '1.0.0',
                        'note': 'Initial commit of cool_asset',
                        'commitDate': '2024-11-04T03:19:00+00:00',
                        'hasMaterials': True,
                        'state': ['approved'],
                        'assetName': 'cool_asset'
                    },
                    {
                        'commitId': '987fcdeb-51a2-43d7-9876-543210987654',
                        'pennKey': 'chuu',
                        'versionNum': '1.1.0',
                        'note': 'Updated materials',
                        'commitDate': '2024-11-04T03:19:00+00:00',
                        'hasMaterials': True,
                        'state': ['pending_review'],
                        'assetName': 'another_asset'
                    }
                ]
            },
            response_only=True,
            status_codes=['200']
        )
    ]
)
@api_view(['GET'])
def get_commits(request):
    """
    Get a list of all commits in the system.
    Returns basic information about each commit including the author, version, and timestamp.
    """
    try:
        commits = Commit.objects.all().order_by('-timestamp')
        commits_list = []
        
        for commit in commits:
            commits_list.append({
                'commitId': str(commit.id),
                'pennKey': commit.author.pennkey if commit.author else None,
                'versionNum': commit.version,
                'note': commit.note,
                'commitDate': commit.timestamp.isoformat(),
                'hasMaterials': commit.sublayers.exists(),
                'state': [],  # This matches the frontend interface but we don't have state in backend
                'assetName': commit.asset.assetName
            })

        return Response({'commits': commits_list})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@extend_schema(
    summary="Get commit details",
    description="""
    Returns detailed information about a specific commit.
    
    The response includes:
    - All basic commit information (id, version, notes, etc.)
    - Author's full name and details
    - Associated asset information
    - Detailed material/sublayer information
    """,
    parameters=[
        OpenApiParameter(
            name='commit_id',
            location=OpenApiParameter.PATH,
            description='The ID of the commit to retrieve',
            required=True,
            type=str
        )
    ],
    responses={
        200: CommitDetailResponseSerializer,
        404: ErrorResponseSerializer,
        500: ErrorResponseSerializer,
    },
    examples=[
        OpenApiExample(
            'Success Response',
            description='Example of a successful response with commit details',
            value={
                'commit': {
                    'commitId': '123e4567-e89b-12d3-a456-426614174000',
                    'pennKey': 'willcai',
                    'versionNum': '1.0.0',
                    'note': 'Initial commit of cool_asset',
                    'commitDate': '2024-11-04T03:19:00+00:00',
                    'hasMaterials': True,
                    'state': ['approved'],
                    'assetName': 'cool_asset',
                    'authorName': 'Will Cai',
                    'assetId': '987fcdeb-51a2-43d7-9876-543210987654'
                }
            },
            response_only=True,
            status_codes=['200']
        ),
        OpenApiExample(
            'Not Found Response',
            description='Example when commit is not found',
            value={
                'error': 'Commit not found'
            },
            response_only=True,
            status_codes=['404']
        )
    ]
)
@api_view(['GET'])
def get_commit(request, commit_id):
    """
    Get detailed information about a specific commit.
    Includes the commit details, author information, and associated asset information.
    """
    try:
        commit = Commit.objects.get(id=commit_id)
        
        commit_data = {
            'commitId': str(commit.id),
            'pennKey': commit.author.pennkey if commit.author else None,
            'versionNum': commit.version,
            'note': commit.note,
            'commitDate': commit.timestamp.isoformat(),
            'hasMaterials': commit.sublayers.exists(),
            'state': [],  # This matches the frontend interface but we don't have state in backend
            'assetName': commit.asset.assetName,
            # Additional details for single commit view
            'authorName': f"{commit.author.firstName} {commit.author.lastName}" if commit.author else None,
            'assetId': str(commit.asset.id),
            'sublayers': [
                {
                    'id': str(layer.id),
                    'versionName': layer.versionName,
                    'filepath': str(layer.filepath)
                } for layer in commit.sublayers.all()
            ]
        }

        return Response({'commit': commit_data})
    except Commit.DoesNotExist:
        return Response({'error': 'Commit not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@extend_schema(
    summary="List all users",
    description="""
    Returns a list of all users in the system with their basic information.
    
    The response includes:
    - pennId: User's Penn ID (unique identifier)
    - fullName: User's full name
    """,
    responses={
        200: UsersResponseSerializer,
        500: ErrorResponseSerializer,
    },
    examples=[
        OpenApiExample(
            'Success Response',
            description='Example of a successful response with multiple users',
            value={
                'users': [
                    {
                        'pennId': 'willcai',
                        'fullName': 'Will Cai',
                    },
                    {
                        'pennId': 'chuu',
                        'fullName': 'Christina Qiu',
                    }
                ]
            },
            response_only=True,
            status_codes=['200']
        ),
        OpenApiExample(
            'Error Response',
            description='Example of an error response',
            value={
                'error': 'Internal server error occurred'
            },
            response_only=True,
            status_codes=['500']
        )
    ]
)
@api_view(['GET'])
def get_users(request):
    """
    Get a list of all users in the system.
    Returns basic information about each user including their Penn ID and full name.
    """
    try:
        authors = Author.objects.all().order_by('firstName', 'lastName')
        users_list = []
        
        for author in authors:
            users_list.append({
                'pennId': author.pennkey,
                'fullName': f"{author.firstName} {author.lastName}".strip() or author.pennkey,
            })

        return Response({'users': users_list})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@extend_schema(
    summary="Get user details",
    description="""
    Returns detailed information about a specific user.
    
    The response includes:
    - Basic user information (pennId, fullName)
    """,
    parameters=[
        OpenApiParameter(
            name='pennkey',
            location=OpenApiParameter.PATH,
            description='The Penn key of the user to retrieve',
            required=True,
            type=str
        )
    ],
    responses={
        200: UserSerializer,
        404: ErrorResponseSerializer,
        500: ErrorResponseSerializer,
    },
    examples=[
        OpenApiExample(
            'Success Response',
            description='Example of a successful response with user details',
            value={
                'user': {
                    'pennId': 'willcai',
                    'fullName': 'Will Cai',
                }
            },
            response_only=True,
            status_codes=['200']
        ),
        OpenApiExample(
            'Not Found Response',
            description='Example when user is not found',
            value={
                'error': 'User not found'
            },
            response_only=True,
            status_codes=['404']
        )
    ]
)
@api_view(['GET'])
def get_user(request, pennkey):
    """
    Get detailed information about a specific user.
    Includes their basic information, currently checked out assets, and recent commits.
    """
    try:
        author = Author.objects.get(pennkey=pennkey)
        
        user_data = {
            'pennId': author.pennkey,
            'fullName': f"{author.firstName} {author.lastName}".strip() or author.pennkey,
        }

        return Response({'user': user_data})
    except Author.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)