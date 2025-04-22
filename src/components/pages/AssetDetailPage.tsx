import type { AssetWithDetails } from "@/lib/types";
import { ChevronLeft, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

import { useToast } from "@/hooks/use-toast";
import { type Metadata } from "@/lib/types";
import { actions } from "astro:actions";
import AssetControlPanel from "../asset-detail/AssetControlPanel";
import AssetDetailSkeleton from "../asset-detail/AssetDetailSkeleton";
import AssetMetadata from "../asset-detail/AssetMetadata";
import AssetPreview from "../asset-detail/AssetPreview";

interface AssetDetailPageProps {
  assetName: string;
}

const AssetDetailPage = ({ assetName }: AssetDetailPageProps) => {
  const { toast } = useToast();

  const [asset, setAsset] = useState<AssetWithDetails | null>(null);
  const [userFiles, setUserFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState<Metadata>({
    hi: "empty",
  } as unknown as Metadata);
  const [isLoading, setIsLoading] = useState(true);

  // Mock user for demonstration purposes
  const user = { pennId: "soominp", fullName: "Jacky Park" };

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

    if (!assetName || !user || !asset || !metadata || userFiles.length === 0 || !metadata) return;

    console.log("good job on making it this far");
    console.log(`Metadata: ${metadata}`);
    console.log(`Files: ${userFiles}`);
    console.log("Asset name:", assetName);
    console.log("User:", user);

    // TO DO: Replace userFiles with a single file, not an array
    const formData = new FormData();
    formData.append("assetName", assetName);
    formData.append("pennKey", user.pennId);
    formData.append("file", userFiles[0]);
    // formData.append("metadata", metadata); // TO DO: formData cannot append custom metadata type?

    const { data, error } = await actions.checkinAsset(formData);

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

    console.log("[DEBUG] Calling downloadAsset");
    const { data, error } = await actions.downloadAsset({ assetName });

    if (error) {
      console.error("[DEBUG] Error in handleDownload:", error.message);

      toast({
        title: "Download Error",
        description: "Failed to download the asset. Please try again.",
        variant: "destructive",
      });
    } else {
      // Convert array buffer to blob for easier usage
      const blob = new Blob([data], { type: "application/zip" });

      // Get the blob from the response
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

      console.log("[DEBUG] downloadAsset completed successfully");
    }
  };

  const handleLaunchDCC = async () => {
    console.log("It's time to launch Houdini.");

    console.log("[DEBUG] API: launchDCC called");

    const { data, error } = await actions.launchDCC({ assetName });

    return { message: "Application launched successfully" };
  };

  if (isLoading) {
    return <AssetDetailSkeleton />;
  }

  if (!asset) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-2">Asset Not Found</h2>
          <p className="text-muted-foreground mb-6">The requested asset could not be found.</p>
          <Button
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Return to Asset Browser
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="flex items-center gap-1 hover:bg-secondary/80 transition-all"
          onClick={() => (window.location.href = "/")}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Assets
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-10 px-4">
        <div className="flex-1 space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold animate-fade-in text-left">{asset.name}</h1>
            {asset?.isCheckedOut && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Checked Out
              </Badge>
            )}
          </div>
          <AssetControlPanel
            asset={asset}
            canCheckout={!asset.isCheckedOut && !!user}
            canCheckin={asset.isCheckedOut && !!user && asset.checkedOutBy === user.pennId}
            onCheckout={handleCheckout}
            onCheckin={handleCheckIn}
            onDownload={handleDownload}
            onFilesChange={handleUserFilesChange}
            onMetadataChange={handleMetadataChange}
            onLaunchDCC={handleLaunchDCC}
          />
          <Separator />

          <AssetMetadata asset={asset} hideTitle={true} />
        </div>

        <div className="flex justify-center lg:block mt-4 lg:mt-0">
          <div className="w-[80vh] h-[80vh] bg-secondary rounded-xl overflow-hidden relative">
            <AssetPreview asset={asset} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailPage;
