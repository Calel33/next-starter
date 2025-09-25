"use client";

import { BusinessCard } from "./BusinessCard";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { InfiniteSlider } from "@/components/motion-primitives/infinite-slider";

export function FeaturedBusinesses() {
  // Get featured businesses from Convex (now with mock data)
  const featuredBusinesses = useQuery(api.businesses.getFeaturedBusinesses, { limit: 8 });

  if (!featuredBusinesses) {
    return (
      <section>
        <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Featured Businesses
        </h2>
        <InfiniteSlider
          speed={50}
          speedOnHover={20}
          gap={16}
          className="py-4"
        >
          {/* Loading skeleton */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex h-full flex-col gap-4 rounded-lg w-60 flex-shrink-0 bg-muted animate-pulse mx-2">
              <div className="w-full aspect-video bg-muted-foreground/20 rounded-xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
                <div className="h-3 bg-muted-foreground/20 rounded w-full" />
              </div>
            </div>
          ))}
        </InfiniteSlider>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Featured Businesses
      </h2>
      <InfiniteSlider
        speed={50}
        speedOnHover={20}
        gap={16}
        className="py-4"
      >
        {featuredBusinesses.map((business) => (
          <BusinessCard
            key={business._id}
            name={business.name}
            description={business.description || ""}
            imageUrl={business.imageUrl || ""}
            className="mx-2"
          />
        ))}
      </InfiniteSlider>
    </section>
  );
}
