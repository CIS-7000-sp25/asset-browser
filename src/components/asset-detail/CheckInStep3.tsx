import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import type { Commit, Metadata } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { AssetWithDetails } from "@/services/api";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import React, { useState } from "react";

interface CheckInStep3Props {
  asset: AssetWithDetails;
  onComplete: () => void;
  onMetadataChange: (newMetadata: Metadata) => void;
}

const CheckInStep3 = ({
  asset,
  onComplete,
  onMetadataChange,
}: CheckInStep3Props) => {
  const { user } = useUser();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [version, setVersion] = useState<string>("");
  const [materials, setMaterials] = useState<string>("None");
  const [keywords, setKeywords] = useState<string>(asset.keywords.join(", "));
  const [description, setDescription] = useState<string>("");

  // Calculate version options based on current version
  const getVersionOptions = () => {
    const currentVersion = asset.version || "1.00.00";
    const parts = currentVersion.split(".");
    const major = parseInt(parts[0], 10);
    const minor = parseInt(parts[1], 10);
    const patch = parseInt(parts[2], 10);

    return [
      `${major + 1}.00.00`, // Major update
      `${major}.${(minor + 1).toString().padStart(2, "0")}.00`, // Minor update
      `${major}.${minor.toString().padStart(2, "0")}.${(patch + 1)
        .toString()
        .padStart(2, "0")}`, // Patch update
    ];
  };

  const versionOptions = getVersionOptions();

  // Set default version to major update
  React.useEffect(() => {
    if (versionOptions.length > 0 && !version) {
      setVersion(versionOptions[0]);
    }
  }, [versionOptions, version]);

  const onSubmit = () => {
    if (!user || !date) return;

    console.log("we have stuff to submit");

    const commit: Commit = {
      author: user.pennId,
      version: version,
      timestamp: date.toString(),
      note: description,
    };

    const metadata: Metadata = {
      assetName: asset.name,
      assetStructureVersion: "03.00.00",
      keywords: keywords.split(","),
      hasTexture: materials === "Yes",
      commit: commit,
      versionMap: {},
    };

    console.log(metadata);

    onMetadataChange(metadata);
    onComplete();
  };

  const isFormValid = () => {
    return (
      user?.name &&
      date &&
      version &&
      materials &&
      keywords.trim() !== "" &&
      description.trim() !== ""
    );
  };

  return (
    <div className="flex flex-col h-full max-h-[75vh]">
      <DialogHeader className="pb-4">
        <div>
          <p className="text-sm text-muted-foreground">Check-in Step 3 of 3</p>
          <DialogTitle className="text-xl">Metadata Update</DialogTitle>
        </div>
      </DialogHeader>

      <ScrollArea className="flex-1 pr-4 overflow-y-auto">
        <div className="space-y-4 pb-4">
          {/* Author Field */}
          <div className="space-y-2">
            <label htmlFor="author" className="text-sm font-medium">
              Author *
            </label>
            <Input
              id="author"
              value={user?.name || ""}
              readOnly
              className="bg-muted"
            />
          </div>

          {/* Date Field */}
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium">
              Date *
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Version Field */}
          <div className="space-y-2">
            <label htmlFor="version" className="text-sm font-medium">
              Version *
            </label>
            <Select value={version} onValueChange={setVersion}>
              <SelectTrigger>
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {versionOptions.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Materials Field */}
          <div className="space-y-2">
            <label htmlFor="materials" className="text-sm font-medium">
              Materials
            </label>
            <Select value={materials} onValueChange={setMaterials}>
              <SelectTrigger>
                <SelectValue placeholder="Select materials option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Keywords Field */}
          <div className="space-y-2">
            <label htmlFor="keywords" className="text-sm font-medium">
              Keywords *
            </label>
            <Textarea
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Enter keywords separated by commas"
              rows={2}
            />
          </div>

          {/* Commit Description Field */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Commit Description *
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter commit description"
              rows={3}
            />
          </div>
        </div>
      </ScrollArea>

      <div className="flex justify-end pt-4 mt-auto border-t">
        <Button onClick={onSubmit} disabled={!isFormValid()}>
          Submit
        </Button>
      </div>
    </div>
  );
};

export default CheckInStep3;
