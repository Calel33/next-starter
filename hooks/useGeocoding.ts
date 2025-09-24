"use client";

import { useState, useCallback, useRef } from 'react';
import { 
  geocodeAddress, 
  reverseGeocode, 
  type GeocodeResult, 
  type ReverseGeocodeResult, 
  type GeocodeOptions 
} from '@/lib/geocoding';

export interface GeocodingState {
  isLoading: boolean;
  error: string | null;
  results: GeocodeResult[];
}

export interface ReverseGeocodingState {
  isLoading: boolean;
  error: string | null;
  result: ReverseGeocodeResult | null;
}

export interface UseGeocodingReturn {
  // Forward geocoding
  geocoding: GeocodingState;
  geocode: (address: string, options?: GeocodeOptions) => Promise<GeocodeResult[]>;
  
  // Reverse geocoding
  reverseGeocoding: ReverseGeocodingState;
  reverseGeocode: (lng: number, lat: number, options?: GeocodeOptions) => Promise<ReverseGeocodeResult | null>;
  
  // Utilities
  clearResults: () => void;
  clearErrors: () => void;
}

/**
 * Hook for Mapbox geocoding with caching and state management
 * Provides both forward and reverse geocoding capabilities
 */
export function useGeocoding(): UseGeocodingReturn {
  const [geocodingState, setGeocodingState] = useState<GeocodingState>({
    isLoading: false,
    error: null,
    results: [],
  });

  const [reverseGeocodingState, setReverseGeocodingState] = useState<ReverseGeocodingState>({
    isLoading: false,
    error: null,
    result: null,
  });

  // Abort controllers for cancelling requests
  const geocodeAbortController = useRef<AbortController | null>(null);
  const reverseGeocodeAbortController = useRef<AbortController | null>(null);

  // Forward geocoding
  const geocode = useCallback(async (
    address: string, 
    options?: GeocodeOptions
  ): Promise<GeocodeResult[]> => {
    // Cancel any existing request
    if (geocodeAbortController.current) {
      geocodeAbortController.current.abort();
    }

    // Create new abort controller
    geocodeAbortController.current = new AbortController();

    setGeocodingState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const results = await geocodeAddress(address, options);
      
      setGeocodingState({
        isLoading: false,
        error: null,
        results,
      });

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Geocoding failed';
      
      setGeocodingState({
        isLoading: false,
        error: errorMessage,
        results: [],
      });

      throw error;
    }
  }, []);

  // Reverse geocoding
  const reverseGeocodeCallback = useCallback(async (
    lng: number, 
    lat: number, 
    options?: GeocodeOptions
  ): Promise<ReverseGeocodeResult | null> => {
    // Cancel any existing request
    if (reverseGeocodeAbortController.current) {
      reverseGeocodeAbortController.current.abort();
    }

    // Create new abort controller
    reverseGeocodeAbortController.current = new AbortController();

    setReverseGeocodingState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const result = await reverseGeocode(lng, lat, options);
      
      setReverseGeocodingState({
        isLoading: false,
        error: null,
        result,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Reverse geocoding failed';
      
      setReverseGeocodingState({
        isLoading: false,
        error: errorMessage,
        result: null,
      });

      throw error;
    }
  }, []);

  // Clear results
  const clearResults = useCallback(() => {
    setGeocodingState(prev => ({
      ...prev,
      results: [],
    }));
    setReverseGeocodingState(prev => ({
      ...prev,
      result: null,
    }));
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    setGeocodingState(prev => ({
      ...prev,
      error: null,
    }));
    setReverseGeocodingState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    geocoding: geocodingState,
    geocode,
    reverseGeocoding: reverseGeocodingState,
    reverseGeocode: reverseGeocodeCallback,
    clearResults,
    clearErrors,
  };
}

/**
 * Hook for address autocomplete with debouncing
 * Optimized for search-as-you-type functionality
 */
export function useAddressAutocomplete(
  debounceMs: number = 300,
  options?: GeocodeOptions
) {
  const { geocoding, geocode, clearResults, clearErrors } = useGeocoding();
  const [query, setQuery] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback((address: string) => {
    setQuery(address);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Clear results if query is empty
    if (!address.trim()) {
      clearResults();
      return;
    }

    // Set new timeout for debounced search
    timeoutRef.current = setTimeout(() => {
      geocode(address, {
        ...options,
        autocomplete: true,
        limit: options?.limit || 5,
      }).catch(error => {
        console.error('Autocomplete geocoding error:', error);
      });
    }, debounceMs);
  }, [geocode, clearResults, debounceMs, options]);

  const clear = useCallback(() => {
    setQuery('');
    clearResults();
    clearErrors();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [clearResults, clearErrors]);

  return {
    query,
    search,
    clear,
    results: geocoding.results,
    isLoading: geocoding.isLoading,
    error: geocoding.error,
  };
}
