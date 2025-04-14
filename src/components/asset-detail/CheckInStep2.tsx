import type { AssetWithDetails } from "@/lib/types";
import { FileUp, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import { DialogHeader, DialogTitle } from "../../components/ui/dialog";

interface CheckInStep2Props {
  asset: AssetWithDetails;
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
  verificationComplete: boolean;
  setVerificationComplete: (complete: boolean) => void;
  onNext: () => void;
}

const CheckInStep2 = ({
  asset,
  uploadedFiles,
  setUploadedFiles,
  verificationComplete,
  setVerificationComplete,
  onNext,
}: CheckInStep2Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [invalidFiles, setInvalidFiles] = useState<string[]>([]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles([...uploadedFiles, ...newFiles]);

      // Reset verification status and message when new files are uploaded
      setVerificationComplete(false);
      setVerificationMessage(null);
      setInvalidFiles([]);

      // Reset the input value so the same file can be uploaded again if needed
      e.target.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);

    // Reset verification when files change
    setVerificationComplete(false);
    setVerificationMessage(null);
    setInvalidFiles([]);
  };

  const handleVerify = () => {
    const assetName = asset.name.toLowerCase();
    const invalidFilesList: string[] = [];

    // Validate each file against the allowed patterns
    uploadedFiles.forEach((file) => {
      const fileName = file.name.toLowerCase();

      // Valid patterns:
      // 1. assetName.usda (eg. skateboard.usda)
      // 2. assetName_variantName.usda (eg. skateboard_LOD2.usda)
      // 3. thumbnail.png

      const isValid =
        fileName === `${assetName}.usda` ||
        fileName.endsWith(".zip") || 
        (fileName.startsWith(`${assetName}_`) && fileName.endsWith(".usda")) ||
        fileName === "thumbnail.png";

      if (!isValid) {
        invalidFilesList.push(file.name);
      }
    });

    setInvalidFiles(invalidFilesList);

    if (invalidFilesList.length > 0) {
      setVerificationMessage(
        `${invalidFilesList.length} file(s) have invalid names. Please fix them.`
      );
      setVerificationComplete(false);
    } else {
      setVerificationMessage("All files have valid names!");
      setVerificationComplete(true);
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <p className="text-sm text-muted-foreground">Check-in Step 2 of 3</p>
        <DialogTitle className="text-xl">Upload and Automatic Checks</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div className="text-sm">
          <p className="font-medium mb-1">Valid file names:</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>{asset.name}.usda (main asset file)</li>
            <li>{asset.name}_variantName.usda (variant files)</li>
            <li>thumbnail.png (preview image)</li>
          </ul>
        </div>

        <Button
          className="w-full flex items-center gap-2"
          onClick={handleUploadClick}
          variant="outline"
        >
          <FileUp size={16} />
          Upload file
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          multiple
        />

        {uploadedFiles.length > 0 && (
          <div className="border rounded-md p-3 space-y-2">
            <p className="text-sm font-medium">Uploaded files:</p>
            <ul className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <li
                  key={index}
                  className={`flex items-center justify-between border-b pb-1 ${
                    invalidFiles.includes(file.name) ? "text-red-500" : ""
                  }`}
                >
                  <span className="text-sm truncate">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X size={16} />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={handleVerify}
          disabled={uploadedFiles.length === 0}
          variant="outline"
          className="w-full"
        >
          Verify files
        </Button>

        {verificationMessage && (
          <div
            className={`p-2 text-center text-sm font-medium ${
              verificationComplete ? "text-green-600" : "text-red-500"
            }`}
          >
            {verificationMessage}
          </div>
        )}

        {invalidFiles.length > 0 && (
          <div className="border border-red-200 bg-red-50 rounded-md p-3">
            <p className="text-sm font-medium text-red-700 mb-2">Invalid file names:</p>
            <ul className="space-y-1 text-sm text-red-600">
              {invalidFiles.map((fileName, index) => (
                <li key={index}>• {fileName} - should follow one of the valid patterns</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={onNext} disabled={!verificationComplete}>
          Proceed
        </Button>
      </div>
    </div>
  );
};

export default CheckInStep2;
