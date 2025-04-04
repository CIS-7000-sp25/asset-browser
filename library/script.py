import os
from library.models import Asset, AssetVersion, Commit, Keyword, Author
from datetime import datetime
from dateutil import parser
import uuid
from pathlib import Path
import json
import subprocess
from django.conf import settings

folder_path = Path("C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets")

class Script:
    
    def runFileCrawler(self):
        self.addAuthors()
        for assetFolder in folder_path.iterdir():
            with (assetFolder / "metadata.json").open('r') as f:
                # print("Processing", assetFolder)
                metadata = json.load(f)
                
                id = uuid.uuid4()
                assetName = metadata["assetName"]
                if assetName[-4:] == ".fbx":
                    assetName = assetName[:-4]
                assetStructureVersion = metadata["assetStructureVersion"]
                hasTexture = metadata["hasTexture"]
                thumbnailKey = f"{assetName}/thumbnail.png"
                print(f"asset = Asset(id=uuid.uuid4(), assetName=\"{assetName}\", assetStructureVersion=\"{assetStructureVersion}\", hasTexture=\"{hasTexture}\", thumbnailKey=\"{thumbnailKey}\")")
                print("asset.save()")
                asset = Asset(id=id, assetName=assetName, assetStructureVersion=assetStructureVersion, hasTexture=hasTexture, thumbnailKey=thumbnailKey)
                asset.save()
                for keyword in metadata["keywords"]:
                    print(f"keyword, created = Keyword.objects.get_or_create(keyword=\"{keyword.lower()}\")")
                    print("asset.keywordsList.add(keyword)")
                    keyword, created = Keyword.objects.get_or_create(keyword=keyword.lower())
                    asset.keywordsList.add(keyword)

                for commit in metadata["commitHistory"]:
                    author = Author.objects.filter(pennkey=commit["author"]).first()
                    print(f"author = Author.objects.filter(pennkey=\"{commit['author']}\").first()")
                    if author is None:
                        print(f"author = Author(pennkey=\"{commit['author']}\", firstName='', lastName='')")
                        print("author.save()")
                        author = Author(pennkey=commit["author"], firstName="", lastName="")
                        author.save()
                        #print(f"Author {commit['author']} not found, created new author.")
                    version = commit["version"] 
                    timestamp = datetime.fromisoformat(commit["timestamp"])
                    note = commit["note"]
                    print(f"commit = Commit(author=author, version=\"{version}\", timestamp=parser.parse(\"{timestamp}\"), note=\"{note}\", asset=asset)")
                    print("commit.save()")
                    commit = Commit(author=author, version=version, timestamp=timestamp, note=note, asset=asset)
                    commit.save()

                print(f"variantSet = AssetVersion(id=uuid.uuid4(), versionName='Variant Set', filepath={'./' + f'{assetName}.usda'}, asset=asset)")
                print("variantSet.save()")
                print(f"lod0 = AssetVersion(id=uuid.uuid4(), versionName='LOD0', filepath={'./LODs/' + f'{assetName}_LOD0.usda'}, asset=asset)")
                print("lod0.save()")
                print(f"lod1 = AssetVersion(id=uuid.uuid4(), versionName='LOD1', filepath={'./LODs/' + f'{assetName}_LOD1.usda'}, asset=asset)")
                print("lod1.save()")
                print(f"lod2 = AssetVersion(id=uuid.uuid4(), versionName='LOD2', filepath={'./LODs/' + f'{assetName}_LOD2.usda'}, asset=asset)")
                print("lod2.save()")
                variantSet = AssetVersion(id=uuid.uuid4(), versionName="Variant Set", filepath=assetFolder / f"{assetName}.usda", asset=asset)
                variantSet.save()
                lod0 = AssetVersion(id=uuid.uuid4(), versionName="LOD0", filepath=assetFolder / "LODs" / f"{assetName}_LOD0.usda", asset=asset)
                lod0.save()
                lod1 = AssetVersion(id=uuid.uuid4(), versionName="LOD1", filepath=assetFolder / "LODs" / f"{assetName}_LOD1.usda", asset=asset)
                lod1.save()
                lod2 = AssetVersion(id=uuid.uuid4(), versionName="LOD2", filepath=assetFolder / "LODs" / f"{assetName}_LOD2.usda", asset=asset)
                lod2.save()

    def addAuthors(self):
        Author.objects.all().delete()
        
        author = Author(pennkey="willcai", firstName="Will", lastName="Cai")
        author.save()
        author = Author(pennkey="eschou", firstName="Elyssa", lastName="Chou")
        author.save()
        author = Author(pennkey="fernc", firstName="Caroline", lastName="Fernandes")
        author.save()
        author = Author(pennkey="geant", firstName="Anthony", lastName="Ge")
        author.save()
        author = Author(pennkey="jyguan", firstName="Jackie", lastName="Guan")
        author.save()
        author = Author(pennkey="aajiang", firstName="Aaron", lastName="Jiang")
        author.save()
        author = Author(pennkey="raclin", firstName="Rachel", lastName="Lin")
        author.save()
        author = Author(pennkey="liuamy05", firstName="Amy", lastName="Liu")
        author.save()
        author = Author(pennkey="claran", firstName="Clara", lastName="Nolan")
        author.save()
        author = Author(pennkey="soominp", firstName="Jacky", lastName="Park")
        author.save()
        author = Author(pennkey="chuu", firstName="Christina", lastName="Qiu")
        author.save()
        author = Author(pennkey="czw", firstName="Charles", lastName="Wang")
        author.save()
        author = Author(pennkey="cxndy", firstName="Cindy", lastName="Xu")
        author.save()


    def runAddAsset(self, assetName, assetStructureVersion, hasTexture, thumbnailFilepath, keywords, rootFolder):
        id = uuid.uuid4()
        asset = Asset(id=id, assetName=assetName, assetStructureVersion=assetStructureVersion, hasTexture=hasTexture, thumbnailFilepath=thumbnailFilepath)
        asset.save()
        for keyword in keywords:
            keyword, created = Keyword.objects.get_or_create(keyword=keyword.lower())
            asset.keywordsList.add(keyword)

            variantSet = AssetVersion(id=uuid.uuid4(), versionName="Variant Set", filepath=rootFolder + f"//{assetName}.usda", asset=asset)
            variantSet.save()
            lod0 = AssetVersion(id=uuid.uuid4(), versionName="LOD0", filepath=rootFolder + "//LODs" + f"//{assetName}_LOD0.usda", asset=asset)
            lod0.save()
            lod1 = AssetVersion(id=uuid.uuid4(), versionName="LOD1", filepath=rootFolder + "//LODs" + f"//{assetName}_LOD1.usda", asset=asset)
            lod1.save()
            lod2 = AssetVersion(id=uuid.uuid4(), versionName="LOD2", filepath=rootFolder + "//LODs" + f"//{assetName}_LOD2.usda", asset=asset)
            lod2.save()
    
    def runPrintAsset(self, assetName):
        asset = Asset.objects.filter(assetName=assetName)[0]
        print("Name: " + asset.assetName)
        print("Structure Version: " + asset.assetStructureVersion)
        print("Has Texture: " + str(asset.hasTexture))
        print("Keywords: " + str(asset.keywordsList.all()))
        print("Thumbnail Filepath: " + str(asset.thumbnailFilepath))

    def runGetAsset(self, assetName):
        return AssetVersion.objects.filter(asset__assetName=assetName).filter(versionName="Variant Set")[0].filepath
    
    def runGetAssetInBlender(self, assetName):
        filepath = self.runGetAsset(assetName)
        filepath = "/".join(filepath.split("\\"))
        subprocess.run(["C:\\Program Files\\Blender Foundation\\Blender 4.3\\blender.exe",
                        "--python-expr",
                        f"import bpy\nbpy.ops.wm.usd_import(filepath='{filepath}')"])