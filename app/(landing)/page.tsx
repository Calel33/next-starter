import { LocalBizHeader } from "./components/LocalBizHeader";
import { HeroSection } from "./components/HeroSection";
import { MapSection } from "./components/MapSection";
import { FeaturedBusinesses } from "./components/FeaturedBusinesses";
import { PopularCategories } from "./components/PopularCategories";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LocalBiz - Explore Local Businesses Worldwide",
  description: "Discover top-rated services and businesses in any location. Use the interactive globe to find businesses near you or anywhere in the world.",
};

export default function Home() {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-background group/design-root overflow-x-hidden font-sans">
      <div className="layout-container flex h-full grow flex-col">
        <LocalBizHeader />
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <HeroSection />
            <MapSection />
            <FeaturedBusinesses />
            <PopularCategories />
          </div>
        </div>
      </div>
    </div>
  );
}
