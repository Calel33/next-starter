"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { calculateDistance } from './useGeolocation';
import { useDebounce } from './useDebounce';
import { useAnalytics } from './useAnalytics';

export interface SearchFilters {
  query?: string;
  categoryId?: Id<"categories">;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  userLocation?: {
    lat: number;
    lng: number;
  };
  openNow?: boolean;
  maxDistance?: number; // in kilometers
  sortBy?: 'relevance' | 'distance' | 'name' | 'newest';
}

export interface SearchResult {
  _id: Id<"listings">;
  _creationTime: number;
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  website?: string;
  email?: string;
  address: {
    line1: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  categories: Id<"categories">[];
  hours?: Array<{
    day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    open: string;
    close: string;
    closed: boolean;
  }>;
  images: Id<"imageAssets">[];
  status: "pending" | "approved" | "rejected" | "archived";
  views: number;
  phoneClicks: number;
  websiteClicks: number;
  directionsClicks: number;
  distance?: number; // calculated distance from user location
  isOpenNow?: boolean; // calculated based on current time and hours
}

export interface BusinessSearchHookReturn {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  searchFilters: SearchFilters;
  updateFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  loadMore: () => void;
  isRealTimeConnected: boolean;
  lastUpdated: number | null;
  hasNewResults: boolean;
  markResultsAsViewed: () => void;
}

// Default search configuration
const DEFAULT_LIMIT = 50;
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Custom hook for business search with real-time Convex queries
 * Handles filtering, sorting, and pagination
 */
export function useBusinessSearch(initialFilters: SearchFilters = {}): BusinessSearchHookReturn {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(initialFilters);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [hasNewResults, setHasNewResults] = useState(false);
  const previousResultsRef = useRef<SearchResult[]>([]);
  const { trackSearchQuery } = useAnalytics();

  // Debounce search query to avoid excessive API calls
  const debouncedQuery = useDebounce(searchFilters.query, SEARCH_DEBOUNCE_MS);

  // Create stable bounds string for memoization
  const boundsKey = useMemo(() => {
    if (!searchFilters.bounds) return null;
    const { north, south, east, west } = searchFilters.bounds;
    return `${north.toFixed(6)},${south.toFixed(6)},${east.toFixed(6)},${west.toFixed(6)}`;
  }, [searchFilters.bounds]);

  // Prepare search arguments for Convex query
  const searchArgs = useMemo(() => ({
    query: debouncedQuery,
    categoryId: searchFilters.categoryId,
    bounds: searchFilters.bounds,
    status: "approved" as const,
    limit,
  }), [debouncedQuery, searchFilters.categoryId, searchFilters.bounds, limit]);

  // Execute search query with real-time updates
  const rawResults = useQuery(api.listings.searchListings, searchArgs);
  const isLoading = rawResults === undefined;
  const isRealTimeConnected = rawResults !== undefined && rawResults !== null;

  // Process and enhance results
  const results = useMemo(() => {
    if (!rawResults) return [];

    let processedResults: SearchResult[] = rawResults.map(listing => ({
      ...listing,
      distance: searchFilters.userLocation 
        ? calculateDistance(searchFilters.userLocation, listing.location)
        : undefined,
      isOpenNow: isBusinessOpenNow(listing.hours),
    }));

    // Apply client-side filters
    if (searchFilters.openNow) {
      processedResults = processedResults.filter(result => result.isOpenNow);
    }

    if (searchFilters.maxDistance && searchFilters.userLocation) {
      processedResults = processedResults.filter(result => 
        result.distance !== undefined && result.distance <= searchFilters.maxDistance!
      );
    }

    // Apply sorting
    switch (searchFilters.sortBy) {
      case 'distance':
        if (searchFilters.userLocation) {
          processedResults.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }
        break;
      case 'name':
        processedResults.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        processedResults.sort((a, b) => b._creationTime - a._creationTime);
        break;
      case 'relevance':
      default:
        // Keep original order (relevance-based from server)
        break;
    }

    return processedResults;
  }, [rawResults, searchFilters.userLocation, searchFilters.openNow, searchFilters.maxDistance, searchFilters.sortBy]);

  // Track real-time updates and search results analytics
  useEffect(() => {
    if (results.length > 0) {
      const currentResultIds = results.map(r => r._id).sort().join(',');
      const previousResultIds = previousResultsRef.current.map(r => r._id).sort().join(',');

      if (previousResultsRef.current.length > 0 && currentResultIds !== previousResultIds) {
        setHasNewResults(true);
        setLastUpdated(Date.now());
      }

      previousResultsRef.current = results;

      // Track search results analytics when query exists
      if (searchFilters.query && searchFilters.query.trim().length > 0) {
        trackSearchQuery(searchFilters.query, {
          resultCount: results.length,
          category: searchFilters.categoryId ? 'filtered' : undefined,
          location: searchFilters.userLocation,
          sortBy: searchFilters.sortBy || 'relevance',
          filterApplied: Object.keys(searchFilters).filter(key =>
            key !== 'query' && searchFilters[key as keyof SearchFilters] !== undefined
          ),
        });
      }
    }
  }, [results, searchFilters.query, searchFilters.categoryId, searchFilters.userLocation, searchFilters.sortBy, trackSearchQuery]);

  // Update search filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setSearchFilters(prev => ({ ...prev, ...newFilters }));
    setLimit(DEFAULT_LIMIT); // Reset pagination when filters change
    setError(null);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchFilters({});
    setLimit(DEFAULT_LIMIT);
    setError(null);
  }, []);

  // Load more results (pagination)
  const loadMore = useCallback(() => {
    setLimit(prev => prev + DEFAULT_LIMIT);
  }, []);

  // Mark results as viewed (clear new results indicator)
  const markResultsAsViewed = useCallback(() => {
    setHasNewResults(false);
  }, []);

  // Calculate pagination info
  const totalCount = results.length;
  const hasMore = rawResults ? rawResults.length >= limit : false;

  // Handle errors
  useEffect(() => {
    if (rawResults === null) {
      setError('Failed to load search results. Please try again.');
    } else {
      setError(null);
    }
  }, [rawResults]);

  return {
    results,
    isLoading,
    error,
    totalCount,
    hasMore,
    searchFilters,
    updateFilters,
    clearFilters,
    loadMore,
    isRealTimeConnected,
    lastUpdated,
    hasNewResults,
    markResultsAsViewed,
  };
}

/**
 * Utility function to check if a business is currently open
 */
function isBusinessOpenNow(hours?: Array<{
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  open: string;
  close: string;
  closed: boolean;
}>): boolean {
  if (!hours || hours.length === 0) return false;

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM format

  const todayHours = hours.find(h => h.day === currentDay);
  if (!todayHours || todayHours.closed) return false;

  // Parse time strings (e.g., "09:30" -> 930)
  const openTime = parseTimeString(todayHours.open);
  const closeTime = parseTimeString(todayHours.close);

  if (openTime === null || closeTime === null) return false;

  // Handle overnight hours (e.g., 22:00 - 02:00)
  if (closeTime < openTime) {
    return currentTime >= openTime || currentTime <= closeTime;
  }

  return currentTime >= openTime && currentTime <= closeTime;
}

/**
 * Parse time string to HHMM number format
 */
function parseTimeString(timeStr: string): number | null {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 100 + minutes;
}
