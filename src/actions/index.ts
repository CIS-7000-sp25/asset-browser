import { MetadataSchema, type VersionMap } from "@/lib/types";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);

const API_URL = "https://usd-asset-library.up.railway.app/api";

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
      console.log("[DEBUG] API: Received response:", data);
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
    input: z.object({
      assetName: z.string(),
      pennKey: z.string(),
      files: z.instanceof(File).array(),
      metadata: MetadataSchema,
    }),
    handler: async ({ assetName, pennKey, files, metadata }) => {
      const formData = new FormData();

      for (const file in files) {
        formData.append("files", file);
      }

      // S3 update, returns Version IDs
      const responseVersionIds = await fetch(`${API_URL}/assets/${assetName}/`, {
        method: "POST",
        body: formData,
      });

      if (!responseVersionIds.ok) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: responseVersionIds.statusText
            ? `Failed to check in asset. Error message: ${responseVersionIds.statusText}`
            : "Failed to check in asset",
        });
      }

      const versionData = await responseVersionIds.json();
      const versionMap = versionData.version_map as VersionMap;

      console.log("version_map:", versionMap);
      metadata.versionMap = versionMap;

      // Metadata update, adds new AssetVersions based on Commit
      const responseMetadata = await fetch(`${API_URL}/metadata/${assetName}/`, {
        method: "POST",
        body: JSON.stringify(metadata),
      });

      if (!responseMetadata.ok) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: responseMetadata.statusText
            ? `Failed to check in asset. Error message: ${responseMetadata.statusText}`
            : "Failed to check in asset",
        });
      }

      const data = await responseMetadata.json();
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
      console.log("[DEBUG] API: launchDCC called for", assetName);
  
      // full path to the asset to open in Houdini
      const assetPath = C:\\path\\to\\asset\\${assetName}.hiplc;
  
      // path to the Houdini executable
      const houdiniPath = "C:\\Program Files\\Side Effects Software\\Houdini 20.0.653\\bin\\houdini.exe";
  
      // command to run
      const command = ${houdiniPath} "${assetPath}";
  
      try {
        await execAsync(command);
        console.log("Houdini launched successfully.");
      } catch (error) {
        console.error("Error launching Houdini:", error);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to launch Houdini",
        });
      }
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
