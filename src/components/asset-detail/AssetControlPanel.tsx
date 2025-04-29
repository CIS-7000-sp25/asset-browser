import type { AssetWithDetails, Metadata } from "@/lib/types";
import { Download, Lock, LockOpen, PlayCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent } from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import CheckInStep1 from "./CheckInStep1";
import CheckInStep2 from "./CheckInStep2";
import CheckInStep3 from "./CheckInStep3";

import { getAccessToken } from "@/utils/utils";
import { toast } from "@/hooks/use-toast";

interface AssetControlPanelProps {
  asset: AssetWithDetails;
  canCheckout: boolean;
  canCheckin: boolean;
  onCheckout: () => void;
  onCheckin: () => void;
  onDownload: () => void;
  onLaunchDCC: () => void;
  onFilesChange: (newFiles: File[]) => void;
  onMetadataChange: (newMetadata: Metadata) => void;
}

const AssetControlPanel = ({
  asset,
  canCheckout,
  canCheckin,
  onCheckout,
  onCheckin,
  onDownload,
  onLaunchDCC,
  onFilesChange,
  onMetadataChange,
}: AssetControlPanelProps) => {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    materials: false,
    visualCheck: false,
    centeredGeometry: false,
    rigsWorking: false,
    boundingBox: false,
    usdValidate: false,
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [verificationComplete, setVerificationComplete] = useState(false);

  const handleCheckInComplete = () => {
    onCheckin();
    console.log("The checkin is done.");
    setCheckInOpen(false);
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3);
    } else {
      handleCheckInComplete();
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setCheckInOpen(open);
    if (!open) {
      // Reset state when dialog is closed
      setStep(1);
      setCheckedItems({
        materials: false,
        visualCheck: false,
        centeredGeometry: false,
        rigsWorking: false,
        boundingBox: false,
        usdValidate: false,
      });
      setUploadedFiles([]);
      setVerificationComplete(false);
    }
  };

  const handleComplete = () => {
    console.log("we have reached the flow state");
    console.log(uploadedFiles);
    onFilesChange([...uploadedFiles]);
    handleCheckInComplete();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground">Version</div>
        <div className="text-sm font-medium">{asset?.version}</div>
        <Select disabled>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={asset?.version} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={asset?.version ?? "THIS SHOULD NOT HAPPEN"}>
              {asset?.version}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button className="flex items-center gap-2" onClick={onCheckout} disabled={!canCheckout}>
          <LockOpen className="h-4 w-4" />
          Check Out
        </Button>

        <Button
          className="flex items-center gap-2"
          onClick={async () => {
            let token = await getAccessToken()
            if (!token.success) {
              toast({
                title: "Upload Error",
                description: `You must be logged in to upload an asset.`,
                variant: "destructive",
              });
              setTimeout(()=>{window.location.href = '/login/';}, 1500)
              return;
            }
            
            setCheckInOpen(true)
          }}
          disabled={!canCheckin}
        >
          <Lock className="h-4 w-4" />
          Check In
        </Button>

        <Button variant="outline" className="flex items-center gap-2" onClick={onDownload}>
          <Download className="h-4 w-4" />
          Download Copy
        </Button>

        <Button variant="outline" className="flex items-center gap-2" onClick={onLaunchDCC}>
          <PlayCircle className="h-4 w-4" />
          Launch DCC
        </Button>
      </div>

      {/* Check-in Flow Dialog */}
      <Dialog open={checkInOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          {step === 1 && (
            <CheckInStep1
              checkedItems={checkedItems}
              setCheckedItems={setCheckedItems}
              onNext={handleNextStep}
            />
          )}

          {step === 2 && (
            <CheckInStep2
              asset={asset}
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              verificationComplete={verificationComplete}
              setVerificationComplete={setVerificationComplete}
              onNext={handleNextStep}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <CheckInStep3
              asset={asset}
              onComplete={handleComplete}
              onMetadataChange={onMetadataChange}
              onBack={() => setStep(2)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetControlPanel;
