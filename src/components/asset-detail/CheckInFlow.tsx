import { useState } from "react";
import { Dialog, DialogContent } from "../../components/ui/dialog";
import type { AssetWithDetails } from "../../services/api";
import CheckInStep1 from "./CheckInStep1";
import CheckInStep2 from "./CheckInStep2";
import CheckInStep3 from "./CheckInStep3";
import { UserProvider } from "@/contexts/UserContext";

interface CheckInFlowProps {
  asset: AssetWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const CheckInFlow = ({ asset, open, onOpenChange, onComplete }: CheckInFlowProps) => {
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

  const handleNextStep = () => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3);
    } else {
      onComplete();
      onOpenChange(false);
    }
  };

  const handleComplete = () => {
    onComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          />
        )}

        {step === 3 && (
          <UserProvider>
            <CheckInStep3 asset={asset} onComplete={handleComplete} />
          </UserProvider>
          )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckInFlow;
