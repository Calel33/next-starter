"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { MapPin, Phone, Globe, Clock, Eye, MoreHorizontal, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { SearchResult } from '@/hooks/useBusinessSearch';
import { formatDistance } from '@/hooks/useGeolocation';

export interface SearchResultsProps {
  className?: string;
  results: SearchResult[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onResultClick?: (result: SearchResult) => void;
  onResultHover?: (result: SearchResult | null) => void;
  selectedResultId?: string;
  viewMode?: 'list' | 'grid';
  showDistance?: boolean;
  showStatus?: boolean;
  isRealTimeConnected?: boolean;
  hasNewResults?: boolean;
  lastUpdated?: number | null;
  onMarkAsViewed?: () => void;
}

/**
 * SearchResults component for displaying business search results
 * Supports list/grid view, loading states, and result interactions
 */
export function SearchResults({
  className,
  results,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onResultClick,
  onResultHover,
  selectedResultId,
  viewMode = 'list',
  showDistance = true,
  showStatus = false,
  isRealTimeConnected = true,
  hasNewResults = false,
  lastUpdated = null,
  onMarkAsViewed,
}: SearchResultsProps) {

  // Handle result click
  const handleResultClick = useCallback((result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    }
  }, [onResultClick]);

  // Handle result hover
  const handleResultHover = useCallback((result: SearchResult | null) => {
    if (onResultHover) {
      onResultHover(result);
    }
  }, [onResultHover]);

  // Format business hours for display
  const formatBusinessHours = (hours?: SearchResult['hours']) => {
    if (!hours || hours.length === 0) return 'Hours not available';
    
    const today = new Date().getDay();
    const todayHours = hours.find(h => h.day === today);
    
    if (!todayHours) return 'Hours not available';
    if (todayHours.closed) return 'Closed today';
    
    return `${todayHours.open} - ${todayHours.close}`;
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  // Render individual result
  const renderResult = (result: SearchResult) => {
    const isSelected = selectedResultId === result._id;
    
    return (
      <Card
        key={result._id}
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          isSelected && "ring-2 ring-primary shadow-md",
          viewMode === 'grid' && "h-full"
        )}
        onClick={() => handleResultClick(result)}
        onMouseEnter={() => handleResultHover(result)}
        onMouseLeave={() => handleResultHover(null)}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{result.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">
                    {result.address.line1}, {result.address.city}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-2">
                {showDistance && result.distance && (
                  <Badge variant="secondary" className="text-xs">
                    {formatDistance(result.distance)}
                  </Badge>
                )}
                {showStatus && (
                  <Badge 
                    variant={result.status === 'approved' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {result.status}
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            {result.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {result.description}
              </p>
            )}

            {/* Business info */}
            <div className="flex items-center gap-4 text-sm">
              {/* Hours */}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className={cn(
                  result.isOpenNow ? "text-green-600" : "text-muted-foreground"
                )}>
                  {result.isOpenNow ? "Open" : "Closed"} • {formatBusinessHours(result.hours)}
                </span>
              </div>

              {/* Views */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span>{result.views}</span>
              </div>
            </div>

            {/* Contact actions */}
            <div className="flex items-center gap-2 pt-2">
              {result.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`tel:${result.phone}`, '_self');
                  }}
                >
                  <Phone className="h-3 w-3" />
                  Call
                </Button>
              )}
              
              {result.website && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(result.website, '_blank');
                  }}
                >
                  <Globe className="h-3 w-3" />
                  Website
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  const query = encodeURIComponent(`${result.name} ${result.address.line1} ${result.address.city}`);
                  window.open(`https://maps.google.com/maps?q=${query}`, '_blank');
                }}
              >
                <MapPin className="h-3 w-3" />
                Directions
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle more options (could open a dropdown menu)
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading && results.length === 0) {
    return (
      <div className={className}>
        {renderSkeleton()}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No businesses found</h3>
          <p className="text-sm">
            Try adjusting your search criteria or expanding your search area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Results count and real-time status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {results.length} business{results.length !== 1 ? 'es' : ''} found
          </p>

          {/* Real-time connection indicator */}
          <div className="flex items-center gap-1">
            {isRealTimeConnected ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {isRealTimeConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        {/* New results indicator */}
        {hasNewResults && (
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkAsViewed}
            className="text-xs animate-pulse border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            New results
          </Button>
        )}
      </div>

      {/* Results grid/list */}
      <div className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-4"
      )}>
        {results.map(renderResult)}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {/* Loading more indicator */}
      {isLoading && results.length > 0 && (
        <div className="mt-4">
          <Card className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
