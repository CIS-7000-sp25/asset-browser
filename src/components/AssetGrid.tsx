import type { AssetWithDetails } from "../services/api";
import AssetCard from "./AssetCard";

interface AssetGridProps {
  assets: AssetWithDetails[];
  isLoading: boolean;
}

const AssetGrid = ({ assets, isLoading }: AssetGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-lg overflow-hidden bg-secondary">
            <div className="aspect-4/3 bg-muted" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-secondary p-6 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <h3 className="text-xl font-medium mb-1">No assets found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
      {assets.map((asset) => (
        <div
          key={asset.name}
          className="animate-slide-in [animation-fill-mode:backwards]"
          style={{
            animationDelay: `${assets.indexOf(asset) * 50}ms`,
          }}
        >
          <AssetCard asset={asset} />
        </div>
      ))}
    </div>
  );
};

export default AssetGrid;
