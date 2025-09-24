"use client";

import { useState, useCallback, useRef, useEffect } from 'react';

export interface ImageLoadState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  progress: number;
}

export interface UseImageLoaderOptions {
  preload?: boolean;
  timeout?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

export interface UseImageLoaderReturn extends ImageLoadState {
  loadImage: (src: string) => Promise<void>;
  reset: () => void;
  preloadImage: (src: string) => Promise<HTMLImageElement>;
}

/**
 * Hook for managing image loading states with preloading support
 * Provides loading states, error handling, and progress tracking
 */
export function useImageLoader(options: UseImageLoaderOptions = {}): UseImageLoaderReturn {
  const {
    preload = false,
    timeout = 10000,
    onLoad,
    onError,
    onProgress,
  } = options;

  const [state, setState] = useState<ImageLoadState>({
    isLoading: false,
    isLoaded: false,
    hasError: false,
    progress: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setState({
      isLoading: false,
      isLoaded: false,
      hasError: false,
      progress: 0,
    });
  }, []);

  // Preload image function
  const preloadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      
      img.src = src;
    });
  }, []);

  // Load image with progress tracking
  const loadImage = useCallback(async (src: string) => {
    reset();

    setState(prev => ({ ...prev, isLoading: true, progress: 0 }));

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    // Set timeout
    timeoutRef.current = setTimeout(() => {
      const error = new Error(`Image load timeout: ${src}`);
      setState(prev => ({ ...prev, isLoading: false, hasError: true }));
      onError?.(error);
    }, timeout);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setState(prev => {
          if (prev.progress < 90) {
            const newProgress = prev.progress + Math.random() * 20;
            onProgress?.(newProgress);
            return { ...prev, progress: Math.min(newProgress, 90) };
          }
          return prev;
        });
      }, 100);

      // Load the image
      await preloadImage(src);

      // Clear progress interval
      clearInterval(progressInterval);

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Update state to loaded
      setState(prev => ({
        ...prev,
        isLoading: false,
        isLoaded: true,
        progress: 100,
      }));

      onProgress?.(100);
      onLoad?.();

    } catch (error) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
      }));

      onError?.(error as Error);
    }
  }, [preloadImage, timeout, onLoad, onError, onProgress, reset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    loadImage,
    reset,
    preloadImage,
  };
}
