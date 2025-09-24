"use client";

import { useCallback, useRef, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export interface AnalyticsEventMetadata {
  // Search-related metadata
  query?: string;
  category?: string;
  location?: { lat: number; lng: number };
  resultCount?: number;
  searchDuration?: number;
  filterApplied?: string[];
  sortBy?: string;
  
  // Contact-related metadata
  contactType?: "phone" | "website" | "email";
  
  // Map interaction metadata
  action?: "zoom" | "pan" | "cluster_click" | "marker_click" | "location_applied" | "location_requested" | "filter_applied" | "filter_cleared";
  zoomLevel?: number;
  previousZoomLevel?: number;
  clusterSize?: number;
  
  // General metadata
  userAgent?: string;
  referrer?: string;
  viewport?: { width: number; height: number };
  timestamp?: number;
  
  // Conversion tracking metadata
  conversionFunnel?: string;
  conversionStep?: string;
  conversionValue?: number;
  attribution?: {
    source?: string;
    medium?: string;
    campaign?: string;
    searchQuery?: string;
  };
}

export interface AnalyticsHookReturn {
  // Core tracking functions
  trackSearchQuery: (query: string, metadata?: Partial<AnalyticsEventMetadata>) => Promise<void>;
  trackListingView: (listingId: Id<"listings">, metadata?: Partial<AnalyticsEventMetadata>) => Promise<void>;
  trackContactClick: (listingId: Id<"listings">, contactType: "phone" | "website" | "email", metadata?: Partial<AnalyticsEventMetadata>) => Promise<void>;
  trackDirectionsClick: (listingId: Id<"listings">, metadata?: Partial<AnalyticsEventMetadata>) => Promise<void>;
  trackMapInteraction: (action: "zoom" | "pan" | "cluster_click" | "marker_click", metadata?: Partial<AnalyticsEventMetadata>) => Promise<void>;
  
  // Conversion tracking
  trackConversion: (conversionType: string, value?: number, metadata?: Partial<AnalyticsEventMetadata>) => Promise<void>;
  
  // Session management
  sessionId: string;
  isTracking: boolean;
  
  // Utility functions
  getViewportInfo: () => { width: number; height: number };
  getUserAgent: () => string;
  getReferrer: () => string;
}

/**
 * Custom hook for analytics tracking with session management and metadata collection
 * Provides a clean interface for tracking user interactions across the application
 */
export function useAnalytics(): AnalyticsHookReturn {
  const trackEventMutation = useMutation(api.analytics.trackEvent);
  
  // Generate and persist session ID
  const sessionIdRef = useRef<string>('');
  const isTrackingRef = useRef<boolean>(true);
  
  // Initialize session ID on first render
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = generateSessionId();
    }
  }, []);

  // Generate a unique session ID
  const generateSessionId = useCallback((): string => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${randomPart}`;
  }, []);

  // Get current viewport information
  const getViewportInfo = useCallback(() => {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }, []);

  // Get user agent string
  const getUserAgent = useCallback(() => {
    if (typeof window === 'undefined') return '';
    return window.navigator.userAgent;
  }, []);

  // Get referrer information
  const getReferrer = useCallback(() => {
    if (typeof document === 'undefined') return '';
    return document.referrer;
  }, []);

  // Create base metadata for all events
  const createBaseMetadata = useCallback((additionalMetadata?: Partial<AnalyticsEventMetadata>): AnalyticsEventMetadata => {
    return {
      userAgent: getUserAgent(),
      referrer: getReferrer(),
      viewport: getViewportInfo(),
      timestamp: Date.now(),
      ...additionalMetadata,
    };
  }, [getUserAgent, getReferrer, getViewportInfo]);

  // Core tracking function
  const trackEvent = useCallback(async (
    type: "listing_view" | "search_query" | "contact_click" | "directions_click" | "map_interaction",
    listingId?: Id<"listings">,
    metadata?: Partial<AnalyticsEventMetadata>
  ) => {
    if (!isTrackingRef.current) return;

    try {
      const fullMetadata = createBaseMetadata(metadata);
      
      await trackEventMutation({
        type,
        listingId,
        sessionId: sessionIdRef.current,
        metadata: fullMetadata,
        ipHash: undefined, // Will be handled server-side if needed
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
      // Don't throw - analytics failures shouldn't break user experience
    }
  }, [trackEventMutation, createBaseMetadata]);

  // Search query tracking
  const trackSearchQuery = useCallback(async (
    query: string, 
    metadata?: Partial<AnalyticsEventMetadata>
  ) => {
    await trackEvent('search_query', undefined, {
      query,
      ...metadata,
    });
  }, [trackEvent]);

  // Listing view tracking
  const trackListingView = useCallback(async (
    listingId: Id<"listings">, 
    metadata?: Partial<AnalyticsEventMetadata>
  ) => {
    await trackEvent('listing_view', listingId, metadata);
  }, [trackEvent]);

  // Contact click tracking
  const trackContactClick = useCallback(async (
    listingId: Id<"listings">, 
    contactType: "phone" | "website" | "email",
    metadata?: Partial<AnalyticsEventMetadata>
  ) => {
    await trackEvent('contact_click', listingId, {
      contactType,
      conversionFunnel: 'listing_to_contact',
      conversionStep: contactType,
      ...metadata,
    });
  }, [trackEvent]);

  // Directions click tracking
  const trackDirectionsClick = useCallback(async (
    listingId: Id<"listings">, 
    metadata?: Partial<AnalyticsEventMetadata>
  ) => {
    await trackEvent('directions_click', listingId, {
      conversionFunnel: 'listing_to_directions',
      conversionStep: 'directions_click',
      ...metadata,
    });
  }, [trackEvent]);

  // Map interaction tracking
  const trackMapInteraction = useCallback(async (
    action: "zoom" | "pan" | "cluster_click" | "marker_click",
    metadata?: Partial<AnalyticsEventMetadata>
  ) => {
    await trackEvent('map_interaction', undefined, {
      action,
      ...metadata,
    });
  }, [trackEvent]);

  // Conversion tracking
  const trackConversion = useCallback(async (
    conversionType: string,
    value?: number,
    metadata?: Partial<AnalyticsEventMetadata>
  ) => {
    // For now, we'll track conversions as contact_click events with special metadata
    // This can be extended to a dedicated conversion event type if needed
    await trackEvent('contact_click', undefined, {
      conversionFunnel: conversionType,
      conversionValue: value,
      ...metadata,
    });
  }, [trackEvent]);

  return {
    // Core tracking functions
    trackSearchQuery,
    trackListingView,
    trackContactClick,
    trackDirectionsClick,
    trackMapInteraction,
    
    // Conversion tracking
    trackConversion,
    
    // Session management
    sessionId: sessionIdRef.current,
    isTracking: isTrackingRef.current,
    
    // Utility functions
    getViewportInfo,
    getUserAgent,
    getReferrer,
  };
}
