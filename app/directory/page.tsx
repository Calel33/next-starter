"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { SearchInterface } from '@/components/custom/SearchInterface';
import { MapboxMap, type MapMarker } from '@/components/custom/MapboxMap';
import { SearchResults } from '@/components/custom/SearchResults';
import { FilterPanel } from '@/components/custom/FilterPanel';
import { useBusinessSearch, type SearchFilters } from '@/hooks/useBusinessSearch';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Filter, Grid, Map } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type ViewMode = 'list' | 'map' | 'split';

/**
 * Directory Homepage
 * Main entry point for the business directory with search, map, and filtering
 */
export default function DirectoryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  
  const { position } = useGeolocation();

  // Initialize search with user location if available - memoized to prevent re-renders
  const initialFilters: SearchFilters = useMemo(() => ({
    userLocation: position ? { lat: position.latitude, lng: position.longitude } : undefined,
    sortBy: 'relevance',
  }), [position]);
  
  const {
    searchFilters: filters,
    results,
    isLoading,
    error,
    updateFilters,
    clearFilters,
    totalCount,
    isRealTimeConnected,
    hasNewResults,
    lastUpdated,
    markResultsAsViewed,
  } = useBusinessSearch(initialFilters);

  // Get categories for filter panel
  const categories = useQuery(api.categories.getCategories);

  // Convert search results to map markers - memoized to prevent re-renders
  const mapMarkers: MapMarker[] = useMemo(() =>
    results.map(listing => ({
      id: listing._id,
      lng: listing.location.lng,
      lat: listing.location.lat,
      data: listing,
    })), [results]
  );

  // Handle marker click on map
  const handleMarkerClick = useCallback((marker: MapMarker) => {
    setSelectedListing(marker.id);
  }, []);

  // Handle listing selection from search results
  const handleListingSelect = useCallback((listingId: string) => {
    setSelectedListing(listingId);
  }, []);

  // Handle viewport change for optimized data loading
  const handleViewportChange = useCallback((bounds: { north: number; south: number; east: number; west: number }, zoom: number) => {
    if (zoom > 10) { // Only filter by bounds when zoomed in enough
      // Check if bounds have significantly changed to prevent infinite loops
      const currentBounds = filters?.bounds;
      if (currentBounds) {
        const threshold = 0.001; // Minimum change threshold
        const hasSignificantChange =
          Math.abs(bounds.north - currentBounds.north) > threshold ||
          Math.abs(bounds.south - currentBounds.south) > threshold ||
          Math.abs(bounds.east - currentBounds.east) > threshold ||
          Math.abs(bounds.west - currentBounds.west) > threshold;

        if (!hasSignificantChange) {
          return; // Skip update if bounds haven't changed significantly
        }
      }

      updateFilters({
        bounds
      });
    }
  }, [updateFilters, filters?.bounds]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Business Directory</h1>
                <p className="text-muted-foreground mt-1">
                  Discover local businesses in your area
                </p>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="hidden md:flex"
                >
                  <Grid className="h-4 w-4 mr-2" />
                  List
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="hidden md:flex"
                >
                  <Map className="h-4 w-4 mr-2" />
                  Map
                </Button>
                <Button
                  variant={viewMode === 'split' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('split')}
                  className="hidden md:flex"
                >
                  Split
                </Button>
              </div>
            </div>

            {/* Search Interface */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <SearchInterface
                  filters={filters}
                  onFiltersChange={updateFilters}
                  onClearFilters={clearFilters}
                  placeholder="Search businesses, services, or locations..."
                  isLoading={isLoading}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {filters && Object.keys(filters).length > 1 && (
                  <Badge variant="secondary" className="ml-2">
                    {Object.keys(filters).length - 1}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Results Summary */}
            {totalCount !== undefined && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {totalCount} {totalCount === 1 ? 'business' : 'businesses'} found
                  {filters?.userLocation && ' near you'}
                </span>
                {filters?.query && (
                  <span>for "{filters.query}"</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Panel */}
          {showFilters && (
            <div className="lg:w-80">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <FilterPanel
                    filters={filters}
                    onFiltersChange={updateFilters}
                    categories={categories || []}
                    className="space-y-4"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Area */}
          <div className="flex-1">
            {error && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive">
                    Error loading businesses: {error}
                  </p>
                </CardContent>
              </Card>
            )}

            {!error && (
              <div className={cn(
                "grid gap-6",
                viewMode === 'split' && "lg:grid-cols-2",
                viewMode === 'list' && "grid-cols-1",
                viewMode === 'map' && "grid-cols-1"
              )}>
                {/* Search Results */}
                {(viewMode === 'list' || viewMode === 'split') && (
                  <div className="space-y-4">
                    <SearchResults
                      results={results}
                      isLoading={isLoading}
                      selectedResultId={selectedListing}
                      onResultClick={(result) => handleListingSelect(result._id)}
                      showDistance={!!filters?.userLocation}
                      isRealTimeConnected={isRealTimeConnected}
                      hasNewResults={hasNewResults}
                      lastUpdated={lastUpdated}
                      onMarkAsViewed={markResultsAsViewed}
                    />
                  </div>
                )}

                {/* Map View */}
                {(viewMode === 'map' || viewMode === 'split') && (
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-0">
                        <MapboxMap
                          markers={mapMarkers}
                          onMarkerClick={handleMarkerClick}
                          onViewportChange={handleViewportChange}
                          height={viewMode === 'map' ? '600px' : '400px'}
                          className="rounded-lg overflow-hidden"
                          enableViewportOptimization={true}
                          maxMarkersBeforeOptimization={50}
                          viewportChangeDebounce={300}
                          config={{
                            center: filters?.userLocation ?
                              [filters.userLocation.lng, filters.userLocation.lat] :
                              [-74.006, 40.7128], // Default to NYC
                            zoom: filters?.userLocation ? 12 : 10,
                          }}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popular Categories Section */}
      {!filters?.query && categories && categories.length > 0 && (
        <div className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-semibold mb-6">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {categories.slice(0, 12).map((category) => (
                <Link
                  key={category._id}
                  href={`/directory/category/${category.slug}`}
                  className="group"
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{category.icon || '📍'}</div>
                      <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {category.listingCount || 0} listings
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
