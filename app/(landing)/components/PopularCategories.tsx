"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function PopularCategories() {
  // Get popular categories from Convex (now with mock data)
  const popularCategories = useQuery(api.businesses.getPopularCategories, { limit: 6 });

  if (!popularCategories) {
    return (
      <section>
        <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Popular Categories
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
          {/* Loading skeleton */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 pb-3">
              <div className="w-full aspect-square bg-muted-foreground/20 rounded-xl animate-pulse" />
              <div className="h-4 bg-muted-foreground/20 rounded w-3/4 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Popular Categories
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
        {popularCategories.map((category) => (
          <div
            key={category._id}
            className="flex flex-col gap-3 pb-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div
              className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
              style={{ backgroundImage: `url(${category.imageUrl})` }}
              role="img"
              aria-label={`${category.name} category`}
            />
            <p className="text-foreground text-base font-medium leading-normal">
              {category.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
