import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { AssetWithDetails } from "@/lib/types";
import AssetGrid from "../AssetGrid";
import UploadAssetFlow from "../asset-detail/UploadAssetFlow";

import { useToast } from "@/hooks/use-toast";
import { actions } from "astro:actions";
import { Check, ChevronDown, Filter, Plus, Search, User } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchBarProps {
  onSearch: (search: string) => void;
  onAuthorFilter: (author: string | null) => void;
  onCheckedInFilter: (checkedInOnly: boolean) => void;
  onSort: (sortBy: string) => void;
}

const SearchBar = ({ onSearch, onAuthorFilter, onCheckedInFilter, onSort }: SearchBarProps) => {
  const { toast } = useToast();

  const [searchValue, setSearchValue] = useState("");
  const [showCheckedInOnly, setShowCheckedInOnly] = useState(false);
  const [authors, setAuthors] = useState<string[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("updated");
  const [createAssetOpen, setCreateAssetOpen] = useState(false);

  const sortOptions = [
    { label: "Name", value: "name" },
    { label: "Author", value: "author" },
    { label: "Recently Updated", value: "updated" },
    { label: "Recently Created", value: "created" },
  ];

  useEffect(() => {
    // Fetch authors when component mounts
    const fetchAuthors = async () => {
      const { data, error } = await actions.getAuthors();

      if (error) {
        toast({
          title: "getAuthors - TODO",
          description: "Not implemented. 'Filter by Author' will be empty for now.",
          variant: "destructive",
        });

        setAuthors([]);
      } else {
        // TODO
      }
    };

    fetchAuthors();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const handleCheckedInToggle = () => {
    const newValue = !showCheckedInOnly;
    setShowCheckedInOnly(newValue);
    onCheckedInFilter(newValue);
  };

  const handleAuthorSelect = (author: string) => {
    const newAuthor = selectedAuthor === author ? null : author;
    setSelectedAuthor(newAuthor);
    onAuthorFilter(newAuthor);
  };

  const handleSortSelect = (sortBy: string) => {
    setSortOption(sortBy);
    onSort(sortBy);
  };

  return (
    <div className="w-full space-y-4 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-[80%]">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Input
              type="text"
              placeholder="Search assets by name or keywords..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="search-input pl-10 h-12 text-base"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Button
              type="submit"
              variant="default"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              Search
            </Button>
          </form>
        </div>

        <div className="ml-auto">
          <Button
            variant="default"
            size="sm"
            onClick={() => setCreateAssetOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Upload New Asset
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pb-2">
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4 mr-1" />
                {selectedAuthor ? `Author: ${selectedAuthor}` : "Filter by Author"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Filter by Author</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                <DropdownMenuGroup>
                  {authors.map((author) => (
                    <DropdownMenuItem
                      key={author}
                      onClick={() => handleAuthorSelect(author)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      {author}
                      {selectedAuthor === author && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                Sort: {sortOptions.find((option) => option.value === sortOption)?.label}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleSortSelect(option.value)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    {option.label}
                    {sortOption === option.value && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="checked-in-only"
            checked={showCheckedInOnly}
            onCheckedChange={handleCheckedInToggle}
          />
          <label htmlFor="checked-in-only" className="text-sm cursor-pointer">
            Show checked-in assets only
          </label>
        </div>
      </div>

      <UploadAssetFlow
        open={createAssetOpen}
        onOpenChange={setCreateAssetOpen}
        onComplete={() => {
          // Refresh the asset list after creating a new asset
          onSearch(searchValue);
        }}
      />
    </div>
  );
};

const AssetsPage = () => {
  const { toast } = useToast();

  const [assets, setAssets] = useState<AssetWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAuthor, setFilterAuthor] = useState<string | null>(null);
  const [showCheckedInOnly, setShowCheckedInOnly] = useState(false);
  const [sortBy, setSortBy] = useState("updated");

  // Mock user for demonstration purposes
  const user = { pennId: "willcai", fullName: "Will Cai" };

  const fetchAssets = async () => {
    setIsLoading(true);

    console.log("Fetching assets with params:", {
      searchTerm,
      filterAuthor,
      showCheckedInOnly,
      sortBy,
    });

    const { data, error } = await actions.getAssets({
      search: searchTerm,
      author: filterAuthor || undefined,
      checkedInOnly: showCheckedInOnly,
      sortBy,
    });

    if (error) {
      console.error("[ERROR] API: Failed to fetch assets:", error);
      toast({
        title: "Error",
        description: "Failed to fetch assets. Please try again.",
        variant: "destructive",
      });
      setAssets([]);
    } else {
      const { assets } = data;
      console.log("Fetched assets:", assets);
      console.log("Assets length:", assets.length);
      console.log("Assets first item:", assets[0]);
      setAssets(assets);
    }

    setIsLoading(false);
    console.log("Is loading:", isLoading);
  };

  useEffect(() => {
    console.log("AssetsPage mounted");
    fetchAssets();
    // We don't include fetchAssets in the dependency array to avoid an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterAuthor, showCheckedInOnly, sortBy]);

  return (
    <div className="container mx-auto py-14 px-4 max-w-7xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-left">Asset Browser</h1>
          <p className="text-muted-foreground text-left">Browse and search for assets</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{user.fullName}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center cursor-pointer hover:bg-secondary/80">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = "/user"}>My Commits</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <SearchBar
        onSearch={setSearchTerm}
        onAuthorFilter={setFilterAuthor}
        onCheckedInFilter={setShowCheckedInOnly}
        onSort={setSortBy}
      />

      <div className="mt-6">
        <AssetGrid assets={assets} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default AssetsPage;
