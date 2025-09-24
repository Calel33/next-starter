"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  fallback?: React.ReactNode;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
  enableProgressiveLoading?: boolean;
  rootMargin?: string;
}

/**
 * LazyImage component with progressive loading and intersection observer
 * Provides lazy loading, blur-to-sharp transitions, and fallback handling
 */
export function LazyImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  fallback,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  priority = false,
  quality = 75,
  onLoad,
  onError,
  enableProgressiveLoading = true,
  rootMargin = '50px',
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !enableProgressiveLoading) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, enableProgressiveLoading, rootMargin]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate blur placeholder if not provided
  const defaultBlurDataURL = blurDataURL || 
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  if (hasError) {
    return (
      <div 
        className={cn(
          "bg-muted flex items-center justify-center text-muted-foreground",
          fill ? "absolute inset-0" : "w-full h-full",
          className
        )}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div 
      ref={imgRef}
      className={cn(
        "relative overflow-hidden",
        fill ? "w-full h-full" : "",
        className
      )}
    >
      {isInView ? (
        <>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            fill={fill}
            sizes={sizes}
            quality={quality}
            placeholder={placeholder}
            blurDataURL={placeholder === 'blur' ? defaultBlurDataURL : undefined}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
              fill ? "object-cover" : ""
            )}
          />
          
          {/* Loading placeholder */}
          {!isLoaded && (
            <div className={cn(
              "absolute inset-0 bg-muted animate-pulse flex items-center justify-center",
              fill ? "" : "w-full h-full"
            )}>
              <svg
                className="w-6 h-6 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </>
      ) : (
        /* Placeholder before image loads */
        <div className={cn(
          "bg-muted animate-pulse flex items-center justify-center",
          fill ? "absolute inset-0" : "w-full h-full"
        )}>
          <svg
            className="w-6 h-6 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
