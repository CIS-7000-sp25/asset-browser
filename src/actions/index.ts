import { MetadataSchema } from "@/lib/types";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { execFile } from "child_process";
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as unzipper from 'unzipper';
import type { AssetWithDetails } from "@/lib/types";


interface AssetCardProps {
  asset: AssetWithDetails;
}

const AssetCard = ({ asset }: AssetCardProps) => {
  // Now you can use asset.isCheckedOut anywhere inside
  console.log(asset.isCheckedOut); // true or false
}


// const API_URL = import.meta.env.DEV
//   ? "http://127.0.0.1:8000/api"
//   : "https://usd-asset-library.up.railway.app/api";
const API_URL = "https://usd-asset-library.up.railway.app/api";

const houdiniPath = process.env.HFS 
  ? path.win32.join(process.env.HFS, 'bin', 'houdini.exe'): null;
function findHoudiniPath(): string | null {

  const isWindows = os.platform() === 'win32';
  const programFiles = isWindows
    ? process.env.PROGRAMFILES || 'C:/Program Files'
    : '/Applications';
    // Base path for Houdini installation
    const basePath = isWindows
    ? path.join(programFiles, 'Side Effects Software')
    : path.join(programFiles, 'Houdini');

  
  // Here you'd need to scan for Houdini folders - just an example
  // In a real implementation, you'd use fs.readdirSync to scan the directory
  const possibleVersions = isWindows
  ? ['Houdini 20.5.550', 'Houdini 20.5.370', 'Houdini 20.5.410', 'Houdini 20.5.332'] : ['20.5.550', '20.5.370', '20.5.410', '20.5.332'];
  
  for (const version of possibleVersions) {
    const testPath = isWindows
    ? path.join(basePath, version, 'bin', 'houdini.exe')
    : path.join(
      basePath,
      `Houdini${version}`,
      `Houdini\ Apprentice\ ${version}.app`
    );
    if (fs.existsSync(testPath)) {
      return testPath; // Return the first match
    }
    else{
      console.log("File does not exist at the specified path.");
    }
    console.log(testPath);
  }
  
  return null;
}

function findHythonPath(): string | null {
  const isWindows = os.platform() === 'win32';
  const programFiles = isWindows
    ? process.env.PROGRAMFILES || 'C:/Program Files'
    : '/Applications';
  
    // Base path for Houdini installation
    const basePath = isWindows
    ? path.join(programFiles, 'Side Effects Software')
    : path.join(programFiles, 'Houdini');

  
  // Here you'd need to scan for Houdini folders - just an example
  // In a real implementation, you'd use fs.readdirSync to scan the directory
  const possibleVersions = isWindows
  ? ['Houdini 20.5.550', 'Houdini 20.5.370', 'Houdini 20.5.410', 'Houdini 20.5.332'] : ['20.5.550', '20.5.370', '20.5.410', '20.5.332'];  
  for (const version of possibleVersions) {
    const testPath = isWindows
    ? path.join(basePath, version, 'bin', 'hython.exe')
    : path.join(
      basePath,
      `Houdini ${version}`,
      `Houdini\ Apprentice\ ${version}.app`
    );
    if (fs.existsSync(testPath)) {
      return testPath; // Return the first match
    }
    else{
      console.log("File does not exist at the specified path.");
    }
  }
  
  return null;
}

function writePythonHipFile(filePath:string, assetName:string, checkedOut: boolean, hdaPath: string, outputHipFile: string) {

const content = `
import hou
import os

def process_hip_file(input_file, output_file, modifications_func):
    """
    Open a Houdini file, apply modifications, and save it as a new file.
    
    Args:
        input_file (str): Path to the input .hip file
        output_file (str): Path where the modified file will be saved
        modifications_func (callable): Function that will perform modifications
    """
    # Check if input file exists
    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file not found: {input_file}")
    
    # Make sure output directory exists
    output_dir = os.path.dirname(output_file)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Load the hip file
    hou.hipFile.load(input_file)
    
    # Apply the modifications
    modifications_func()
    
    # Save the modified file
    hou.hipFile.save(output_file)
    print(f"File saved: {output_file}")

def change_controller():
    
    # Get the node
    node_path = "/obj/STAGE/CONTROLLER"
    node = hou.node(node_path)
    if node is None:
        raise ValueError(f"Node not found: {node_path}")
    
    # Check if the parameter exists
    parameter_name = "assetName"
    param = node.parm(parameter_name)
    if param is None:
        raise ValueError(f"Parameter '{parameter_name}' not found on node {node_path}")
    
    # Set the new value
    param.set("`+assetName+`")

    checked_out = " & pyCheckedOut & "

    parm_group = node.parmTemplateGroup()
    bool_parm = hou.ToggleParmTemplate("checked_out", "Checked Out", default_value=checked_out)

    # Add the parameter to the node
    parm_group.append(bool_parm)
    node.setParmTemplateGroup(parm_group)
    

# Example usage
if __name__ == "__main__":
    
    process_hip_file(r"`+hdaPath+`", r"`+outputHipFile+`", change_controller)
`;

  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error("Error writing to Python file:", err);
      return;
    }
    console.log("Python file written successfully at:", filePath);
  });

}

export const server = {
  getAssets: defineAction({
    input: z
      .object({
        search: z.string().optional(),
        author: z.string().optional(),
        checkedInOnly: z.boolean().optional(),
        sortBy: z.string().optional(),
      })
      .optional(),
    handler: async (input) => {
      const params = input;

      console.log("[DEBUG] API: getAssets called with params:", params);

      // Build query string from params
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append("search", params.search);
      if (params?.author) queryParams.append("author", params.author);
      if (params?.checkedInOnly) queryParams.append("checkedInOnly", "true");
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

      // Always make API call
      console.log("[DEBUG] API: Making API call to:", `${API_URL}/assets${queryString}`);
      const response = await fetch(`${API_URL}/assets${queryString}`);

      if (!response.ok) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch assets: ${response.statusText}`,
        });
      }

      const data = await response.json();
      //console.log("[DEBUG] API: Received response:", data);
      return data;
    },
  }),

  getAsset: defineAction({
    input: z.object({ assetName: z.string() }),
    handler: async ({ assetName }) => {
      console.log("[DEBUG] API: assetName type:", typeof assetName);

      const response = await fetch(`${API_URL}/assets/${assetName}`);
      if (!response.ok) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch asset details",
        });
      }

      const data = await response.json();
      return data;
    },
  }),

  createAsset: defineAction({
    accept: "form",
    input: z.object({
      assetName: z.string(),
      version: z.string(),
      file: z.instanceof(File),
    }),
    handler: async ({ assetName, version, file }) => {
      console.log("[DEBUG] API: assetName type:", typeof assetName);
      console.log("[DEBUG] API: API URL:", API_URL);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("version", version);

      const response = await fetch(`${API_URL}/assets/${assetName}/upload/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: response.statusText
            ? `Failed to create asset. Error message: ${response.statusText}`
            : "Failed to create asset",
        });
      }
    },
  }),

  checkoutAsset: defineAction({
    input: z.object({ assetName: z.string(), pennKey: z.string() }),
    handler: async ({ assetName, pennKey }) => {
      const response = await fetch(`${API_URL}/assets/${assetName}/checkout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Note: backend expects 'pennkey' not 'pennKey' (lowercase "K")
        body: JSON.stringify({ pennkey: pennKey }),
      });

      if (!response.ok) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: response.statusText || "Failed to check out asset",
        });
      }

      const data = await response.json();
      return data;
    },
  }),

  checkinAsset: defineAction({
    accept: "form",
    input: z.object({
      assetName: z.string(),
      pennKey: z.string(),
      file: z.instanceof(File), // used to be an array, now just one because ZIP
      metadata: MetadataSchema,
    }),
    handler: async ({ assetName, pennKey, file, metadata }) => {
      const formData = new FormData();
      formData.append("file", file);

      // S3 update, currently does not return version IDs - instead writes to a assetName/version/file path
      const response = await fetch(`${API_URL}/assets/${assetName}/checkin/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: response.statusText || "Failed to check in asset",
        });
      }

      // TO DO: Handle metadata updates and version ID control should it happen

      const data = await response.json();
      return data;
    },
  }),

  downloadAsset: defineAction({
    input: z.object({
      assetName: z.string(),
    }),
    handler: async ({ assetName }) => {
      console.log("[DEBUG] downloadAsset called with assetName:", assetName);

      // Call API in both development and production
      console.log("[DEBUG] Making API call to:", `${API_URL}/assets/${assetName}/download`);
      const response = await fetch(`${API_URL}/assets/${assetName}/download`);

      if (!response.ok) {
        console.log("[DEBUG] Error occurred! API response status code:", response.status);

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to download asset",
        });
      }

      // Get the blob from the response
      const blob = await response.blob();
      console.log("[DEBUG] Received blob of size:", blob.size);

      // Action handlers don't support directly returning blobs. See https://github.com/rich-harris/devalue
      const arrayBuffer = await blob.arrayBuffer();
      return arrayBuffer;
    },
  }),

  launchDCC: defineAction({
    input: z.object({
      assetName: z.string(),
    }),
    handler: async ({ assetName }) => {
      console.log("[DEBUG] API: launchDCC called");

      const exePath = findHoudiniPath();

      ; // Replace with the actual path to the .exe file
      console.log("[DEBUG] final exePath:", exePath);

      const assetZip = os.homedir()+"\\Downloads\\"+ assetName + ".zip"
      const outputDir = os.homedir()+"\\Downloads\\assetImport\\";
      
      // if the zip file exists
      if (fs.existsSync(assetZip)) {
        
        if (!fs.existsSync(outputDir)) {
          // unzip the file
          fs.createReadStream(assetZip)
            .pipe(unzipper.Extract({ path: outputDir }))
            .on('close', () => {
              console.log('Extraction complete.');
            })

            .on('error', () => {
              console.error('Error during extraction:');
          });
        }

        const houdiniFile = path.join(outputDir, assetName + ".fbx");

        const hythonExe = findHythonPath();
        console.log("[DEBUG] hythonExe path:", hythonExe);
             
        // create python generation file here
        const hdaPath = "C:/users/0cfer/Downloads/houdini_usd_template_v03.hipnc";

        const res = await fetch(`${API_URL}/assets/${assetName}`);
        const json = await res.json();
        const isCheckedOut = json.asset?.isCheckedOut ?? false;

        const outputHipFile = os.homedir()+'\\Downloads\\generated_scene.hip';

        writePythonHipFile(process.cwd()+"\\writtenPythonScript.py",assetName,isCheckedOut,hdaPath,outputHipFile);
        const pythonScript = process.cwd() + "\\writtenPythonScript.py";

        //const mayaPath = "C:/Program Files/Autodesk/Maya2025/bin/maya.exe";
        //const mayaFile = "C:/users/0cfer/Downloads/crystal_model_v001.ma";
        /*
        execFile(mayaPath, [mayaFile], (error, stdout, stderr) => {
          if (error) {
            console.error(`Error running Hython: ${error.message}`);
            return;
          }
          
          if (stderr && stderr.trim()) {
            console.error(`Hython stderr: ${stderr}`);
          }
          
          if (stdout && stdout.trim()) {
            console.log(`Hython stdout: ${stdout}`);
          }
          
          console.log(`Maya opened successfully at: ${mayaPath}`);
        });
        */

        if (hythonExe) {
          execFile(hythonExe, [pythonScript, outputHipFile], (error, stdout, stderr) => {
            if (error) {
              console.error(`Error running Hython: ${error.message}`);
              return;
            }
            
            if (stderr && stderr.trim()) {
              console.error(`Hython stderr: ${stderr}`);
            }
            
            if (stdout && stdout.trim()) {
              console.log(`Hython stdout: ${stdout}`);
            }
            
            console.log(`Hip file generated successfully at: ${outputHipFile}`);
          });
        }
        if (exePath) {
          execFile(exePath, [outputHipFile], (error, stdout, stderr) => {
            if (error) {
              console.error("[ERROR] Failed to launch .exe:", error);
              throw new ActionError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Failed to launch application: ${error.message}`,
              });
            }
    
            console.log("[DEBUG] Application launched successfully. Output:", stdout);
          
          });
        }
      }
      else {

        // TODO: output message to the user to download the asset first
        console.log("File does not exist at the specified path.");
      }

      return { message: "Application launched successfully" };

    },
}),

  getAuthors: defineAction({
    input: undefined,
    handler: async () => {
      console.log("[DEBUG] API: getAuthors called");

      // TODO
      throw new ActionError({
        code: "FORBIDDEN",
        message: "To do",
      });
    },
  }),
};
