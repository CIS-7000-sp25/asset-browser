import { toast } from "@/components/ui/use-toast";
import type { Metadata, VersionMap } from "@/lib/types";
import { Value } from "@radix-ui/react-select";

// Types based on schemas
export interface Asset {
  assetName: string; // Changed from assetId
  keywords: string[];
  checkedOut: boolean;
  latestCommitId: string; // Changed from number to string
  lastApprovedId: string; // Changed from number to string
  // Frontend-specific properties
  thumbnailUrl: string; // Will come from S3 in production
}

export interface Commit {
  commitId: string; // Changed from number to string
  pennKey: string; // Author's pennKey
  versionNum: string;
  notes: string; // Updated from description
  prevCommitId: string | null; // Updated from number to string
  commitDate: string;
  hasMaterials: boolean;
  state: string[]; // Added from schema
}

export interface User {
  pennId: string;
  fullName: string;
}

// Combined asset data for frontend display
export interface AssetWithDetails {
  name: string;
  thumbnailUrl: string;
  version: string;
  creator: string;
  lastModifiedBy: string;
  checkedOutBy: string | null;
  isCheckedOut: boolean;
  materials: boolean;
  keywords: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

const mockUsers: User[] = [
  { pennId: "willcai", fullName: "Will Cai" },
  { pennId: "chuu", fullName: "Christina Qiu" },
  { pennId: "cxndy", fullName: "Cindy Xu" },
];

const mockCommits: Commit[] = Array.from({ length: 50 }, (_, i) => ({
  commitId: (i + 1).toString(),
  pennKey: mockUsers[i % 3].pennId,
  versionNum: `0${Math.floor(i / 10) + 1}.${Math.floor(i % 5)}.00`,
  notes: `Update to asset ${Math.floor(i / 2) + 1}`,
  prevCommitId: i === 0 ? null : i.toString(),
  commitDate: new Date(Date.now() - (i + 1) * 43200000).toISOString(),
  hasMaterials: i % 3 === 0,
  state: [],
}));

const mockAssets: Asset[] = Array.from({ length: 20 }, (_, i) => {
  const assetCommits = mockCommits.filter((c) =>
    c.notes.includes(`asset ${i + 1}`)
  );
  const latestCommit = assetCommits.length > 0 ? assetCommits[0] : null;

  return {
    assetName: `mockAsset${i + 1}`,
    keywords: [
      "3D",
      "Model",
      "Character",
      "Environment",
      "Prop",
      "Texture",
      "Animation",
    ].filter((_, ki) => ki % ((i % 3) + 2) === 0),
    checkedOut: i % 5 === 0,
    latestCommitId: latestCommit?.commitId || "0",
    lastApprovedId: latestCommit?.commitId || "0",
    thumbnailUrl: `https://placekitten.com/400/${300 + (i % 5) * 10}`,
  };
});

// Helper function to get user's full name by pennId
const getUserFullName = (pennId: string | null): string | null => {
  if (!pennId) return null;
  const user = mockUsers.find((u) => u.pennId === pennId);
  return user ? user.fullName : null;
};

// Helper function to get commit by commitId
const getCommitById = (commitId: string): Commit | null => {
  return mockCommits.find((c) => c.commitId === commitId) || null;
};

// Function to combine asset, commit, and user data for frontend
const getAssetWithDetails = (asset: Asset): AssetWithDetails => {
  const latestCommit = getCommitById(asset.latestCommitId);
  const creatorCommit = mockCommits
    .filter((c) => c.notes.includes(`asset ${asset.assetName}`))
    .pop(); // Get the oldest commit for this asset

  // Store the user's pennId (not full name) as checkedOutBy when checked out
  let checkedOutByPennId = null;
  if (asset.checkedOut) {
    // Find the user who last modified the asset
    checkedOutByPennId = latestCommit?.pennKey || null;
  }

  return {
    name: asset.assetName,
    thumbnailUrl: asset.thumbnailUrl,
    version: latestCommit?.versionNum || "01.00.00",
    creator: getUserFullName(creatorCommit?.pennKey || null) || "Unknown",
    lastModifiedBy: getUserFullName(latestCommit?.pennKey || null) || "Unknown",
    checkedOutBy: checkedOutByPennId, // Store pennId instead of fullName
    isCheckedOut: asset.checkedOut,
    materials: latestCommit?.hasMaterials || false,
    keywords: asset.keywords,
    description: latestCommit?.notes || "No description available",
    createdAt: creatorCommit?.commitDate || new Date().toISOString(),
    updatedAt: latestCommit?.commitDate || new Date().toISOString(),
  };
};

// Function to simulate API loading delay
const simulateApiDelay = async (ms = 100) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// API functions that would connect to Express backend
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const api = {
  // Check in an asset
  async checkinAsset(
    assetName: string,
    pennId: string,
    files: File[],
    metadata: Metadata
  ) {
    try {
      const formData = new FormData();

      for (const file in files) {
        formData.append("files", file);
      }

      // S3 update, returns Version IDs
      const response_version_ids = await fetch(
        `${API_URL}/assets/${assetName}/`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response_version_ids.ok) {
        const error = await response_version_ids.json();
        throw new Error(error.error || "Failed to check in asset");
      }

      const version_data = await response_version_ids.json();
      const version_map = version_data.version_map as VersionMap;
      console.log("version_map:", version_map);
      metadata.versionMap = version_map;

      // Metadata update, adds new AssetVersions based on Commit
      const response = await fetch(`${API_URL}/metadata/${assetName}/`, {
        method: "POST",
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to check in asset");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to check in asset ${assetName}:`, error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to check in asset.",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Download a copy of the asset
  async downloadAsset(assetName: string) {
    console.log("[DEBUG] api.downloadAsset called with assetName:", assetName);
    try {
      // Call API in both development and production
      console.log(
        "[DEBUG] Making API call to:",
        `${API_URL}/assets/${assetName}/download`
      );
      const response = await fetch(`${API_URL}/assets/${assetName}/download`);
      console.log("[DEBUG] API response status:", response.status);
      if (!response.ok) throw new Error("Failed to download asset");

      // Get the blob from the response
      const blob = await response.blob();
      console.log("[DEBUG] Received blob of size:", blob.size);

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      console.log("[DEBUG] Created blob URL");

      // Create a link and click it to download the file
      const link = document.createElement("a");
      link.href = url;
      link.download = `${assetName}.zip`;
      document.body.appendChild(link);
      link.click();
      console.log("[DEBUG] Triggered download");

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      console.log("[DEBUG] Cleaned up resources");

      toast({
        title: "Download Complete",
        description: "Asset has been downloaded.",
      });

      return { success: true };
    } catch (error) {
      console.error(`[DEBUG] Failed to download asset ${assetName}:`, error);
      toast({
        title: "Error",
        description: "Failed to download asset. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  },

  async launchDCC(assetName: string) {
    try {
      // For now, just show a toast notification

      toast({
        title: "Launching Application",
        description: `Opening asset ${assetName} in the content creation app.`,
      });

      return { success: true };
    } catch (error) {
      console.error(`Failed to launch DCC for asset ${assetName}:`, error);
      toast({
        title: "Error",
        description: "Failed to launch application. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get all unique authors from assets
  async getAuthors() {
    try {
      console.log("[DEBUG] API: getAuthors called");

      // Use mock data
      const assetsWithDetails = mockAssets.map(getAssetWithDetails);

      // Extract unique authors (creators and last modifiers)
      const authors = new Set<string>();
      assetsWithDetails.forEach((asset) => {
        if (asset.creator) authors.add(asset.creator);
        if (asset.lastModifiedBy) authors.add(asset.lastModifiedBy);
      });

      const authorsList = Array.from(authors);
      console.log("[DEBUG] API: Returning authors:", authorsList);

      return { authors: authorsList };
    } catch (error) {
      console.error("[ERROR] API: Failed to fetch authors:", error);
      return { authors: [] };
    }
  },
};
