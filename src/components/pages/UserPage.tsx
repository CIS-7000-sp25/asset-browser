import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { GetUserBody } from "@/lib/types";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

interface UserPageProps {
  pennKey: string;
  data: GetUserBody;
  error: any;
}

const UserPage = ({ pennKey, data, error }: UserPageProps) => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<"commits" | "created" | "checkedOut">("commits");

  console.log(data);

  const handleBack = () => {
    window.location.href = "/";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    toast({
      title: "Failed to get user",
      description: `Failed to fetch data for user ${pennKey}`,
      variant: "destructive",
    });

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" className="flex items-center gap-1" onClick={handleBack}>
            <ChevronLeft className="h-4 w-4" />
            Back to Assets
          </Button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            <Skeleton className="h-6 w-32" />
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!pennKey) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The requested user profile could not be found.
          </p>
          <Button onClick={handleBack}>Return to Asset Browser</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="flex items-center gap-1 hover:bg-secondary/80 transition-all"
          onClick={handleBack}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Assets
        </Button>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          {/* <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            {UserDetails.avatarUrl ? (
              <img
                src={UserDetails.avatarUrl}
                alt={UserDetails.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-3xl font-bold text-muted-foreground">
                {data.user.fullName.charAt(0)}
              </div>
            )}
          </div> */}
          <div>
            <h1 className="text-3xl font-bold">{data.user.fullName}</h1>
            <p className="text-muted-foreground">@{data.user.pennKey}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-6">
          {/* Tab Headers */}
          <div className="flex gap-6 items-center mb-2">
            <button
              className={`text-xl font-semibold border-b-2 px-1 transition-all ${
                selectedTab === "commits"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-primary"
              }`}
              onClick={() => setSelectedTab("commits")}
            >
              Recent Commits
            </button>
            <button
              className={`text-xl font-semibold border-b-2 px-1 transition-all ${
                selectedTab === "created"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-primary"
              }`}
              onClick={() => setSelectedTab("created")}
            >
              Assets Created
            </button>
            <button
              className={`text-xl font-semibold border-b-2 px-1 transition-all ${
                selectedTab === "checkedOut"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-primary"
              }`}
              onClick={() => setSelectedTab("checkedOut")}
            >
              Checked Out Assets
            </button>
          </div>

          {/* Tab Content */}
          {selectedTab === "commits" && (
            <div className="space-y-6">
              {data.user.recentCommits.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-muted-foreground">No commits found for this user.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.user.recentCommits.map((commit, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{commit.assetName}</h3>
                            <span className="text-sm text-muted-foreground">v{commit.version}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {formatDate(commit.timestamp)}
                          </p>
                          <p className="text-sm">{commit.note}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {selectedTab === "created" && (
            <div className="space-y-6">
              {data.user.assetsCreated.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-muted-foreground">No assets created by this user.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.user.assetsCreated.map((asset, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{asset.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Created: {formatDate(asset.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {selectedTab === "checkedOut" && (
            <div className="space-y-6">
              {data.user.checkedOutAssets.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-muted-foreground">
                    No assets currently checked out by this user.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.user.checkedOutAssets.map((asset, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{asset.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Checked Out: {formatDate(asset.checkedOutAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPage;
