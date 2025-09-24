"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox configuration
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Default map configuration
const DEFAULT_CONFIG = {
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-74.006, 40.7128] as [number, number], // NYC default
  zoom: 12,
  pitch: 0,
  bearing: 0,
};

export interface MapboxConfig {
  style?: string;
  center?: [number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
  maxZoom?: number;
  minZoom?: number;
}

export interface MapboxHookReturn {
  map: mapboxgl.Map | null;
  mapContainer: React.RefObject<HTMLDivElement>;
  isLoaded: boolean;
  error: string | null;
  setCenter: (center: [number, number], zoom?: number) => void;
  fitBounds: (bounds: mapboxgl.LngLatBoundsLike, options?: mapboxgl.FitBoundsOptions) => void;
  addMarker: (lngLat: [number, number], options?: mapboxgl.MarkerOptions) => mapboxgl.Marker;
  removeMarker: (marker: mapboxgl.Marker) => void;
  addPopup: (lngLat: [number, number], html: string) => mapboxgl.Popup;
  getBounds: () => mapboxgl.LngLatBounds | null;
  getZoom: () => number;
  getCenter: () => mapboxgl.LngLat | null;
}

/**
 * Custom hook for managing Mapbox GL JS map instance
 * Handles initialization, cleanup, and common map operations
 */
export function useMapbox(config: MapboxConfig = {}): MapboxHookReturn {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Merge config with defaults
  const mapConfig = { ...DEFAULT_CONFIG, ...config };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return; // Map already initialized

    // Check for access token
    if (!MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN === 'pk_your_token_here') {
      setError('Mapbox access token is not configured. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment variables.');
      return;
    }

    try {
      // Set access token
      mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

      // Create map instance
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapConfig.style,
        center: mapConfig.center,
        zoom: mapConfig.zoom,
        pitch: mapConfig.pitch,
        bearing: mapConfig.bearing,
        maxZoom: mapConfig.maxZoom,
        minZoom: mapConfig.minZoom,
        antialias: true,
        optimizeForTerrain: true,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add geolocate control
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        'top-right'
      );

      // Handle map load
      map.current.on('load', () => {
        setIsLoaded(true);
        setError(null);
      });

      // Handle map errors
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError('Failed to load map. Please check your internet connection and try again.');
      });

    } catch (err) {
      console.error('Failed to initialize Mapbox:', err);
      setError('Failed to initialize map. Please refresh the page and try again.');
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setIsLoaded(false);
      }
    };
  }, [mapConfig.style, mapConfig.center[0], mapConfig.center[1], mapConfig.zoom, mapConfig.pitch, mapConfig.bearing, mapConfig.maxZoom, mapConfig.minZoom]);

  // Set map center
  const setCenter = useCallback((center: [number, number], zoom?: number) => {
    if (!map.current) return;
    
    const options: mapboxgl.FlyToOptions = {
      center,
      essential: true,
    };
    
    if (zoom !== undefined) {
      options.zoom = zoom;
    }
    
    map.current.flyTo(options);
  }, []);

  // Fit bounds
  const fitBounds = useCallback((bounds: mapboxgl.LngLatBoundsLike, options?: mapboxgl.FitBoundsOptions) => {
    if (!map.current) return;
    
    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15,
      ...options,
    });
  }, []);

  // Add marker
  const addMarker = useCallback((lngLat: [number, number], options?: mapboxgl.MarkerOptions) => {
    if (!map.current) throw new Error('Map not initialized');
    
    return new mapboxgl.Marker(options)
      .setLngLat(lngLat)
      .addTo(map.current);
  }, []);

  // Remove marker
  const removeMarker = useCallback((marker: mapboxgl.Marker) => {
    marker.remove();
  }, []);

  // Add popup
  const addPopup = useCallback((lngLat: [number, number], html: string) => {
    if (!map.current) throw new Error('Map not initialized');
    
    return new mapboxgl.Popup()
      .setLngLat(lngLat)
      .setHTML(html)
      .addTo(map.current);
  }, []);

  // Get current bounds
  const getBounds = useCallback(() => {
    if (!map.current) return null;
    return map.current.getBounds();
  }, []);

  // Get current zoom
  const getZoom = useCallback(() => {
    if (!map.current) return 0;
    return map.current.getZoom();
  }, []);

  // Get current center
  const getCenter = useCallback(() => {
    if (!map.current) return null;
    return map.current.getCenter();
  }, []);

  return {
    map: map.current,
    mapContainer,
    isLoaded,
    error,
    setCenter,
    fitBounds,
    addMarker,
    removeMarker,
    addPopup,
    getBounds,
    getZoom,
    getCenter,
  };
}
