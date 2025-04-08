import { Download, Lock, LockOpen, PlayCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import type { AssetWithDetails } from "../../services/api";
import CheckInFlow from "./CheckInFlow";
import type { Metadata } from "@/lib/types";

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

  const handleCheckInComplete = () => {
    onCheckin();
    console.log("The checkin is done.");
    //setCheckInOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">Asset Details</h2>
        {asset?.isCheckedOut && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Checked Out
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground">Version</div>
        <div className="text-sm font-medium">{asset?.version}</div>
        <Select disabled>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={asset?.version} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={asset?.version ?? ""}>
              {asset?.version}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          className="flex items-center gap-2"
          onClick={onCheckout}
          disabled={!canCheckout}
        >
          <LockOpen className="h-4 w-4" />
          Check Out
        </Button>

        <Button
          className="flex items-center gap-2"
          onClick={() => setCheckInOpen(true)}
          disabled={!canCheckin}
        >
          <Lock className="h-4 w-4" />
          Check In
        </Button>

        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={onDownload}
        >
          <Download className="h-4 w-4" />
          Download Copy
        </Button>

        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={onLaunchDCC}
        >
          <PlayCircle className="h-4 w-4" />
          Launch DCC
        </Button>
      </div>

      <CheckInFlow
        asset={asset}
        open={checkInOpen}
        onOpenChange={setCheckInOpen}
        onComplete={handleCheckInComplete}
        onFilesChange={onFilesChange}
        onMetadataChange={onMetadataChange}
      />
    </div>
  );
};

export default AssetControlPanel;
