"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Minus, Navigation, MapPin } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { MapboxMap, type MapMarker } from "@/components/custom/MapboxMap";
import { useGeolocation } from "@/hooks/useGeolocation";
import { geocodeAddress } from "@/lib/geocoding";
import { cn } from "@/lib/utils";

export function MapSection() {
  const [locationQuery, setLocationQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-74.006, 40.7128]); // NYC default
  const [mapZoom, setMapZoom] = useState(12);
  const [searchMarkers, setSearchMarkers] = useState<MapMarker[]>([]);

  const mapRef = useRef<any>(null);
  const { position, requestLocation, isLoading: locationLoading } = useGeolocation();

  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setZoom(Math.min(currentZoom + 1, 18));
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setZoom(Math.max(currentZoom - 1, 1));
    }
  }, []);

  const handleLocationSearch = useCallback(async () => {
    if (!locationQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await geocodeAddress(locationQuery, {
        limit: 5,
        proximity: position ? [position.lng, position.lat] : undefined,
      });

      if (results.length > 0) {
        const firstResult = results[0];
        const [lng, lat] = firstResult.center;

        // Update map center
        setMapCenter([lng, lat]);
        setMapZoom(14);

        // Add search result markers
        const markers: MapMarker[] = results.map((result, index) => ({
          id: `search-${index}`,
          lng: result.center[0],
          lat: result.center[1],
          data: {
            name: result.place_name,
            type: 'search_result',
          },
        }));

        setSearchMarkers(markers);

        // Fly to the location if map is available
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: 14,
            essential: true,
          });
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [locationQuery, position]);

  const handleMyLocation = useCallback(() => {
    if (position) {
      // Use cached position
      setMapCenter([position.lng, position.lat]);
      setMapZoom(15);

      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [position.lng, position.lat],
          zoom: 15,
          essential: true,
        });
      }
    } else {
      // Request new location
      requestLocation();
    }
  }, [position, requestLocation]);

  const handleMapLoad = useCallback((map: any) => {
    mapRef.current = map;
  }, []);

  return (
    <div className="@container flex flex-col h-full flex-1">
      <div className="flex flex-1 flex-col @[480px]:px-4 @[480px]:py-3">
        <div className="relative flex min-h-[320px] flex-1 flex-col @[480px]:rounded-xl overflow-hidden">
          {/* MapboxMap Component */}
          <MapboxMap
            className="absolute inset-0"
            height="100%"
            markers={searchMarkers}
            onMapLoad={handleMapLoad}
            config={{
              center: mapCenter,
              zoom: mapZoom,
              style: 'mapbox://styles/mapbox/streets-v12',
            }}
            enableMobileOptimizations={true}
            showClustering={false}
          />

          {/* Overlay Controls */}
          <div className="absolute inset-0 flex flex-col justify-between px-4 pb-4 pt-5 @[480px]:px-8 @[480px]:pb-6 @[480px]:pt-8 pointer-events-none">
            {/* Location Search */}
            <div className="flex flex-col min-w-40 h-12 pointer-events-auto">
              <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                <div className="text-muted-foreground flex border-none bg-card items-center justify-center pl-4 rounded-l-xl border-r-0">
                  <Search className={cn("h-6 w-6", isSearching && "animate-spin")} />
                </div>
                <Input
                  placeholder="Search for a location"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                  disabled={isSearching}
                  className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-foreground focus:outline-0 focus:ring-0 border-none bg-card focus:border-none h-full placeholder:text-muted-foreground px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                />
              </div>
            </div>

            {/* Map Controls */}
            <div className="flex flex-col items-end gap-3 pointer-events-auto">
              {/* Zoom Controls */}
              <div className="flex flex-col gap-0.5">
                <Button
                  onClick={handleZoomIn}
                  className="flex size-10 items-center justify-center rounded-t-full bg-card shadow-sm hover:shadow-md transition-shadow p-0"
                  variant="ghost"
                  aria-label="Zoom in"
                >
                  <Plus className="h-6 w-6 text-foreground" />
                </Button>
                <Button
                  onClick={handleZoomOut}
                  className="flex size-10 items-center justify-center rounded-b-full bg-card shadow-sm hover:shadow-md transition-shadow p-0"
                  variant="ghost"
                  aria-label="Zoom out"
                >
                  <Minus className="h-6 w-6 text-foreground" />
                </Button>
              </div>

              {/* My Location Button */}
              <Button
                onClick={handleMyLocation}
                disabled={locationLoading}
                className={cn(
                  "flex size-10 items-center justify-center rounded-full bg-card shadow-sm hover:shadow-md transition-shadow p-0",
                  position && "bg-primary text-primary-foreground"
                )}
                variant="ghost"
                aria-label="Get my location"
              >
                {locationLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : position ? (
                  <MapPin className="h-6 w-6" />
                ) : (
                  <Navigation className="h-6 w-6 scale-x-[-1]" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
