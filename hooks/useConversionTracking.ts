"use client";

import { useCallback, useRef, useEffect } from 'react';
import { useAnalytics } from './useAnalytics';
import { Id } from '@/convex/_generated/dataModel';

export interface ConversionFunnel {
  name: string;
  steps: string[];
  currentStep?: string;
  startTime?: number;
  attribution?: {
    source?: string;
    medium?: string;
    campaign?: string;
    searchQuery?: string;
    referrer?: string;
  };
}

export interface ConversionEvent {
  funnelName: string;
  step: string;
  listingId?: Id<"listings">;
  value?: number;
  timestamp: number;
  sessionId: string;
  attribution?: ConversionFunnel['attribution'];
}

export interface ConversionTrackingHookReturn {
  // Funnel management
  startFunnel: (funnelName: string, attribution?: ConversionFunnel['attribution']) => void;
  trackStep: (funnelName: string, step: string, listingId?: Id<"listings">, value?: number) => void;
  completeFunnel: (funnelName: string, listingId?: Id<"listings">, value?: number) => void;
  abandonFunnel: (funnelName: string, reason?: string) => void;
  
  // Contact conversion tracking
  trackContactConversion: (listingId: Id<"listings">, contactType: 'phone' | 'website' | 'email', source?: string) => void;
  trackDirectionsConversion: (listingId: Id<"listings">, source?: string) => void;
  trackSearchToContact: (searchQuery: string, listingId: Id<"listings">, contactType: 'phone' | 'website' | 'email') => void;
  trackViewToContact: (listingId: Id<"listings">, contactType: 'phone' | 'website' | 'email', viewSource?: string) => void;
  
  // Attribution tracking
  setAttribution: (attribution: ConversionFunnel['attribution']) => void;
  getAttribution: () => ConversionFunnel['attribution'] | null;
  
  // Funnel state
  activeFunnels: Map<string, ConversionFunnel>;
  getActiveFunnel: (funnelName: string) => ConversionFunnel | null;
}

/**
 * Custom hook for comprehensive conversion tracking with funnel analysis
 * Tracks user journeys from discovery to contact actions with attribution
 */
export function useConversionTracking(): ConversionTrackingHookReturn {
  const { trackContactClick, trackDirectionsClick, trackSearchQuery, sessionId } = useAnalytics();
  
  // Store active funnels and attribution data
  const activeFunnelsRef = useRef<Map<string, ConversionFunnel>>(new Map());
  const attributionRef = useRef<ConversionFunnel['attribution'] | null>(null);
  
  // Initialize attribution from URL parameters and referrer
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const attribution: ConversionFunnel['attribution'] = {
      source: urlParams.get('utm_source') || undefined,
      medium: urlParams.get('utm_medium') || undefined,
      campaign: urlParams.get('utm_campaign') || undefined,
      referrer: document.referrer || undefined,
    };
    
    // Only set if we have some attribution data
    if (Object.values(attribution).some(value => value !== undefined)) {
      attributionRef.current = attribution;
    }
  }, []);

  // Start a new conversion funnel
  const startFunnel = useCallback((funnelName: string, attribution?: ConversionFunnel['attribution']) => {
    const funnel: ConversionFunnel = {
      name: funnelName,
      steps: [],
      startTime: Date.now(),
      attribution: attribution || attributionRef.current || undefined,
    };
    
    activeFunnelsRef.current.set(funnelName, funnel);
  }, []);

  // Track a step in a conversion funnel
  const trackStep = useCallback((funnelName: string, step: string, listingId?: Id<"listings">, value?: number) => {
    const funnel = activeFunnelsRef.current.get(funnelName);
    if (!funnel) {
      // Auto-start funnel if it doesn't exist
      startFunnel(funnelName);
    }
    
    const updatedFunnel = activeFunnelsRef.current.get(funnelName);
    if (updatedFunnel) {
      updatedFunnel.steps.push(step);
      updatedFunnel.currentStep = step;
      
      // Track the step as a contact click event with conversion metadata
      if (listingId) {
        const contactType = step.includes('phone') ? 'phone' : 
                           step.includes('website') ? 'website' : 
                           step.includes('email') ? 'email' : undefined;
        
        if (contactType) {
          trackContactClick(listingId, contactType, {
            conversionFunnel: funnelName,
            conversionStep: step,
            conversionValue: value,
            attribution: updatedFunnel.attribution,
          });
        }
      }
    }
  }, [startFunnel, trackContactClick]);

  // Complete a conversion funnel
  const completeFunnel = useCallback((funnelName: string, listingId?: Id<"listings">, value?: number) => {
    const funnel = activeFunnelsRef.current.get(funnelName);
    if (!funnel) return;
    
    trackStep(funnelName, 'conversion_complete', listingId, value);
    
    // Remove from active funnels
    activeFunnelsRef.current.delete(funnelName);
  }, [trackStep]);

  // Abandon a conversion funnel
  const abandonFunnel = useCallback((funnelName: string, reason?: string) => {
    const funnel = activeFunnelsRef.current.get(funnelName);
    if (!funnel) return;
    
    trackStep(funnelName, `abandoned_${reason || 'unknown'}`);
    
    // Remove from active funnels
    activeFunnelsRef.current.delete(funnelName);
  }, [trackStep]);

  // Track contact conversion with automatic funnel management
  const trackContactConversion = useCallback((
    listingId: Id<"listings">, 
    contactType: 'phone' | 'website' | 'email', 
    source?: string
  ) => {
    const funnelName = `${source || 'direct'}_to_${contactType}`;
    
    // Start funnel if not already active
    if (!activeFunnelsRef.current.has(funnelName)) {
      startFunnel(funnelName);
    }
    
    // Track the conversion step
    trackStep(funnelName, `${contactType}_click`, listingId, 1);
    
    // Complete the funnel
    completeFunnel(funnelName, listingId, 1);
  }, [startFunnel, trackStep, completeFunnel]);

  // Track directions conversion
  const trackDirectionsConversion = useCallback((listingId: Id<"listings">, source?: string) => {
    const funnelName = `${source || 'direct'}_to_directions`;
    
    // Start funnel if not already active
    if (!activeFunnelsRef.current.has(funnelName)) {
      startFunnel(funnelName);
    }
    
    // Track directions click
    trackDirectionsClick(listingId, {
      conversionFunnel: funnelName,
      conversionStep: 'directions_click',
      conversionValue: 1,
      attribution: attributionRef.current || undefined,
    });
    
    // Complete the funnel
    completeFunnel(funnelName, listingId, 1);
  }, [startFunnel, trackDirectionsClick, completeFunnel]);

  // Track search to contact conversion
  const trackSearchToContact = useCallback((
    searchQuery: string, 
    listingId: Id<"listings">, 
    contactType: 'phone' | 'website' | 'email'
  ) => {
    const funnelName = 'search_to_contact';
    
    // Start funnel with search query attribution
    startFunnel(funnelName, {
      ...attributionRef.current,
      searchQuery,
    });
    
    // Track search step
    trackSearchQuery(searchQuery, {
      conversionFunnel: funnelName,
      conversionStep: 'search_query',
      attribution: { ...attributionRef.current, searchQuery },
    });
    
    // Track contact step
    trackStep(funnelName, `${contactType}_click`, listingId, 1);
    
    // Complete funnel
    completeFunnel(funnelName, listingId, 1);
  }, [startFunnel, trackSearchQuery, trackStep, completeFunnel]);

  // Track view to contact conversion
  const trackViewToContact = useCallback((
    listingId: Id<"listings">, 
    contactType: 'phone' | 'website' | 'email',
    viewSource?: string
  ) => {
    const funnelName = `${viewSource || 'view'}_to_contact`;
    
    // Start funnel
    startFunnel(funnelName);
    
    // Track view step (this would typically be called from listing view)
    trackStep(funnelName, 'listing_view', listingId);
    
    // Track contact step
    trackStep(funnelName, `${contactType}_click`, listingId, 1);
    
    // Complete funnel
    completeFunnel(funnelName, listingId, 1);
  }, [startFunnel, trackStep, completeFunnel]);

  // Set attribution data
  const setAttribution = useCallback((attribution: ConversionFunnel['attribution']) => {
    attributionRef.current = attribution;
  }, []);

  // Get current attribution data
  const getAttribution = useCallback(() => {
    return attributionRef.current;
  }, []);

  // Get active funnel
  const getActiveFunnel = useCallback((funnelName: string) => {
    return activeFunnelsRef.current.get(funnelName) || null;
  }, []);

  return {
    // Funnel management
    startFunnel,
    trackStep,
    completeFunnel,
    abandonFunnel,
    
    // Contact conversion tracking
    trackContactConversion,
    trackDirectionsConversion,
    trackSearchToContact,
    trackViewToContact,
    
    // Attribution tracking
    setAttribution,
    getAttribution,
    
    // Funnel state
    activeFunnels: activeFunnelsRef.current,
    getActiveFunnel,
  };
}
