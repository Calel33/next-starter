"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, MapPin, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDebounce } from '@/hooks/useDebounce';
import { useIsMobile } from '@/hooks/use-mobile';
import { SearchFilters } from '@/hooks/useBusinessSearch';
import { useAnalytics } from '@/hooks/useAnalytics';

export interface SearchInterfaceProps {
  className?: string;
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
  placeholder?: string;
  showLocationButton?: boolean;
  showFilterButton?: boolean;
  isLoading?: boolean;
  searchDebounceMs?: number;
  // Mobile-specific props
  enableMobileOptimizations?: boolean;
  mobileLayout?: 'compact' | 'expanded';
  showMobileKeyboardHints?: boolean;
}

/**
 * SearchInterface component for business directory search with mobile optimizations
 * Provides text search, location detection, filter management, and mobile-specific UI patterns
 */
export function SearchInterface({
  className,
  filters,
  onFiltersChange,
  onClearFilters,
  placeholder = "Search businesses...",
  showLocationButton = true,
  showFilterButton = true,
  isLoading = false,
  searchDebounceMs = 300,
  // Mobile-specific defaults
  enableMobileOptimizations = true,
  mobileLayout = 'compact',
  showMobileKeyboardHints = true,
}: SearchInterfaceProps) {
  const [searchValue, setSearchValue] = useState(filters.query || '');
  const { position, requestLocation, isLoading: locationLoading } = useGeolocation();
  const { trackSearchQuery } = useAnalytics();

  // Mobile detection and state
  const isMobile = useIsMobile();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search input to reduce API calls
  const debouncedSearchValue = useDebounce(searchValue, searchDebounceMs);

  // Handle search input change with mobile optimizations
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  // Mobile-specific keyboard handling
  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);

    // On mobile, scroll to search input and adjust viewport
    if (isMobile && enableMobileOptimizations && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [isMobile, enableMobileOptimizations]);

  const handleSearchBlur = useCallback(() => {
    setIsSearchFocused(false);
  }, []);

  // Handle mobile keyboard submission
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isMobile) {
      // On mobile, blur the input to hide keyboard after search
      searchInputRef.current?.blur();
    }
  }, [isMobile]);

  // Effect to handle debounced search updates with analytics tracking
  useEffect(() => {
    const query = debouncedSearchValue || undefined;
    onFiltersChange({ query });

    // Track search query if it's not empty
    if (query && query.trim().length > 0) {
      trackSearchQuery(query, {
        searchDuration: searchDebounceMs,
        filterApplied: Object.keys(filters).filter(key =>
          key !== 'query' && filters[key as keyof SearchFilters] !== undefined
        ),
        location: position ? { lat: position.lat, lng: position.lng } : undefined,
      });
    }
  }, [debouncedSearchValue, onFiltersChange, trackSearchQuery, searchDebounceMs, position]);

  // Check if search is pending (user typed but debounce hasn't fired yet)
  const isSearchPending = searchValue !== debouncedSearchValue;

  // Handle location request with analytics tracking
  const handleLocationRequest = useCallback(() => {
    if (position) {
      // Use cached position
      onFiltersChange({
        userLocation: {
          lat: position.lat,
          lng: position.lng,
        },
      });

      // Track location usage
      trackSearchQuery(searchValue || '', {
        action: 'location_applied',
        location: { lat: position.lat, lng: position.lng },
        filterApplied: ['location'],
      });
    } else {
      // Request new position
      requestLocation();

      // Track location request
      trackSearchQuery(searchValue || '', {
        action: 'location_requested',
        filterApplied: ['location'],
      });
    }
  }, [position, requestLocation, onFiltersChange, trackSearchQuery, searchValue]);

  // Update user location when position changes
  React.useEffect(() => {
    if (position && !filters.userLocation) {
      onFiltersChange({
        userLocation: {
          lat: position.lat,
          lng: position.lng,
        },
      });
    }
  }, [position, filters.userLocation, onFiltersChange]);

  // Clear specific filter with analytics tracking
  const clearFilter = useCallback((filterKey: keyof SearchFilters) => {
    onFiltersChange({ [filterKey]: undefined });

    // Track filter clearing
    trackSearchQuery(searchValue || '', {
      action: 'filter_cleared',
      filterApplied: [filterKey],
    });
  }, [onFiltersChange, trackSearchQuery, searchValue]);

  // Count active filters
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.categoryId) count++;
    if (filters.openNow) count++;
    if (filters.maxDistance) count++;
    if (filters.sortBy && filters.sortBy !== 'relevance') count++;
    return count;
  }, [filters]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main search bar with mobile optimizations */}
      <div className="relative">
        <Search className={cn(
          "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors",
          isSearchPending ? "text-primary animate-pulse" : "text-muted-foreground"
        )} />
        <Input
          ref={searchInputRef}
          type="search"
          placeholder={isMobile && enableMobileOptimizations ?
            (mobileLayout === 'compact' ? "Search..." : placeholder) :
            placeholder
          }
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            "pl-10 pr-4 transition-colors",
            // Mobile-optimized sizing
            isMobile && enableMobileOptimizations ? "h-14 text-base" : "h-12 text-base",
            isSearchPending && "border-primary/50",
            isSearchFocused && isMobile && "border-primary"
          )}
          disabled={isLoading}
          // Mobile-specific attributes
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          inputMode="search"
          enterKeyHint="search"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "absolute right-2 top-1/2 transform -translate-y-1/2 p-0",
              // Larger touch target on mobile
              isMobile && enableMobileOptimizations ? "h-10 w-10" : "h-8 w-8"
            )}
            onClick={() => {
              handleSearchChange('');
              // Track search clearing
              trackSearchQuery('', {
                action: 'filter_cleared',
                filterApplied: ['query'],
              });
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isSearchPending && (
          <div className={cn(
            "absolute top-1/2 transform -translate-y-1/2",
            searchValue ? "right-14" : "right-4"
          )}>
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
          </div>
        )}

        {/* Mobile keyboard hint */}
        {isMobile && enableMobileOptimizations && showMobileKeyboardHints && isSearchFocused && (
          <div className="absolute top-full left-0 right-0 mt-1 text-xs text-muted-foreground text-center">
            Tap "Search" to find businesses
          </div>
        )}
      </div>

      {/* Action buttons with mobile layout */}
      <div className={cn(
        "flex items-center gap-2",
        isMobile && enableMobileOptimizations ?
          (mobileLayout === 'compact' ? "flex-wrap" : "flex-col space-y-2") :
          "flex-wrap"
      )}>
        {showLocationButton && (
          <Button
            variant={filters.userLocation ? "default" : "outline"}
            size={isMobile && enableMobileOptimizations ? "default" : "sm"}
            onClick={handleLocationRequest}
            disabled={locationLoading || isLoading}
            className={cn(
              "flex items-center gap-2",
              isMobile && enableMobileOptimizations && mobileLayout === 'expanded' && "w-full justify-center"
            )}
          >
            <MapPin className="h-4 w-4" />
            {locationLoading ? 'Locating...' :
             filters.userLocation ? 'Location Set' :
             (isMobile && mobileLayout === 'compact' ? 'Location' : 'Use My Location')}
          </Button>
        )}

        {showFilterButton && (
          <Button
            variant="outline"
            size={isMobile && enableMobileOptimizations ? "default" : "sm"}
            className={cn(
              "flex items-center gap-2",
              isMobile && enableMobileOptimizations && mobileLayout === 'expanded' && "w-full justify-center"
            )}
            onClick={() => isMobile ? setShowMobileFilters(!showMobileFilters) : undefined}
            disabled={isLoading}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}

        {/* Clear all filters */}
        {(searchValue || activeFilterCount > 0 || filters.userLocation) && (
          <Button
            variant="ghost"
            size={isMobile && enableMobileOptimizations ? "default" : "sm"}
            onClick={() => {
              setSearchValue('');
              onClearFilters();
              setShowMobileFilters(false);
            }}
            disabled={isLoading}
            className={cn(
              "text-muted-foreground hover:text-foreground",
              isMobile && enableMobileOptimizations && mobileLayout === 'expanded' && "w-full"
            )}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Mobile filter panel */}
      {isMobile && enableMobileOptimizations && showMobileFilters && (
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileFilters(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile filter content would go here */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Filter options will be displayed here
            </p>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {(filters.categoryId || filters.openNow || filters.maxDistance || filters.userLocation) && (
        <div className={cn(
          "flex items-center gap-2",
          isMobile && enableMobileOptimizations ? "flex-wrap" : "flex-wrap"
        )}>
          <span className="text-sm text-muted-foreground">
            {isMobile && mobileLayout === 'compact' ? 'Filters:' : 'Active filters:'}
          </span>
          
          {filters.userLocation && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Near me
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => clearFilter('userLocation')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.openNow && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Open now
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => clearFilter('openNow')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.maxDistance && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Within {filters.maxDistance}km
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => clearFilter('maxDistance')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.categoryId && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category selected
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => clearFilter('categoryId')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Search suggestions with mobile optimization */}
      {searchValue && searchValue.length > 0 && searchValue.length < 3 && (
        <div className={cn(
          "text-sm text-muted-foreground",
          isMobile && enableMobileOptimizations && "text-center py-2"
        )}>
          {isMobile && mobileLayout === 'compact' ?
            "Type 3+ characters" :
            "Type at least 3 characters to search"
          }
        </div>
      )}

      {/* Mobile-specific search tips */}
      {isMobile && enableMobileOptimizations && showMobileKeyboardHints && isSearchFocused && searchValue.length === 0 && (
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Try searching for:</p>
          <div className="flex flex-wrap gap-1 justify-center">
            <span className="bg-muted px-2 py-1 rounded text-xs">restaurants</span>
            <span className="bg-muted px-2 py-1 rounded text-xs">coffee</span>
            <span className="bg-muted px-2 py-1 rounded text-xs">shops</span>
          </div>
        </div>
      )}
    </div>
  );
}
