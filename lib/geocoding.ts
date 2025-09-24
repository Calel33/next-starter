"use client";

// Mapbox Geocoding API service with caching
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const GEOCODING_BASE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export interface GeocodeResult {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  place_type: string[];
  relevance: number;
  properties: Record<string, any>;
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
}

export interface GeocodeResponse {
  type: 'FeatureCollection';
  query: string[];
  features: GeocodeResult[];
  attribution: string;
}

export interface ReverseGeocodeResult {
  place_name: string;
  center: [number, number];
  place_type: string[];
  address?: string;
  locality?: string;
  region?: string;
  country?: string;
  postcode?: string;
}

export interface GeocodeOptions {
  country?: string;
  proximity?: [number, number];
  bbox?: [number, number, number, number];
  types?: string[];
  limit?: number;
  language?: string;
  autocomplete?: boolean;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * In-memory cache for geocoding results
 * Uses Map for better performance than object
 */
class GeocodeCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 24 * 60 * 60 * 1000; // 24 hours

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
const geocodeCache = new GeocodeCache();

// Cleanup expired entries every 30 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    geocodeCache.cleanup();
  }, 30 * 60 * 1000);
}

/**
 * Generate cache key for geocoding requests
 */
function generateCacheKey(query: string, options?: GeocodeOptions): string {
  const optionsStr = options ? JSON.stringify(options) : '';
  return `geocode:${query}:${optionsStr}`;
}

/**
 * Generate cache key for reverse geocoding requests
 */
function generateReverseCacheKey(lng: number, lat: number, options?: GeocodeOptions): string {
  const optionsStr = options ? JSON.stringify(options) : '';
  return `reverse:${lng},${lat}:${optionsStr}`;
}

/**
 * Build Mapbox Geocoding API URL
 */
function buildGeocodeUrl(query: string, options?: GeocodeOptions): string {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error('Mapbox access token is not configured');
  }

  const url = new URL(`${GEOCODING_BASE_URL}/${encodeURIComponent(query)}.json`);
  url.searchParams.set('access_token', MAPBOX_ACCESS_TOKEN);

  if (options?.country) {
    url.searchParams.set('country', options.country);
  }
  if (options?.proximity) {
    url.searchParams.set('proximity', options.proximity.join(','));
  }
  if (options?.bbox) {
    url.searchParams.set('bbox', options.bbox.join(','));
  }
  if (options?.types) {
    url.searchParams.set('types', options.types.join(','));
  }
  if (options?.limit) {
    url.searchParams.set('limit', options.limit.toString());
  }
  if (options?.language) {
    url.searchParams.set('language', options.language);
  }
  if (options?.autocomplete !== undefined) {
    url.searchParams.set('autocomplete', options.autocomplete.toString());
  }

  return url.toString();
}

/**
 * Geocode an address to coordinates
 * Returns cached result if available, otherwise makes API request
 */
export async function geocodeAddress(
  address: string,
  options?: GeocodeOptions
): Promise<GeocodeResult[]> {
  if (!address.trim()) {
    throw new Error('Address is required');
  }

  const cacheKey = generateCacheKey(address, options);
  
  // Check cache first
  const cached = geocodeCache.get<GeocodeResult[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = buildGeocodeUrl(address, options);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
    }

    const data: GeocodeResponse = await response.json();
    const results = data.features || [];

    // Cache the results
    geocodeCache.set(cacheKey, results);

    return results;
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

/**
 * Reverse geocode coordinates to address
 * Returns cached result if available, otherwise makes API request
 */
export async function reverseGeocode(
  lng: number,
  lat: number,
  options?: GeocodeOptions
): Promise<ReverseGeocodeResult | null> {
  const cacheKey = generateReverseCacheKey(lng, lat, options);
  
  // Check cache first
  const cached = geocodeCache.get<ReverseGeocodeResult>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const query = `${lng},${lat}`;
    const url = buildGeocodeUrl(query, { ...options, limit: 1 });
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status} ${response.statusText}`);
    }

    const data: GeocodeResponse = await response.json();
    const feature = data.features[0];

    if (!feature) {
      return null;
    }

    const result: ReverseGeocodeResult = {
      place_name: feature.place_name,
      center: feature.center,
      place_type: feature.place_type,
    };

    // Extract address components from context
    if (feature.context) {
      for (const context of feature.context) {
        if (context.id.startsWith('address.')) {
          result.address = context.text;
        } else if (context.id.startsWith('place.')) {
          result.locality = context.text;
        } else if (context.id.startsWith('region.')) {
          result.region = context.text;
        } else if (context.id.startsWith('country.')) {
          result.country = context.text;
        } else if (context.id.startsWith('postcode.')) {
          result.postcode = context.text;
        }
      }
    }

    // Cache the result
    geocodeCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: geocodeCache.size(),
    clear: () => geocodeCache.clear(),
    cleanup: () => geocodeCache.cleanup(),
  };
}
