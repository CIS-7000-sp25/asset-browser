from datetime import datetime
import uuid
from django.http import JsonResponse
from django.db.models import Q, Max, Min
from .models import Asset, Author, Commit, AssetVersion, Keyword
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .utils.s3_utils import S3Manager 
from django.utils import timezone

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
            assets = assets.filter(
                Q(commits__author__firstName__icontains=author) |
                Q(commits__author__lastName__icontains=author)
            ).distinct()

        # Apply sorting and ensure uniqueness
        if sort_by == 'name':
            assets = assets.order_by('assetName').distinct()
        elif sort_by == 'author':
            # First get the latest commit for each asset
            assets = assets.annotate(
                latest_author_first=Max('commits__author__firstName'),
                latest_author_last=Max('commits__author__lastName')
            ).order_by('latest_author_first', 'latest_author_last').distinct()
        elif sort_by == 'updated':
            # First get the latest commit for each asset
            assets = assets.annotate(
                latest_timestamp=Max('commits__timestamp')
            ).order_by('-latest_timestamp').distinct()
        elif sort_by == 'created':
            # First get the earliest commit for each asset
            assets = assets.annotate(
                earliest_timestamp=Min('commits__timestamp')
            ).order_by('earliest_timestamp').distinct()

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
    
@api_view(['GET'])
def get_asset(request, asset_name):
    try:
        # Get the asset by name
        asset = Asset.objects.get(assetName=asset_name)
        
        # Get latest and first commits
        latest_commit = asset.commits.order_by('-timestamp').first()
        first_commit = asset.commits.order_by('timestamp').first()

        # Generate S3 URLs
        s3Manager = S3Manager()
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
def post_asset(request, asset_name):
    try:
        # On the frontend, we should first check if metadata exists
        # Metadata upload is a separate POST 

        if Asset.objects.get(assetName=asset_name):
            return Response({'error': 'Asset already exists'}, status=400)

        files = request.FILES.getlist('files')
        if not files:
            return Response({'error': 'Request missing files'}, status=404)

        s3 = S3Manager()
        for file in files:
            s3.upload_file(file, f"{asset_name}/{file.name}")

        return Response({'message': 'Successfully uploaded'}, status=200)
    
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['PUT'])
def put_asset(request, asset_name):
    try:
        try:
            Asset.objects.get(assetName=asset_name)
        except Asset.DoesNotExist as e:
            return Response({'error': 'Asset not found'}, status=404)
            
        files = request.FILES.getlist('files')
        if not files:
            return Response({'error': 'Request missing files'}, status=404)

        s3 = S3Manager()
        version_map = {}
        for file in files:
            key = f"{asset_name}/{file.name}"
            response = s3.update_file(file, key)

            # insert key to map, return this for our metadata
            version_map.update({key, response["VersionId"]})

        return Response({'message': 'Successfully updated', 'version_map': version_map}, status=200)

    except Exception as e:
        return Response({'error' : str(e)}, status=500)

# Query:
#   asset_name - A string as the name of the asset
#   metadata - a JSON containing relevant metadata information
#   metadata 
#   - assetStructureVersion (string)
#   - hasTexture (bool)    
#   - keywords (list of keyword strings)
#   - commit (Object contianing below)
#     - author
#     - timestamp
#     - version
#     - note

@api_view(['POST'])
def post_metadata(request, asset_name):
    try:
        # All untested!

        if Asset.objects.get(assetName=asset_name):
            return Response({'error': 'Asset exists!'}, status=400)

        metadata = request.loads('utf-8')
        asset = Asset(
            id = uuid.uuid4(),
            assetName = asset_name,
            assetStructureVersion = metadata["assetStructureVersion"],
            hasTexture = metadata["hasTexture"],
            thumbnailKey = f"{asset_name}/thumbnail.png"
        )

        for keyword in metadata["keywords"]:
            keyword, created = Keyword.objects.get_or_create(keyword=keyword.lower())
            asset.keywordsList.add(keyword)

        author = Author.objects.filter(pennkey=commit["author"]).first()

        if author is None:
            author = Author(pennkey=commit["author"], firstName="", lastName="")
            author.save()
            print(f"Author {commit['author']} not found, created new author.")

        commit = metadata["Commit"]
        commit = Commit(
            author = author, 
            timestamp = datetime.fromisoformat(commit["timestamp"]), 
            version = commit["version"] , 
            note = commit["note"], 
            asset = asset)
        commit.save()

        versions = {
            "Variant Set" : f"{asset_name}/{asset_name}.usda",
            "LOD0" : f"{asset_name}/LODs/{asset_name}_LOD0.usda",
            "LOD1" : f"{asset_name}/LODs/{asset_name}_LOD1.usda",
            "LOD2" : f"{asset_name}/LODs/{asset_name}_LOD2.usda",
        }
        
        for version, key in versions:
            asset_version = AssetVersion(
                id = uuid.uuid4(), 
                versionName = version, 
                filepath = key, 
                asset = asset)
            asset_version.save()

        return Response({'message': 'Successfully created metadata'}, status=200)

    except Exception as e:
        return Response({'error' : str(e)}, status=500)

# Query:
#   asset_name - A string as the name of the asset
#   new_version - A string as the new version as per our 7000 standards
#   metadata - a JSON containing below
#   - keywords (list of keyword strings)
#   - commit (Object contianing below)
#     - author
#     - timestamp
#     - version
#     - note
#   version_map - JSON map, refer to put_asset
#   - [key, s3_id] : S3 key and S3 version ID for a file changed in S3
#       -> keys can be: {asset_name}/{asset_name}.fbx for example I think

@api_view(['PUT'])
def put_metadata(request, asset_name, new_version):
    try:
        db_asset = None
        try:
            db_asset = Asset.objects.get(assetName=asset_name)
        except Asset.DoesNotExist as e:
            return Response({'error': 'Asset not found'}, status=404)

        metadata = request.loads('utf-8')
        version_map = metadata['version_map']

        for key, s3_id in version_map:
            versionName = None

            if key[-4:] == ".usda":
                versionName = "Variant Set"
                tags = key[-9:-4]
                if tags in {"_LOD0", "_LOD1", "_LOD2"}:
                    versionName = tags[1:]

            version_update = AssetVersion(
                id = uuid.uuid4(),
                filepath = key,
                s3id = s3_id,
                versionName = versionName,
                version = new_version,
                asset = db_asset
            )
            version_update.save()

        for keyword in metadata["keywords"]:
            keyword, created = Keyword.objects.get_or_create(keyword=keyword.lower())
            db_asset.keywordsList.add(keyword)

        # Add a new commit
        commit = metadata["Commit"]
        author = Author.objects.filter(pennkey=commit["author"]).first()

        if author is None:
            author = Author(pennkey=commit["author"], firstName="", lastName="")
            author.save()
            print(f"Author {commit['author']} not found, created new author.")

        commit = Commit(
            author = author, 
            timestamp = datetime.fromisoformat(commit["timestamp"]), 
            version = commit["version"] , 
            note = commit["note"], 
            asset = db_asset)
        commit.save()

        return Response({'message': 'Successfully updated metadata'}, status=200)
    
    except Exception as e:
        return Response({'error' : str(e)}, status=500)

@api_view(['POST'])
def checkout_asset(request, asset_name):
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
