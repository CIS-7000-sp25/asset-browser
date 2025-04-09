import { Calendar, Lock, User } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import type { AssetWithDetails } from "../services/api";

// Helper function to replace the cn utility
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

interface AssetCardProps {
  asset: AssetWithDetails;
}

const AssetCard = ({ asset }: AssetCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleCardClick = () => {
    // Navigate to asset detail page using the asset name
    console.log("Navigating to asset detail page for asset:", asset.name);
    window.location.href = `/asset/${encodeURIComponent(asset.name)}`;
  };

  return (
    <div className="block">
      <Card
        className={cn(
          "asset-card h-full overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-md",
          asset.isCheckedOut && "checked-out",
          !imageLoaded && "animate-pulse bg-muted"
        )}
        onClick={handleCardClick}
      >
        <div className="relative aspect-4/3 overflow-hidden bg-secondary">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
          <img
            src={asset.thumbnailUrl}
            alt={asset.name}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              imageLoaded ? "opacity-100 animate-blur-in" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
          />
          {asset.isCheckedOut && (
            <div className="absolute top-2 right-2 bg-secondary/80 backdrop-blur-xs text-foreground px-2 py-1 rounded-md text-xs flex items-center">
              <Lock className="h-3 w-3 mr-1" />
              Checked Out
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium text-sm line-clamp-1 text-left">{asset.name}</h3>
          <div className="mt-2 flex flex-col gap-1">
            <div className="flex items-center text-xs text-muted-foreground">
              <User className="h-3 w-3 mr-1" />
              <span className="line-clamp-1">{asset.creator}</span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>
                {(() => {
                  try {
                    let dateStr = asset.updatedAt;

                    dateStr = dateStr.replace(/([+-]\d{2})$/, "$1:00");

                    const date = new Date(dateStr);
                    if (!isNaN(date.getTime())) {
                      return date.toLocaleString("en-US", {
                        month: "long", // "February", "March", etc.
                        day: "numeric", // 1, 2, 3, ...
                        year: "numeric", // 2025, 2026, ...
                      });
                    }

                    return "Date unavailable";
                  } catch (error) {
                    console.error("Error formatting date:", error);
                    return "Date unavailable";
                  }
                })()}
              </span>
            </div>
          </div>
          {asset.keywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {asset.keywords.slice(0, 3).map((keyword) => (
                <span
                  key={keyword}
                  className="bg-secondary px-1.5 py-0.5 rounded text-[10px] text-muted-foreground"
                >
                  {keyword}
                </span>
              ))}
              {asset.keywords.length > 3 && (
                <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] text-muted-foreground">
                  +{asset.keywords.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetCard;
