import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CheckInStep1Props {
  checkedItems: Record<string, boolean>;
  setCheckedItems: (items: Record<string, boolean>) => void;
  onNext: () => void;
}

const checklistItems = [
  { id: "materials", label: "Materials" },
  { id: "visualCheck", label: "Visual check for scale" },
  { id: "centeredGeometry", label: "Centered geometry" },
  { id: "rigsWorking", label: "Rigs working" },
  { id: "boundingBox", label: "Bounding box" },
  { id: "usdValidate", label: "USDValidate approved" },
];

const CheckInStep1 = ({
  checkedItems,
  setCheckedItems,
  onNext,
}: CheckInStep1Props) => {
  const allChecked = Object.values(checkedItems).every(Boolean);

  const handleCheckChange = (id: string, checked: boolean) => {
    setCheckedItems({ ...checkedItems, [id]: checked });
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <p className="text-sm text-muted-foreground">Check-in Step 1 of 3</p>
        <DialogTitle className="text-xl">Manual Checklist</DialogTitle>
      </DialogHeader>

      <div className="space-y-3">
        {checklistItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-2">
            <Checkbox
              id={item.id}
              checked={checkedItems[item.id]}
              onCheckedChange={(checked) =>
                handleCheckChange(item.id, checked as boolean)
              }
            />
            <label
              htmlFor={item.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {item.label}
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={onNext} disabled={!allChecked && false}>
          Proceed with uploading
        </Button>
      </div>
    </div>
  );
};

export default CheckInStep1;
