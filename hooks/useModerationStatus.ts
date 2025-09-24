"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export interface ModerationStatusUpdate {
  listingId: Id<"listings">;
  oldStatus: string;
  newStatus: string;
  timestamp: number;
  listingName: string;
}

export interface ModerationStatusHookReturn {
  listings: any[];
  isLoading: boolean;
  isRealTimeConnected: boolean;
  recentStatusUpdates: ModerationStatusUpdate[];
  hasUnreadUpdates: boolean;
  markUpdatesAsRead: () => void;
  getStatusCounts: () => {
    pending: number;
    approved: number;
    rejected: number;
    archived: number;
  };
}

/**
 * Custom hook for tracking real-time moderation status updates for owners
 * Provides notifications when listing status changes and tracks recent updates
 */
export function useModerationStatus(): ModerationStatusHookReturn {
  const [recentStatusUpdates, setRecentStatusUpdates] = useState<ModerationStatusUpdate[]>([]);
  const [hasUnreadUpdates, setHasUnreadUpdates] = useState(false);
  const previousListingsRef = useRef<any[]>([]);
  
  // Get current user's listings with real-time updates
  const listings = useQuery(api.listings.getMyListings);
  const isLoading = listings === undefined;
  const isRealTimeConnected = listings !== undefined && listings !== null;

  // Track status changes
  useEffect(() => {
    if (!listings || listings.length === 0) return;

    const previousListings = previousListingsRef.current;
    
    if (previousListings.length > 0) {
      // Check for status changes
      const statusUpdates: ModerationStatusUpdate[] = [];
      
      listings.forEach(currentListing => {
        const previousListing = previousListings.find(p => p._id === currentListing._id);
        
        if (previousListing && previousListing.status !== currentListing.status) {
          statusUpdates.push({
            listingId: currentListing._id,
            oldStatus: previousListing.status,
            newStatus: currentListing.status,
            timestamp: Date.now(),
            listingName: currentListing.name,
          });
        }
      });

      if (statusUpdates.length > 0) {
        setRecentStatusUpdates(prev => {
          const updated = [...statusUpdates, ...prev];
          // Keep only last 10 updates
          return updated.slice(0, 10);
        });
        setHasUnreadUpdates(true);
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          statusUpdates.forEach(update => {
            new Notification(`Listing Status Updated`, {
              body: `${update.listingName} is now ${update.newStatus}`,
              icon: '/favicon.ico',
              tag: `listing-${update.listingId}`,
            });
          });
        }
      }
    }

    previousListingsRef.current = listings;
  }, [listings]);

  // Request notification permission on first load
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Mark updates as read
  const markUpdatesAsRead = useCallback(() => {
    setHasUnreadUpdates(false);
  }, []);

  // Get status counts
  const getStatusCounts = useCallback(() => {
    if (!listings) {
      return { pending: 0, approved: 0, rejected: 0, archived: 0 };
    }

    return listings.reduce((counts, listing) => {
      counts[listing.status as keyof typeof counts]++;
      return counts;
    }, { pending: 0, approved: 0, rejected: 0, archived: 0 });
  }, [listings]);

  return {
    listings: listings || [],
    isLoading,
    isRealTimeConnected,
    recentStatusUpdates,
    hasUnreadUpdates,
    markUpdatesAsRead,
    getStatusCounts,
  };
}

/**
 * Utility function to get status color for UI display
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300';
    case 'archived':
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300';
  }
}

/**
 * Utility function to get status icon
 */
export function getStatusIcon(status: string): string {
  switch (status) {
    case 'approved':
      return '✅';
    case 'pending':
      return '⏳';
    case 'rejected':
      return '❌';
    case 'archived':
      return '📁';
    default:
      return '❓';
  }
}
