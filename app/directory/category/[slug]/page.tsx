"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { notFound } from 'next/navigation';
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
import { 
  MapPin, 
  Filter, 
  Grid, 
  Map, 
  ChevronLeft,
  Building2,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

type ViewMode = 'list' | 'map' | 'split';

/**
 * Category Browse Page
 * Displays businesses filtered by a specific category
 */
export default function CategoryPage({ params }: CategoryPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  
  const { position } = useGeolocation();

  // Fetch all categories to find the current one
  const categories = useQuery(api.categories.getCategories);
  
  // Find the current category by slug
  const currentCategory = useMemo(() => {
    return categories?.find(cat => cat.slug === params.slug);
  }, [categories, params.slug]);

  // Initialize search filters with the category
  const initialFilters: SearchFilters = useMemo(() => ({
    categoryId: currentCategory?._id,
    userLocation: position ? { lat: position.latitude, lng: position.longitude } : undefined,
    sortBy: 'relevance',
  }), [currentCategory?._id, position]);

  const {
    filters,
    results,
    isLoading,
    error,
    updateFilters,
    clearFilters,
    totalCount,
  } = useBusinessSearch(initialFilters);

  // Handle loading state
  if (categories === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle category not found
  if (!currentCategory) {
    notFound();
  }

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

  // Handle filter changes while preserving category
  const handleFiltersChange = useCallback((newFilters: Partial<SearchFilters>) => {
    updateFilters({
      ...newFilters,
      categoryId: currentCategory._id, // Always maintain the category filter
    });
  }, [updateFilters, currentCategory._id]);

  // Handle clear filters while preserving category
  const handleClearFilters = useCallback(() => {
    clearFilters();
    updateFilters({ categoryId: currentCategory._id });
  }, [clearFilters, updateFilters, currentCategory._id]);

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
                  <BreadcrumbPage>Categories</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentCategory.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Category Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{currentCategory.icon || '📍'}</div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{currentCategory.name}</h1>
                  <p className="text-muted-foreground mt-1">
                    {currentCategory.description || `Discover ${currentCategory.name.toLowerCase()} businesses in your area`}
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
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                  placeholder={`Search ${currentCategory.name.toLowerCase()}...`}
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
                {Object.keys(filters).filter(key => key !== 'categoryId').length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {Object.keys(filters).filter(key => key !== 'categoryId').length}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Results Summary */}
            {totalCount !== undefined && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {totalCount} {totalCount === 1 ? 'business' : 'businesses'} found
                  {filters.userLocation && ' near you'}
                </span>
                {filters.query && (
                  <span>for "{filters.query}"</span>
                )}
              </div>
            )}

            {/* Category Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {currentCategory.listingCount || 0} total listings
                </span>
              </div>
              {currentCategory.trending && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">Trending</span>
                </div>
              )}
            </div>
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
                    onFiltersChange={handleFiltersChange}
                    categories={categories || []}
                    className="space-y-4"
                    hideCategories={true} // Hide category filter since we're already in a category
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
                      selectedId={selectedListing}
                      onSelect={handleListingSelect}
                      showDistance={!!filters.userLocation}
                      userLocation={filters.userLocation}
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

      {/* Related Categories Section */}
      {categories && categories.length > 1 && (
        <div className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-semibold mb-6">Related Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {categories
                .filter(cat => cat._id !== currentCategory._id)
                .slice(0, 11)
                .map((category) => (
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
