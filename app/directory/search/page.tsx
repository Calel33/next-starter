"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Filter, 
  Grid, 
  Map, 
  Search,
  X,
  SlidersHorizontal,
  MapPin,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type ViewMode = 'list' | 'map' | 'split';
type SortOption = 'relevance' | 'distance' | 'name' | 'newest';

/**
 * Search Results Page
 * Advanced search functionality with URL-based state management
 */
export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  
  const { position } = useGeolocation();

  // Parse URL parameters to initialize search
  const getInitialFilters = useCallback((): SearchFilters => {
    const filters: SearchFilters = {
      userLocation: position ? { lat: position.latitude, lng: position.longitude } : undefined,
      sortBy: 'relevance',
    };

    // Parse query parameter
    const query = searchParams.get('q');
    if (query) filters.query = query;

    // Parse category parameter
    const category = searchParams.get('category');
    if (category) filters.categoryId = category as any;

    // Parse location parameters
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (lat && lng) {
      filters.userLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };
    }

    // Parse other filters
    const openNow = searchParams.get('open');
    if (openNow === 'true') filters.openNow = true;

    const maxDistance = searchParams.get('distance');
    if (maxDistance) filters.maxDistance = parseInt(maxDistance);

    const sortBy = searchParams.get('sort') as SortOption;
    if (sortBy) filters.sortBy = sortBy;

    return filters;
  }, [searchParams, position]);

  const {
    filters,
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
  } = useBusinessSearch(getInitialFilters());

  // Get categories for filter panel
  const categories = useQuery(api.categories.getCategories);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.query) params.set('q', filters.query);
    if (filters.categoryId) params.set('category', filters.categoryId);
    if (filters.userLocation) {
      params.set('lat', filters.userLocation.lat.toString());
      params.set('lng', filters.userLocation.lng.toString());
    }
    if (filters.openNow) params.set('open', 'true');
    if (filters.maxDistance) params.set('distance', filters.maxDistance.toString());
    if (filters.sortBy && filters.sortBy !== 'relevance') params.set('sort', filters.sortBy);

    const newUrl = params.toString() ? `/directory/search?${params.toString()}` : '/directory/search';
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // Convert search results to map markers
  const mapMarkers: MapMarker[] = results.map(listing => ({
    id: listing._id,
    lng: listing.location.lng,
    lat: listing.location.lat,
    data: listing,
  }));

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
    if (zoom > 10) {
      updateFilters({
        bounds
      });
    }
  }, [updateFilters]);

  // Handle sort change
  const handleSortChange = useCallback((sortBy: SortOption) => {
    updateFilters({ sortBy });
  }, [updateFilters]);

  // Get active filter count
  const activeFilterCount = Object.keys(filters).filter(key => 
    key !== 'sortBy' && key !== 'userLocation' && filters[key as keyof SearchFilters]
  ).length;

  // Get current category name
  const currentCategory = categories?.find(cat => cat._id === filters.categoryId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            {/* Breadcrumb */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/directory">Directory</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Search Results</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Search Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Search className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Search Results</h1>
                  <p className="text-muted-foreground mt-1">
                    {filters.query ? `Results for "${filters.query}"` : 'Browse all businesses'}
                    {currentCategory && ` in ${currentCategory.name}`}
                  </p>
                </div>
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:w-auto"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
                
                {/* Sort Dropdown */}
                <Select value={filters.sortBy || 'relevance'} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-40">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.query && (
                  <Badge variant="secondary" className="gap-2">
                    Search: {filters.query}
                    <button
                      onClick={() => updateFilters({ query: undefined })}
                      className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {currentCategory && (
                  <Badge variant="secondary" className="gap-2">
                    Category: {currentCategory.name}
                    <button
                      onClick={() => updateFilters({ categoryId: undefined })}
                      className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.openNow && (
                  <Badge variant="secondary" className="gap-2">
                    <Clock className="h-3 w-3" />
                    Open Now
                    <button
                      onClick={() => updateFilters({ openNow: undefined })}
                      className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.maxDistance && (
                  <Badge variant="secondary" className="gap-2">
                    <MapPin className="h-3 w-3" />
                    Within {filters.maxDistance}km
                    <button
                      onClick={() => updateFilters({ maxDistance: undefined })}
                      className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 px-2 text-xs"
                >
                  Clear All
                </Button>
              </div>
            )}

            {/* Results Summary */}
            {totalCount !== undefined && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {totalCount} {totalCount === 1 ? 'business' : 'businesses'} found
                  {filters.userLocation && ' near you'}
                </span>
                <span>
                  Sorted by {filters.sortBy || 'relevance'}
                </span>
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
                  <CardTitle className="text-lg">Advanced Filters</CardTitle>
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
                    Error loading search results: {error}
                  </p>
                </CardContent>
              </Card>
            )}

            {!error && totalCount === 0 && !isLoading && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  <Button onClick={clearFilters}>Clear All Filters</Button>
                </CardContent>
              </Card>
            )}

            {!error && (totalCount > 0 || isLoading) && (
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
                      showDistance={!!filters.userLocation}
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
                            center: filters.userLocation ?
                              [filters.userLocation.lng, filters.userLocation.lat] :
                              [-74.006, 40.7128], // Default to NYC
                            zoom: filters.userLocation ? 12 : 10,
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
    </div>
  );
}
