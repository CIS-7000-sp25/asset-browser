import { Header } from "@/components/Header";
import { Skeleton } from "../../components/ui/skeleton";

const AssetDetailSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-14 space-y-6">
      <Header />

      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-10">
        <div className="flex-1 space-y-5">
          <div>
            <Skeleton className="h-8 w-64" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">Version</div>
              <Skeleton className="h-5 w-16" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </div>

          <Skeleton className="h-[1px] w-full" />

          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-5/6" />
            </div>
          </div>
        </div>

        <div className="flex justify-center lg:block mt-4 lg:mt-0">
          <div className="w-[80vh] h-[80vh] bg-secondary rounded-xl overflow-hidden relative">
            <Skeleton className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailSkeleton;
