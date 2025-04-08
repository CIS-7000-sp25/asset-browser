import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { MetadataSchema, type Metadata, type VersionMap } from "@/lib/types";

const API_URL = "http://127.0.0.1:8000/api";

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

      const queryString = queryParams.toString()
        ? `?${queryParams.toString()}`
        : "";

      // Always make API call
      console.log(
        "[DEBUG] API: Making API call to:",
        `${API_URL}/assets${queryString}`
      );
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
      const responseVersionIds = await fetch(
        `${API_URL}/assets/${assetName}/`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!responseVersionIds.ok) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: responseVersionIds.statusText || "Failed to check in asset",
        });
      }

      const versionData = await responseVersionIds.json();
      const versionMap = versionData.version_map as VersionMap;

      console.log("version_map:", versionMap);
      metadata.versionMap = versionMap;

      // Metadata update, adds new AssetVersions based on Commit
      const responseMetadata = await fetch(
        `${API_URL}/metadata/${assetName}/`,
        {
          method: "POST",
          body: JSON.stringify(metadata),
        }
      );

      if (!responseMetadata.ok) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: responseMetadata.statusText || "Failed to check in asset",
        });
      }

      const data = await responseMetadata.json();
      return data;
    },
  }),
};
