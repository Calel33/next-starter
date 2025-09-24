"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export interface AnalyticsUpdate {
  type: 'moderation' | 'analytics' | 'activity';
  message: string;
  timestamp: number;
  data?: any;
}

export interface AdminAnalyticsHookReturn {
  // Data
  moderationQueue: any[];
  recentActivity: any[];
  analyticsSummary: any;
  
  // Loading states
  isLoading: boolean;
  isRealTimeConnected: boolean;
  
  // Real-time updates
  recentUpdates: AnalyticsUpdate[];
  hasUnreadUpdates: boolean;
  markUpdatesAsRead: () => void;
  
  // Computed values
  pendingCount: number;
  totalViews: number;
  totalSearches: number;
  totalContactClicks: number;
  lastUpdated: number | null;
}

/**
 * Custom hook for admin analytics with real-time updates
 * Tracks changes in moderation queue, analytics, and recent activity
 */
export function useAdminAnalytics(timeRange: number = 30): AdminAnalyticsHookReturn {
  const [recentUpdates, setRecentUpdates] = useState<AnalyticsUpdate[]>([]);
  const [hasUnreadUpdates, setHasUnreadUpdates] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  
  // Store previous values for comparison
  const previousDataRef = useRef<{
    pendingCount: number;
    totalViews: number;
    totalSearches: number;
    totalContactClicks: number;
    recentActivityCount: number;
  }>({
    pendingCount: 0,
    totalViews: 0,
    totalSearches: 0,
    totalContactClicks: 0,
    recentActivityCount: 0,
  });

  // Calculate date range
  const endDate = Date.now();
  const startDate = endDate - (timeRange * 24 * 60 * 60 * 1000);

  // Real-time queries
  const moderationQueue = useQuery(api.listings.getModerationQueue, { status: "pending" });
  const recentActivity = useQuery(api.moderationLogs.getRecentModerationActivity, { limit: 10 });
  const analyticsSummary = useQuery(api.analytics.getAnalyticsSummary, {
    startDate,
    endDate
  });

  // Loading and connection states
  const isLoading = moderationQueue === undefined || recentActivity === undefined || analyticsSummary === undefined;
  const isRealTimeConnected = !isLoading && moderationQueue !== null && recentActivity !== null && analyticsSummary !== null;

  // Computed values
  const pendingCount = moderationQueue?.length || 0;
  const totalViews = analyticsSummary?.totalViews || 0;
  const totalSearches = analyticsSummary?.totalSearches || 0;
  const totalContactClicks = analyticsSummary?.totalContactClicks || 0;

  // Track changes and generate updates
  useEffect(() => {
    if (isLoading) return;

    const currentData = {
      pendingCount,
      totalViews,
      totalSearches,
      totalContactClicks,
      recentActivityCount: recentActivity?.length || 0,
    };

    const previousData = previousDataRef.current;
    const updates: AnalyticsUpdate[] = [];

    // Check for moderation queue changes
    if (previousData.pendingCount !== currentData.pendingCount) {
      const diff = currentData.pendingCount - previousData.pendingCount;
      if (diff > 0) {
        updates.push({
          type: 'moderation',
          message: `${diff} new listing${diff > 1 ? 's' : ''} pending moderation`,
          timestamp: Date.now(),
          data: { count: currentData.pendingCount, change: diff }
        });
      } else if (diff < 0) {
        updates.push({
          type: 'moderation',
          message: `${Math.abs(diff)} listing${Math.abs(diff) > 1 ? 's' : ''} processed`,
          timestamp: Date.now(),
          data: { count: currentData.pendingCount, change: diff }
        });
      }
    }

    // Check for analytics changes (significant increases)
    if (previousData.totalViews > 0 && currentData.totalViews > previousData.totalViews) {
      const viewIncrease = currentData.totalViews - previousData.totalViews;
      if (viewIncrease >= 10) { // Only notify for significant increases
        updates.push({
          type: 'analytics',
          message: `${viewIncrease} new listing views`,
          timestamp: Date.now(),
          data: { views: currentData.totalViews, increase: viewIncrease }
        });
      }
    }

    if (previousData.totalSearches > 0 && currentData.totalSearches > previousData.totalSearches) {
      const searchIncrease = currentData.totalSearches - previousData.totalSearches;
      if (searchIncrease >= 5) { // Only notify for significant increases
        updates.push({
          type: 'analytics',
          message: `${searchIncrease} new searches performed`,
          timestamp: Date.now(),
          data: { searches: currentData.totalSearches, increase: searchIncrease }
        });
      }
    }

    // Check for new activity
    if (previousData.recentActivityCount > 0 && currentData.recentActivityCount > previousData.recentActivityCount) {
      const activityIncrease = currentData.recentActivityCount - previousData.recentActivityCount;
      updates.push({
        type: 'activity',
        message: `${activityIncrease} new moderation action${activityIncrease > 1 ? 's' : ''}`,
        timestamp: Date.now(),
        data: { count: currentData.recentActivityCount, increase: activityIncrease }
      });
    }

    // Add updates if any
    if (updates.length > 0) {
      setRecentUpdates(prev => {
        const combined = [...updates, ...prev];
        return combined.slice(0, 20); // Keep last 20 updates
      });
      setHasUnreadUpdates(true);
      setLastUpdated(Date.now());

      // Show browser notification for important updates
      if (Notification.permission === 'granted') {
        updates.forEach(update => {
          if (update.type === 'moderation' && update.data?.change > 0) {
            new Notification('New Moderation Required', {
              body: update.message,
              icon: '/favicon.ico',
              tag: 'admin-moderation',
            });
          }
        });
      }
    }

    // Update previous data
    previousDataRef.current = currentData;
  }, [isLoading, pendingCount, totalViews, totalSearches, totalContactClicks, recentActivity]);

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

  return {
    // Data
    moderationQueue: moderationQueue || [],
    recentActivity: recentActivity || [],
    analyticsSummary: analyticsSummary || {},
    
    // Loading states
    isLoading,
    isRealTimeConnected,
    
    // Real-time updates
    recentUpdates,
    hasUnreadUpdates,
    markUpdatesAsRead,
    
    // Computed values
    pendingCount,
    totalViews,
    totalSearches,
    totalContactClicks,
    lastUpdated,
  };
}

/**
 * Utility function to format analytics numbers
 */
export function formatAnalyticsNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Utility function to calculate percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
