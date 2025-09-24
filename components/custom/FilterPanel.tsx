"use client";

import React, { useState } from 'react';
import { Filter, ChevronDown, Clock, MapPin, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { SearchFilters } from '@/hooks/useBusinessSearch';
import { Id } from '@/convex/_generated/dataModel';

export interface FilterPanelProps {
  className?: string;
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}

/**
 * FilterPanel component for advanced search filtering
 * Provides category selection, distance, hours, and sorting options
 */
export function FilterPanel({
  className,
  filters,
  onFiltersChange,
  onClearFilters,
  isCollapsible = true,
  defaultExpanded = false,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Fetch categories for filter options
  const categories = useQuery(api.categories.getCategories, {});

  // Handle category selection
  const handleCategoryChange = (categoryId: string) => {
    onFiltersChange({
      categoryId: categoryId === 'all' ? undefined : (categoryId as Id<"categories">),
    });
  };

  // Handle distance filter
  const handleDistanceChange = (distance: string) => {
    onFiltersChange({
      maxDistance: distance === 'all' ? undefined : parseInt(distance),
    });
  };

  // Handle sort order
  const handleSortChange = (sortBy: string) => {
    onFiltersChange({
      sortBy: sortBy as SearchFilters['sortBy'],
    });
  };

  // Handle open now toggle
  const handleOpenNowToggle = (checked: boolean) => {
    onFiltersChange({
      openNow: checked || undefined,
    });
  };

  // Count active filters
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.categoryId) count++;
    if (filters.openNow) count++;
    if (filters.maxDistance) count++;
    if (filters.sortBy && filters.sortBy !== 'relevance') count++;
    return count;
  }, [filters]);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Category
        </Label>
        <Select
          value={filters.categoryId || 'all'}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category._id} value={category._id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Distance Filter */}
      {filters.userLocation && (
        <>
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Distance
            </Label>
            <Select
              value={filters.maxDistance?.toString() || 'all'}
              onValueChange={handleDistanceChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any distance</SelectItem>
                <SelectItem value="1">Within 1 km</SelectItem>
                <SelectItem value="5">Within 5 km</SelectItem>
                <SelectItem value="10">Within 10 km</SelectItem>
                <SelectItem value="25">Within 25 km</SelectItem>
                <SelectItem value="50">Within 50 km</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
        </>
      )}

      {/* Hours Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Hours
        </Label>
        <div className="flex items-center space-x-2">
          <Switch
            id="open-now"
            checked={filters.openNow || false}
            onCheckedChange={handleOpenNowToggle}
          />
          <Label htmlFor="open-now" className="text-sm">
            Open now
          </Label>
        </div>
      </div>

      <Separator />

      {/* Sort Order */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4" />
          Sort by
        </Label>
        <Select
          value={filters.sortBy || 'relevance'}
          onValueChange={handleSortChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Relevance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            {filters.userLocation && (
              <SelectItem value="distance">Distance</SelectItem>
            )}
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="newest">Newest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <>
          <Separator />
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-full"
          >
            Clear all filters
          </Button>
        </>
      )}
    </div>
  );

  if (!isCollapsible) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FilterContent />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between p-0 h-auto font-medium"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "transform rotate-180"
            )}
          />
        </Button>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <FilterContent />
        </CardContent>
      )}
    </Card>
  );
}
