"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMapbox, type MapboxConfig } from '@/hooks/useMapbox';
import { cn } from '@/lib/utils';
import mapboxgl from 'mapbox-gl';
import Supercluster from 'supercluster';
import { useDebounce } from '@/hooks/useDebounce';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAnalytics } from '@/hooks/useAnalytics';

export interface MapMarker {
  id: string;
  lng: number;
  lat: number;
  data: any;
}

export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapboxMapProps {
  className?: string;
  config?: MapboxConfig;
  markers?: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  onMapMove?: (bounds: mapboxgl.LngLatBounds, zoom: number) => void;
  onViewportChange?: (bounds: ViewportBounds, zoom: number) => void;
  onMapLoad?: (map: mapboxgl.Map) => void;
  showClustering?: boolean;
  clusterRadius?: number;
  clusterMaxZoom?: number;
  height?: string;
  enableViewportOptimization?: boolean;
  viewportChangeDebounce?: number;
  maxMarkersBeforeOptimization?: number;
  // Mobile-specific props
  enableMobileOptimizations?: boolean;
  mobileGestureHandling?: 'cooperative' | 'greedy' | 'none';
  mobileTouchThreshold?: number;
  mobilePerformanceMode?: boolean;
}

/**
 * MapboxMap component with clustering support, viewport-based optimization, and mobile optimizations
 * Handles marker display, clustering, map interactions, efficient data loading, and touch gestures
 */
export function MapboxMap({
  className,
  config,
  markers = [],
  onMarkerClick,
  onMapMove,
  onViewportChange,
  onMapLoad,
  showClustering = true,
  clusterRadius = 50,
  clusterMaxZoom = 14,
  height = '400px',
  enableViewportOptimization = true,
  viewportChangeDebounce = 300,
  maxMarkersBeforeOptimization = 100,
  // Mobile-specific defaults
  enableMobileOptimizations = true,
  mobileGestureHandling = 'cooperative',
  mobileTouchThreshold = 10,
  mobilePerformanceMode = true,
}: MapboxMapProps) {
  const {
    map,
    mapContainer,
    isLoaded,
    error,
    setCenter,
    fitBounds,
    getBounds,
    getZoom,
  } = useMapbox(config);

  // Analytics tracking
  const { trackMapInteraction } = useAnalytics();

  // Mobile detection
  const isMobile = useIsMobile();

  const [currentViewport, setCurrentViewport] = useState<ViewportBounds | null>(null);
  const [visibleMarkers, setVisibleMarkers] = useState<MapMarker[]>([]);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const superclusterRef = useRef<Supercluster | null>(null);
  const lastViewportUpdateRef = useRef<number>(0);
  const viewportUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile-specific state
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [touchStartPosition, setTouchStartPosition] = useState<{ x: number; y: number } | null>(null);
  const [isGestureActive, setIsGestureActive] = useState(false);
  const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce viewport changes to prevent excessive updates
  const debouncedViewportChange = useDebounce(currentViewport, viewportChangeDebounce);

  // Mobile touch gesture handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enableMobileOptimizations || !isMobile) return;

    const touch = e.touches[0];
    if (touch) {
      setTouchStartTime(Date.now());
      setTouchStartPosition({ x: touch.clientX, y: touch.clientY });

      // Handle multi-touch gestures
      if (e.touches.length > 1) {
        setIsGestureActive(true);

        // Clear any existing timeout
        if (gestureTimeoutRef.current) {
          clearTimeout(gestureTimeoutRef.current);
        }

        // Set timeout to reset gesture state
        gestureTimeoutRef.current = setTimeout(() => {
          setIsGestureActive(false);
        }, 500);
      }
    }
  }, [enableMobileOptimizations, isMobile]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enableMobileOptimizations || !isMobile || !touchStartPosition) return;

    const touch = e.changedTouches[0];
    if (touch) {
      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - touchStartTime;
      const touchDistance = Math.sqrt(
        Math.pow(touch.clientX - touchStartPosition.x, 2) +
        Math.pow(touch.clientY - touchStartPosition.y, 2)
      );

      // Detect tap vs drag
      const isTap = touchDuration < 300 && touchDistance < mobileTouchThreshold;

      if (isTap && !isGestureActive) {
        // Handle tap gesture - could trigger marker selection or info popup
        // This is handled by individual marker click handlers
      }
    }

    // Reset touch state
    setTouchStartPosition(null);
    setTouchStartTime(0);
  }, [enableMobileOptimizations, isMobile, touchStartPosition, touchStartTime, mobileTouchThreshold, isGestureActive]);

  // Initialize Supercluster with mobile optimizations
  useEffect(() => {
    if (showClustering) {
      // Adjust clustering parameters for mobile performance
      const mobileRadius = isMobile && mobilePerformanceMode ? Math.max(clusterRadius * 1.2, 60) : clusterRadius;
      const mobileMinPoints = isMobile && mobilePerformanceMode ? 3 : 2;

      superclusterRef.current = new Supercluster({
        radius: mobileRadius,
        maxZoom: clusterMaxZoom,
        minZoom: 0,
        minPoints: mobileMinPoints,
      });
    }
  }, [showClustering, clusterRadius, clusterMaxZoom, isMobile, mobilePerformanceMode]);

  // Viewport-based marker filtering with mobile optimizations
  const filterMarkersByViewport = useCallback((allMarkers: MapMarker[], bounds: ViewportBounds): MapMarker[] => {
    // Mobile performance optimization: reduce marker threshold
    const mobileMaxMarkers = isMobile && mobilePerformanceMode ? Math.floor(maxMarkersBeforeOptimization * 0.7) : maxMarkersBeforeOptimization;

    if (!enableViewportOptimization || allMarkers.length <= mobileMaxMarkers) {
      return allMarkers;
    }

    // Adjust padding based on device type
    const padding = isMobile ? 0.005 : 0.01; // Smaller padding on mobile for better performance
    const expandedBounds = {
      north: bounds.north + padding,
      south: bounds.south - padding,
      east: bounds.east + padding,
      west: bounds.west - padding,
    };

    return allMarkers.filter(marker =>
      marker.lat >= expandedBounds.south &&
      marker.lat <= expandedBounds.north &&
      marker.lng >= expandedBounds.west &&
      marker.lng <= expandedBounds.east
    );
  }, [enableViewportOptimization, maxMarkersBeforeOptimization, isMobile, mobilePerformanceMode]);

  // Update visible markers when viewport or markers change
  useEffect(() => {
    if (!currentViewport) {
      setVisibleMarkers(markers);
      return;
    }

    const filtered = filterMarkersByViewport(markers, currentViewport);
    setVisibleMarkers(filtered);
  }, [markers, currentViewport, filterMarkersByViewport]);

  // Handle debounced viewport changes for external callbacks
  useEffect(() => {
    if (debouncedViewportChange && onViewportChange && map && isLoaded) {
      const zoom = getZoom();
      onViewportChange(debouncedViewportChange, zoom);
    }
  }, [debouncedViewportChange, map, isLoaded, getZoom]); // Removed onViewportChange from deps to prevent recreation

  // Handle viewport change detection with analytics tracking
  const handleViewportChange = useCallback(() => {
    if (!map || !isLoaded) return;

    const bounds = getBounds();
    const zoom = getZoom();

    if (!bounds) return;

    const newViewport: ViewportBounds = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    };

    setCurrentViewport(newViewport);

    // Track map interaction analytics
    trackMapInteraction('pan', {
      zoomLevel: zoom,
      viewport: {
        width: map.getContainer().clientWidth,
        height: map.getContainer().clientHeight,
      },
    });

    // Call onMapMove for backward compatibility
    if (onMapMove) {
      onMapMove(bounds, zoom);
    }

    // Throttle viewport change callbacks to prevent excessive API calls
    const now = Date.now();
    if (now - lastViewportUpdateRef.current < viewportChangeDebounce) {
      if (viewportUpdateTimeoutRef.current) {
        clearTimeout(viewportUpdateTimeoutRef.current);
      }

      viewportUpdateTimeoutRef.current = setTimeout(() => {
        if (onViewportChange) {
          onViewportChange(newViewport, zoom);
        }
        lastViewportUpdateRef.current = now;
      }, viewportChangeDebounce);
    } else {
      if (onViewportChange) {
        onViewportChange(newViewport, zoom);
      }
      lastViewportUpdateRef.current = now;
    }
  }, [map, isLoaded, getBounds, getZoom, viewportChangeDebounce]); // Removed onMapMove and onViewportChange from deps

  // Handle map load and setup event listeners with mobile optimizations
  useEffect(() => {
    if (isLoaded && map) {
      // Call onMapLoad callback
      if (onMapLoad) {
        onMapLoad(map);
      }

      // Mobile-specific map optimizations
      if (isMobile && enableMobileOptimizations) {
        // Optimize map for mobile performance
        if (mobilePerformanceMode) {
          // Reduce animation duration for better performance
          map.setRenderWorldCopies(false);

          // Adjust gesture handling
          if (mobileGestureHandling === 'cooperative') {
            map.scrollZoom.setWheelZoomRate(1/200); // Slower zoom for better control
          } else if (mobileGestureHandling === 'none') {
            map.scrollZoom.disable();
            map.dragPan.disable();
          }
        }

        // Add mobile-specific touch event listeners to map container
        const container = map.getContainer();
        if (container) {
          container.addEventListener('touchstart', handleTouchStart, { passive: true });
          container.addEventListener('touchend', handleTouchEnd, { passive: true });

          // Prevent default touch behaviors that might interfere
          container.style.touchAction = mobileGestureHandling === 'cooperative' ? 'manipulation' : 'auto';
        }
      }

      // Set up viewport change listeners with analytics tracking
      map.on('moveend', handleViewportChange);
      map.on('zoomend', () => {
        handleViewportChange();
        // Track zoom interaction separately
        const zoom = getZoom();
        trackMapInteraction('zoom', {
          zoomLevel: zoom,
          viewport: {
            width: map.getContainer().clientWidth,
            height: map.getContainer().clientHeight,
          },
        });
      });

      // Initial viewport setup
      handleViewportChange();

      // Cleanup function
      return () => {
        map.off('moveend', handleViewportChange);
        map.off('zoomend', handleViewportChange);

        if (viewportUpdateTimeoutRef.current) {
          clearTimeout(viewportUpdateTimeoutRef.current);
        }

        if (gestureTimeoutRef.current) {
          clearTimeout(gestureTimeoutRef.current);
        }

        // Clean up mobile touch listeners
        if (isMobile && enableMobileOptimizations) {
          const container = map.getContainer();
          if (container) {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchend', handleTouchEnd);
          }
        }
      };
    }
  }, [isLoaded, map, onMapLoad, handleViewportChange, isMobile, enableMobileOptimizations, mobilePerformanceMode, mobileGestureHandling, handleTouchStart, handleTouchEnd]);

  // Note: Map move events are now handled in the handleViewportChange function above

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  }, []);

  // Create marker element with mobile optimizations
  const createMarkerElement = useCallback((isCluster: boolean, pointCount?: number) => {
    const el = document.createElement('div');

    // Mobile-optimized touch targets and styling
    const mobileOptimized = isMobile && enableMobileOptimizations;
    const touchTargetSize = mobileOptimized ? 44 : 24; // 44px minimum for accessibility

    el.className = cn(
      'cursor-pointer transition-transform',
      mobileOptimized ? 'active:scale-95' : 'hover:scale-110',
      isCluster
        ? 'bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold border-2 border-background shadow-lg'
        : 'bg-destructive text-destructive-foreground rounded-full flex items-center justify-center border-2 border-background shadow-md'
    );

    if (isCluster && pointCount) {
      // Cluster styling based on point count with mobile adjustments
      const baseSize = pointCount < 10 ? 30 : pointCount < 100 ? 40 : 50;
      const size = mobileOptimized ? Math.max(baseSize, touchTargetSize) : baseSize;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.textContent = pointCount.toString();
    } else {
      // Individual marker with mobile touch target
      const size = mobileOptimized ? touchTargetSize : 24;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.innerHTML = '📍';

      // Center the emoji in larger touch target
      if (mobileOptimized) {
        el.style.fontSize = '16px';
        el.style.lineHeight = `${size}px`;
      }
    }

    // Add mobile-specific touch handling
    if (mobileOptimized) {
      el.style.touchAction = mobileGestureHandling === 'cooperative' ? 'manipulation' : 'auto';
      el.addEventListener('touchstart', handleTouchStart, { passive: true });
      el.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return el;
  }, [isMobile, enableMobileOptimizations, mobileGestureHandling, handleTouchStart, handleTouchEnd]);

  // Update markers based on current map view (using viewport-optimized markers)
  const updateMarkers = useCallback(() => {
    if (!map || !isLoaded) return;

    clearMarkers();

    // Use visible markers for performance optimization
    const markersToRender = enableViewportOptimization ? visibleMarkers : markers;

    if (!showClustering) {
      // Show all visible markers without clustering
      markersToRender.forEach(marker => {
        const el = createMarkerElement(false);

        const mapboxMarker = new mapboxgl.Marker(el)
          .setLngLat([marker.lng, marker.lat])
          .addTo(map);

        // Add click handler with analytics tracking
        el.addEventListener('click', () => {
          // Track marker click
          trackMapInteraction('marker_click', {
            zoomLevel: getZoom(),
            viewport: {
              width: map.getContainer().clientWidth,
              height: map.getContainer().clientHeight,
            },
          });

          if (onMarkerClick) {
            onMarkerClick(marker);
          }
        });

        markersRef.current.push(mapboxMarker);
      });
      return;
    }

    // Use clustering
    if (!superclusterRef.current) return;

    // Convert visible markers to GeoJSON features for better performance
    const features = markersToRender.map(marker => ({
      type: 'Feature' as const,
      properties: {
        cluster: false,
        markerId: marker.id,
        markerData: marker.data,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [marker.lng, marker.lat],
      },
    }));

    // Load features into supercluster
    superclusterRef.current.load(features);

    // Get current map bounds and zoom
    const bounds = getBounds();
    const zoom = getZoom();

    if (!bounds) return;

    // Get clusters for current view
    const clusters = superclusterRef.current.getClusters(
      [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
      Math.floor(zoom)
    );

    // Create markers for clusters and individual points
    clusters.forEach(cluster => {
      const [lng, lat] = cluster.geometry.coordinates;
      const isCluster = cluster.properties?.cluster;
      const pointCount = cluster.properties?.point_count;

      const el = createMarkerElement(isCluster, pointCount);
      
      const mapboxMarker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(map);

      // Add click handler with analytics tracking
      el.addEventListener('click', () => {
        if (isCluster) {
          // Track cluster click
          trackMapInteraction('cluster_click', {
            zoomLevel: getZoom(),
            clusterSize: pointCount,
            viewport: {
              width: map.getContainer().clientWidth,
              height: map.getContainer().clientHeight,
            },
          });

          // Zoom to cluster bounds
          const clusterId = cluster.properties?.cluster_id;
          if (clusterId !== undefined && superclusterRef.current) {
            const expansionZoom = superclusterRef.current.getClusterExpansionZoom(clusterId);
            setCenter([lng, lat], expansionZoom);
          }
        } else {
          // Track individual marker click
          trackMapInteraction('marker_click', {
            zoomLevel: getZoom(),
            viewport: {
              width: map.getContainer().clientWidth,
              height: map.getContainer().clientHeight,
            },
          });

          // Handle individual marker click
          const originalMarker = markersToRender.find(m => m.id === cluster.properties?.markerId);
          if (originalMarker && onMarkerClick) {
            onMarkerClick(originalMarker);
          }
        }
      });

      markersRef.current.push(mapboxMarker);
    });
  }, [map, isLoaded, markers, visibleMarkers, enableViewportOptimization, showClustering, clearMarkers, createMarkerElement, getBounds, getZoom, setCenter, onMarkerClick]);

  // Update markers when visible markers change
  useEffect(() => {
    updateMarkers();
  }, [visibleMarkers, updateMarkers]);

  // Fit map to markers when markers change
  useEffect(() => {
    if (!map || !isLoaded || markers.length === 0) return;

    if (markers.length === 1) {
      // Single marker - center on it
      const marker = markers[0];
      setCenter([marker.lng, marker.lat], 15);
    } else {
      // Multiple markers - fit bounds
      const bounds = new mapboxgl.LngLatBounds();
      markers.forEach(marker => {
        bounds.extend([marker.lng, marker.lat]);
      });
      fitBounds(bounds, { padding: 50 });
    }
  }, [map, isLoaded, markers, setCenter, fitBounds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMarkers();
    };
  }, [clearMarkers]);

  if (error) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground rounded-lg border',
          className
        )}
        style={{ height }}
      >
        <div className="text-center p-4">
          <p className="text-sm font-medium">Map Error</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <div
        ref={mapContainer}
        className="w-full rounded-lg overflow-hidden"
        style={{ height }}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">
              {isMobile ? 'Loading map...' : 'Loading map...'}
            </p>
            {isMobile && enableMobileOptimizations && (
              <p className="text-xs text-muted-foreground mt-1">
                Optimized for mobile
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
