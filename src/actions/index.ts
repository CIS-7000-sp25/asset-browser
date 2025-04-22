import { findHoudiniPath, findHythonPath, writePythonHipFile } from "@/lib/launch-dcc";
import { MetadataSchema, type GetUserBody, type GetUsersBody } from "@/lib/types";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { execFile } from "child_process";
//import jwt_decode from 'jwt-decode';
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as unzipper from "unzipper";

const API_URL = import.meta.env.DEV
  ? "http://127.0.0.1:8000/api"
  : "https://usd-asset-library.up.railway.app/api";

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
        method: "POST",
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

      const data = await response.json();
      return data;
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

  verifyAsset: defineAction({
    accept: "form",
    input: z.object({
      assetName: z.string(),
      file: z.instanceof(File),
    }),
    handler: async ({ assetName, file }) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/assets/${assetName}/verify/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        return false;
      }

      const results = await response.json();

      return results;
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

      const exePath = findHoudiniPath(); // Replace with the actual path to the .exe file

      console.log("[DEBUG] final exePath:", exePath);

      const assetZip = os.homedir() + "\\Downloads\\" + assetName + ".zip";
      const outputDir = os.homedir() + "\\Downloads\\" + assetName + "\\";

      // if the zip file exists
      if (fs.existsSync(assetZip)) {
        if (!fs.existsSync(outputDir)) {
          // unzip the file
          fs.createReadStream(assetZip)
            .pipe(unzipper.Extract({ path: outputDir }))
            .on("close", () => {
              console.log("Extraction complete.");
            })

            .on("error", () => {
              console.error("Error during extraction:");
            });
        }

        const houdiniFile = path.join(outputDir, assetName + ".fbx");

        const hythonExe = findHythonPath();
        console.log("[DEBUG] hythonExe path:", hythonExe);

        // create python generation file here

        writePythonHipFile(process.cwd() + "\\writtenPythonScript.py", assetName);
        const pythonScript = process.cwd() + "\\writtenPythonScript.py";
        const outputHipFile = outputDir + "generated_scene.hip";

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
      } else {
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

  getUsers: defineAction({
    input: undefined,
    handler: async () => {
      const response = await fetch(`${API_URL}/users/`, { method: "GET" });

      if (!response.ok) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to fetch all users! " +
            (response.statusText.length > 0 ? response.statusText : ""),
        });
      }

      const data = (await response.json()) as GetUsersBody;
      return data;
    },
  }),

  getUser: defineAction({
    input: z.object({
      pennKey: z.string(),
      recentCommits: z.number().optional(),
    }),
    handler: async ({ pennKey, recentCommits }) => {
      const recentCommitsParam = recentCommits ? `?recent_commits=${recentCommits}` : "";
      const response = await fetch(`${API_URL}/users/${pennKey}/${recentCommitsParam}`, {
        method: "GET",
      });

      if (!response.ok) {
        console.log(
          `[DEBUG] Could not get user "${pennKey}" with recent_commits = ${recentCommits}, status code: ${response.status}`
        );

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get user! ${
            response.statusText.length > 0 ? response.statusText : ""
          }`,
        });
      }

      const data = (await response.json()) as GetUserBody;
      return data;
    },
  }),

  downloadGlb: defineAction({
    input: z.object({
      assetName: z.string(),
    }),
    handler: async ({ assetName }) => {
      const response = await fetch(`${API_URL}/assets/${assetName}/download/glb/`, {
        method: "GET",
      });

      if (!response.ok) {
        console.log("[DEBUG] downloadGlb(): failed to download .glb file");
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to download .glb file for "${assetName}!" ${
            response.statusText.length > 0 ? response.statusText : `Code: ${response.status}`
          }`,
        });
      }

      const data = await response.arrayBuffer();
      return data;
    },
  }),

  storeLoginTokens: defineAction({
    accept: "form",
    input: z.object({
      username: z.string(),
      password: z.string(),
    }),
    handler: async ({ username, password }) => {

      const response = await fetch(`${API_URL}/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "username": username,
          "password": password,
        }),
      });

      if (!response.ok) {
        console.log("[DEBUG] getLoginToken(): failed to get login token");
        if (response.status === 401) {
          throw new ActionError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }
      }

      const data = await response.json();
      
      return data;
    }
  }),

  // move out of local storage 
  refreshToken: defineAction({
    accept: "form",
    input: z.object({
      refreshToken: z.string(),
    }),
    handler: async ({ refreshToken }) => {

      const response = await fetch(`${API_URL}/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "refresh": refreshToken,
        }),
      });

      if (!response.ok) {
        console.log("[DEBUG] refreshToken(): failed to get access token");
        if (response.status === 401) {
          console.log("Refresh token expired. Please log in again.")
          return "";
        }
      }

      const data = await response.json();
      
      return data.access;
    }
  }),

};
