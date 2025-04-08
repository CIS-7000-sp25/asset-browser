import { useEffect, useState } from "react";
import type { AssetWithDetails } from "../../services/api";
import { api } from "../../services/api";
import { Separator } from "../ui/separator";
import { toast } from "../ui/use-toast";

import AssetControlPanel from "../asset-detail/AssetControlPanel";
import AssetDetailHeader from "../asset-detail/AssetDetailHeader";
import AssetDetailSkeleton from "../asset-detail/AssetDetailSkeleton";
import AssetMetadata from "../asset-detail/AssetMetadata";
import AssetNotFound from "../asset-detail/AssetNotFound";
import AssetPreview from "../asset-detail/AssetPreview";
import { type Metadata } from "@/lib/types";
import { actions } from "astro:actions";

interface AssetDetailPageProps {
  assetName: string;
}

const AssetDetailPage = ({ assetName }: AssetDetailPageProps) => {
  const [asset, setAsset] = useState<AssetWithDetails | null>(null);
  const [userFiles, setUserFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState<Metadata>({
    hi: "empty",
  } as unknown as Metadata);
  const [isLoading, setIsLoading] = useState(true);

  // Mock user for demonstration purposes
  const user = { pennId: "willcai", fullName: "Will Cai" };

  // Helper function to get user full name
  const getUserFullName = (pennId: string | null): string | null => {
    if (!pennId) return null;
    // This should match the mockUsers logic in the API
    const mockUsers = [
      { pennId: "willcai", fullName: "Will Cai" },
      { pennId: "chuu", fullName: "Christina Qiu" },
      { pennId: "cxndy", fullName: "Cindy Xu" },
    ];
    const user = mockUsers.find((u) => u.pennId === pennId);
    return user ? user.fullName : null;
  };

  const handleUserFilesChange = (newFiles: File[]) => {
    console.log("User files changed:", newFiles);
    setUserFiles(newFiles);
  };

  const handleMetadataChange = (newMetadata: Metadata) => {
    console.log("Metadata changed:", newMetadata);
    setMetadata(metadata);
  };

  const fetchAsset = async () => {
    if (!assetName) {
      console.error("Cannot fetch asset: No assetName provided");
      setIsLoading(false);
      return;
    }

    console.log("Fetching asset with name:", assetName);
    setIsLoading(true);

    const { data, error } = await actions.getAsset({ assetName });

    if (error) {
      console.error("Error fetching asset:", error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to load asset details. Please try again.",
        variant: "destructive",
      });
    } else {
      console.log("API response:", data);
      setAsset(data.asset);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("AssetDetailPage - Asset name changed:", assetName);
    console.log("AssetDetailPage - Asset name type:", typeof assetName);

    if (!assetName) {
      console.error("AssetDetailPage - No assetName provided");
      return;
    }
    fetchAsset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetName]);

  const handleCheckout = async () => {
    if (!assetName || !user || !asset) return;

    const { data, error } = await actions.checkoutAsset({
      assetName,
      pennKey: user.pennId,
    });

    if (error) {
      console.error("Error checking out asset:", error.message);
      toast({
        title: "Checkout Error",
        description: `Failed to check out asset "${assetName}". Please try again.`,
        variant: "destructive",
      });
    } else {
      const { asset: updatedAsset, downloadUrl } = data;

      setAsset(updatedAsset);
      toast({
        title: "Asset Checked Out",
        description: `You have successfully checked out ${asset.name}.`,
      });

      // Automatically download the asset
      if (downloadUrl) {
        console.log(`Downloading asset from ${downloadUrl}`);

        try {
          // Make a fetch request to download the asset
          const apiUrl = "http://localhost:5000";
          const downloadResponse = await fetch(`${apiUrl}${downloadUrl}`);

          if (!downloadResponse.ok) {
            throw new Error("Failed to download asset");
          }

          // Get the blob from the response
          const blob = await downloadResponse.blob();

          // Create a URL for the blob
          const url = window.URL.createObjectURL(blob);

          // Create a link and click it to download the file
          const link = document.createElement("a");
          link.href = url;
          link.download = `${asset.name}.zip`;
          document.body.appendChild(link);
          link.click();

          // Clean up
          window.URL.revokeObjectURL(url);
          document.body.removeChild(link);
        } catch (downloadError) {
          console.error("Error downloading asset:", downloadError);
          toast({
            title: "Download Error",
            description: "Failed to download the asset. Please try again.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleCheckIn = async () => {
    console.log("It's time to check in.");

    if (
      !assetName ||
      !user ||
      !asset ||
      !metadata ||
      userFiles.length === 0 ||
      !metadata
    )
      return;

    console.log("good job on making it this far");
    console.log(`Metadata: ${metadata}`);
    console.log(`Files: ${userFiles}`);
    console.log("Asset name:", assetName);
    console.log("User:", user);

    const { data, error } = await actions.checkinAsset({
      assetName,
      pennKey: user.pennId,
      files: userFiles,
      metadata,
    });

    if (error) {
      console.error("Error checking in asset:", error.message);
      toast({
        title: "Check-in Error",
        description: `Failed to check in the asset. Please try again. Error message: ${error.message}`,
        variant: "destructive",
      });
    } else {
      setAsset(data.asset);
      toast({
        title: "Asset Checked In",
        description: `You have successfully checked in ${asset.name}.`,
        variant: "default",
      });
    }
  };

  const handleDownload = async () => {
    console.log("[DEBUG] handleDownload called with assetName:", assetName);
    if (!assetName) {
      console.log("[DEBUG] No assetName provided, returning early");
      return;
    }

    try {
      console.log("[DEBUG] Calling api.downloadAsset");
      await api.downloadAsset(assetName);
      console.log("[DEBUG] api.downloadAsset completed successfully");
    } catch (error) {
      console.error("[DEBUG] Error in handleDownload:", error);
      toast({
        title: "Download Error",
        description: "Failed to download the asset. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Back button handler
  const handleBack = () => {
    window.history.back();
  };

  if (isLoading) {
    return <AssetDetailSkeleton />;
  }

  if (!asset) {
    return <AssetNotFound />;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <AssetDetailHeader title={asset.name} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <AssetPreview asset={asset} />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <AssetControlPanel
            asset={asset}
            canCheckout={!asset.isCheckedOut && !!user}
            canCheckin={
              asset.isCheckedOut && !!user && asset.checkedOutBy === user.pennId
            }
            onCheckout={handleCheckout}
            onCheckin={handleCheckIn}
            onDownload={handleDownload}
            onFilesChange={handleUserFilesChange}
            onMetadataChange={handleMetadataChange}
            onLaunchDCC={() =>
              window.open(
                `/asset-preview?name=${encodeURIComponent(asset.name)}`,
                "_blank"
              )
            }
          />

          <Separator />

          <AssetMetadata asset={asset} hideTitle={true} />
        </div>
      </div>
    </div>
  );
};

export default AssetDetailPage;
