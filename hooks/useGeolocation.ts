"use client";

import { useState, useEffect, useCallback } from 'react';

export interface GeolocationPosition {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface GeolocationHookReturn {
  position: GeolocationPosition | null;
  error: GeolocationError | null;
  isLoading: boolean;
  isSupported: boolean;
  requestLocation: () => void;
  watchLocation: () => void;
  stopWatching: () => void;
  clearError: () => void;
}

// Default geolocation options
const DEFAULT_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000, // 10 seconds
  maximumAge: 300000, // 5 minutes
};

/**
 * Custom hook for handling browser geolocation
 * Provides current position, error handling, and watch functionality
 */
export function useGeolocation(options: PositionOptions = {}): GeolocationHookReturn {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Merge options with defaults
  const geolocationOptions = { ...DEFAULT_OPTIONS, ...options };

  // Check if geolocation is supported
  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  // Handle successful position
  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    const newPosition: GeolocationPosition = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: pos.timestamp,
    };
    
    setPosition(newPosition);
    setError(null);
    setIsLoading(false);
  }, []);

  // Handle geolocation error
  const handleError = useCallback((err: GeolocationPositionError) => {
    let message: string;
    
    switch (err.code) {
      case err.PERMISSION_DENIED:
        message = 'Location access denied by user. Please enable location permissions in your browser settings.';
        break;
      case err.POSITION_UNAVAILABLE:
        message = 'Location information is unavailable. Please check your internet connection.';
        break;
      case err.TIMEOUT:
        message = 'Location request timed out. Please try again.';
        break;
      default:
        message = 'An unknown error occurred while retrieving location.';
        break;
    }

    const geolocationError: GeolocationError = {
      code: err.code,
      message,
    };

    setError(geolocationError);
    setIsLoading(false);
  }, []);

  // Request current position once
  const requestLocation = useCallback(() => {
    if (!isSupported) {
      setError({
        code: -1,
        message: 'Geolocation is not supported by this browser.',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      geolocationOptions
    );
  }, [isSupported, handleSuccess, handleError, geolocationOptions]);

  // Start watching position changes
  const watchLocation = useCallback(() => {
    if (!isSupported) {
      setError({
        code: -1,
        message: 'Geolocation is not supported by this browser.',
      });
      return;
    }

    if (watchId !== null) {
      // Already watching
      return;
    }

    setIsLoading(true);
    setError(null);

    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      geolocationOptions
    );

    setWatchId(id);
  }, [isSupported, watchId, handleSuccess, handleError, geolocationOptions]);

  // Stop watching position changes
  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsLoading(false);
    }
  }, [watchId]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Try to get cached position from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('userLocation');
        if (cached) {
          const cachedPosition = JSON.parse(cached) as GeolocationPosition;
          // Only use cached position if it's less than 1 hour old
          const oneHour = 60 * 60 * 1000;
          if (Date.now() - cachedPosition.timestamp < oneHour) {
            setPosition(cachedPosition);
          }
        }
      } catch (err) {
        // Ignore localStorage errors
        console.warn('Failed to load cached location:', err);
      }
    }
  }, []);

  // Cache position to localStorage when it changes
  useEffect(() => {
    if (position && typeof window !== 'undefined') {
      try {
        localStorage.setItem('userLocation', JSON.stringify(position));
      } catch (err) {
        // Ignore localStorage errors
        console.warn('Failed to cache location:', err);
      }
    }
  }, [position]);

  return {
    position,
    error,
    isLoading,
    isSupported,
    requestLocation,
    watchLocation,
    stopWatching,
    clearError,
  };
}

/**
 * Utility function to calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  pos1: { lat: number; lng: number },
  pos2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(pos2.lat - pos1.lat);
  const dLng = toRadians(pos2.lng - pos1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(pos1.lat)) * Math.cos(toRadians(pos2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanceKm)}km`;
  }
}
