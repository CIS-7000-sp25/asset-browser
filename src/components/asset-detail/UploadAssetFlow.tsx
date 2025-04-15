import { useToast } from "@/hooks/use-toast";
import type { AssetWithDetails, Metadata } from "@/lib/types";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { actions } from "astro:actions";
import CheckInStep2 from "./CheckInStep2";
import CheckInStep3 from "./CheckInStep3";

interface UploadAssetFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const UploadAssetFlow = ({ open, onOpenChange, onComplete }: UploadAssetFlowProps) => {
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [assetName, setAssetName] = useState("");
  const [assetDescription, setAssetDescription] = useState("");

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [metadata, setMetadata] = useState<Metadata>({} as Metadata);

  // Mock asset for steps 2 and 3
  const mockAsset = {
    name: assetName || "New Asset",
    description: assetDescription || "New asset description",
    thumbnailUrl: "/placeholder-image.jpg",
    version: "1.0.0",
    isCheckedOut: false,
    checkedOutBy: null,
    lastUpdated: new Date().toISOString(),
    created: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {},
    creator: "current-user",
    lastModifiedBy: "current-user",
    materials: false,
    keywords: [],
    tags: [],
    category: "default",
  } as AssetWithDetails;

  const handleNextStep = () => {
    if (step === 1) {
      if (!assetName.trim()) {
        toast({
          title: "Asset Name Required",
          description: "Please provide a name for the new asset.",
          variant: "destructive",
        });
        return;
      }

      // In a real implementation, we would check if the asset name already exists
      setStep(2);
    } else if (step === 2) {
      if (uploadedFiles.length === 0) {
        toast({
          title: "Files Required",
          description: "Please upload at least one file for the new asset.",
          variant: "destructive",
        });
        return;
      }
      setStep(3);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      toast({
        title: "Creating Asset",
        description: "Creating your new asset...",
      });

      toast({
        title: "Asset Created",
        description: `Successfully created asset "${assetName}".`,
        variant: "default",
      });

      onComplete();
      onOpenChange(false);

      console.log(`uploaded: ${uploadedFiles[0].name}`);
      console.log(typeof(uploadedFiles[0]));
      console.log(`metadata: ${metadata.assetStructureVersion}`);

      // Temporary code for now, most direct way to upload assets
      const formData = new FormData();
      formData.append("assetName", assetName);
      formData.append("version", "1.00.00");
      formData.append("file", uploadedFiles[0] as File);

      const { data, error } = await actions.createAsset(formData);

      if (error) {
        console.log("Error: ", error.message);
      }

      // Reset the form
      setStep(1);
      setAssetName("");
      setAssetDescription("");
      setUploadedFiles([]);
      setVerificationComplete(false);
      setMetadata({} as Metadata);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create asset. ${
          error instanceof Error ? error.message : "Please try again."
        }`,
        variant: "destructive",
      });
    }
  };

  const handleMetadataChange = (newMetadata: Metadata) => {
    setMetadata(newMetadata);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 1 && (
          <>
            <DialogTitle>Upload New Asset</DialogTitle>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="asset-name">Asset Name</Label>
                <Input
                  id="asset-name"
                  placeholder="Enter asset name"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset-description">Description</Label>
                <Input
                  id="asset-description"
                  placeholder="Enter asset description"
                  value={assetDescription}
                  onChange={(e) => setAssetDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleNextStep}>Next</Button>
            </div>
          </>
        )}

        {step === 2 && (
          <CheckInStep2
            asset={mockAsset}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            verificationComplete={verificationComplete}
            setVerificationComplete={setVerificationComplete}
            onNext={handleNextStep}
          />
        )}

        {step === 3 && (
          <CheckInStep3
            asset={mockAsset}
            onComplete={handleNextStep}
            onMetadataChange={setMetadata}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UploadAssetFlow;
