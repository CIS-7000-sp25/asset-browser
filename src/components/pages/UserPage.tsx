import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type AssetWithDetails, type Commit } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

// Extended commit type that includes asset information
interface UserCommit extends Commit {
  asset: AssetWithDetails;
}

interface UserProfile {
  pennId: string;
  fullName: string;
  avatarUrl?: string;
}

const UserPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [commits, setCommits] = useState<UserCommit[]>([]);

  // Mock data for demonstration
  const mockUser: UserProfile = {
    pennId: "willcai",
    fullName: "Will Cai",
    avatarUrl: "/placeholder-avatar.jpg"
  };

  const mockCommits: UserCommit[] = [
    {
      author: "willcai",
      version: "1.2.0",
      timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      note: "Updated textures and added new materials",
      asset: {
        name: "placeholder 1",
        thumbnailUrl: "/placeholder-image.jpg",
        version: "1.2.0",
        creator: "willcai",
        lastModifiedBy: "willcai",
        checkedOutBy: null,
        isCheckedOut: false,
        materials: true,
        keywords: ["character", "robot", "sci-fi"],
        description: "a;sdlkjfa;lskdfj;alsdkf",
        createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
      }
    },
    {
      author: "willcai",
      version: "2.0.1",
      timestamp: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      note: "Fixed rigging issues and optimized mesh",
      asset: {
        name: "placeholder 2",
        thumbnailUrl: "/placeholder-image.jpg",
        version: "2.0.1",
        creator: "asdf",
        lastModifiedBy: "willcai",
        checkedOutBy: null,
        isCheckedOut: false,
        materials: true,
        keywords: ["vehicle", "spaceship", "sci-fi"],
        description: "alksdfjlksdfjalsd",
        createdAt: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
      }
    },
    {
      author: "willcai",
      version: "1.0.0",
      timestamp: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
      note: "Initial commit",
      asset: {
        name: "placeholder 3",
        thumbnailUrl: "/placeholder-image.jpg",
        version: "1.0.0",
        creator: "willcai",
        lastModifiedBy: "willcai",
        checkedOutBy: null,
        isCheckedOut: false,
        materials: true,
        keywords: ["environment", "forest", "nature"],
        description: "alsdkfj;alsdkfja",
        createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString()
      }
    }
  ];

  useEffect(() => {
    // Simulate API call to fetch user profile and commits
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would be an API call
        // await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        setUserProfile(mockUser);
        setCommits(mockCommits);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [toast]);

  const handleBack = () => {
    window.history.back();
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

  if (isLoading) {
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

  if (!userProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
          <p className="text-muted-foreground mb-6">The requested user profile could not be found.</p>
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
        {/* User Profile Header */}
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            {userProfile.avatarUrl ? (
              <img 
                src={userProfile.avatarUrl} 
                alt={userProfile.fullName} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-3xl font-bold text-muted-foreground">
                {userProfile.fullName.charAt(0)}
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-3xl font-bold">{userProfile.fullName}</h1>
            <p className="text-muted-foreground">@{userProfile.pennId}</p>
          </div>
        </div>
        
        <Separator />
        
        {/* Commits List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Recent Commits</h2>
          
          {commits.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-muted-foreground">No commits found for this user.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {commits.map((commit, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-md bg-secondary overflow-hidden flex-shrink-0">
                      <img 
                        src={commit.asset.thumbnailUrl} 
                        alt={commit.asset.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{commit.asset.name}</h3>
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
      </div>
    </div>
  );
};

export default UserPage;
