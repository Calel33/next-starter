"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    console.log("Searching for:", searchQuery);

    try {
      // For now, just show a console message since we'd need to implement search results UI
      console.log("Search functionality ready - would show results for:", searchQuery);
      // In a real implementation, you'd call the search API and display results
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="@container">
      <div className="@[480px]:p-4">
        <div
          className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-4"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCWtKVUafEKWOnZt2gQaZOSKZkhbYF3hMxUiwG--wmT_xB3v7CtQ0--pUpOViHMEMjJVwJXS7EYNUq9TfRGjNFlWS3e6JBlW3sxvyxuIMIEiO07_ec_mGlDORwWCx5NHMzT39IRIPJQgdnJIwCZT9YCKno4HatPCyg7gotXHfjmR4qCq5mnd0tNfp2hrLHArBBdcPWw92bbXfus9Qm7xFt-BJDmoZJudfTbbDYKsswCcZCGhKK9bJx4y9WuQR0Inr23I1UEoVLKLjvB")`
          }}
        >
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
              Explore Local Businesses Worldwide
            </h1>
            <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
              Discover top-rated services and businesses in any location. Use the interactive globe to find businesses near you or anywhere in the world.
            </h2>
          </div>

          {/* Hero Search Bar */}
          <div className="flex flex-col min-w-40 h-14 w-full max-w-[480px] @[480px]:h-16">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
              <div className="text-muted-foreground flex border border-border bg-card items-center justify-center pl-[15px] rounded-l-xl border-r-0">
                <Search className="h-5 w-5" />
              </div>
              <Input
                placeholder="Search for businesses or services"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-foreground focus:outline-0 focus:ring-0 border border-border bg-card focus:border-border h-full placeholder:text-muted-foreground px-[15px] rounded-r-none border-r-0 pr-2 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal"
              />
              <div className="flex items-center justify-center rounded-r-xl border-l-0 border border-border bg-card pr-[7px]">
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 @[480px]:h-12 @[480px]:px-5 text-sm font-bold leading-normal tracking-wide @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-wide disabled:opacity-50"
                >
                  <span className="truncate">
                    {isSearching ? "Searching..." : "Search"}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
