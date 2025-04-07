from datetime import datetime
import uuid

from library.models import Asset, Keyword, Author, Commit, AssetVersion


def upload_metadata(metadata):
    id = uuid.uuid4()
    assetName = metadata["assetName"]
    if assetName[-4:] == ".fbx":
        assetName = assetName[:-4]
    assetStructureVersion = metadata["assetStructureVersion"]
    hasTexture = metadata["hasTexture"]
    thumbnailKey = f"{assetName}/thumbnail.png"
    asset = Asset(
        id=id, 
        assetName=assetName, 
        assetStructureVersion=assetStructureVersion, 
        hasTexture=hasTexture, 
        thumbnailKey=thumbnailKey)
    asset.save()

    for keyword in metadata["keywords"]:
        keyword = Keyword.objects.get_or_create(keyword=keyword.lower())
        asset.keywordsList.add(keyword)

    for commit in metadata["commitHistory"]:
        author = Author.objects.filter(pennkey=commit["author"]).first()
        if author is None:
            author = Author(pennkey=commit["author"], firstName="", lastName="")
            author.save()
            print(f"Author {commit['author']} not found, created new author.")
        version = commit["version"] 
        timestamp = datetime.fromisoformat(commit["timestamp"])
        note = commit["note"]
        commit = Commit(author=author, version=version, timestamp=timestamp, note=note, asset=asset)
        commit.save()

    variantSet = AssetVersion(id=uuid.uuid4(), versionName="Variant Set", filepath=assetFolder / f"{assetName}.usda", asset=asset)
    variantSet.save()
    lod0 = AssetVersion(id=uuid.uuid4(), versionName="LOD0", filepath=assetFolder / "LODs" / f"{assetName}_LOD0.usda", asset=asset)
    lod0.save()
    lod1 = AssetVersion(id=uuid.uuid4(), versionName="LOD1", filepath=assetFolder / "LODs" / f"{assetName}_LOD1.usda", asset=asset)
    lod1.save()
    lod2 = AssetVersion(id=uuid.uuid4(), versionName="LOD2", filepath=assetFolder / "LODs" / f"{assetName}_LOD2.usda", asset=asset)
    lod2.save()

