/**
 * Convex Functions: Analytics API
 * 
 * This file defines the Convex function signatures for analytics and event tracking.
 * All functions use the new Convex function syntax with args and returns validators.
 */

import { v } from "convex/values";

// Analytics event validator
const analyticsEventValidator = v.object({
  _id: v.id("analyticsEvents"),
  _creationTime: v.number(),
  type: v.union(
    v.literal("listing_view"),
    v.literal("search_query"), 
    v.literal("contact_click"),
    v.literal("directions_click"),
    v.literal("map_interaction")
  ),
  listingId: v.optional(v.id("listings")),
  userId: v.optional(v.id("users")),
  sessionId: v.string(),
  metadata: v.object({
    // Search query metadata
    query: v.optional(v.string()),
    category: v.optional(v.string()),
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    resultCount: v.optional(v.number()),
    
    // Contact click metadata
    contactType: v.optional(v.union(v.literal("phone"), v.literal("website"), v.literal("email"))),
    
    // Map interaction metadata
    action: v.optional(v.union(v.literal("zoom"), v.literal("pan"), v.literal("cluster_click"), v.literal("marker_click"))),
    zoomLevel: v.optional(v.number()),
    
    // General metadata
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
    viewport: v.optional(v.object({
      width: v.number(),
      height: v.number(),
    })),
  }),
  ipHash: v.optional(v.string()),
  retentionDate: v.number(),
});

// Query Functions

/**
 * Get listing analytics summary
 */
export const getListingAnalytics = {
  args: {
    listingId: v.id("listings"),
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  returns: v.object({
    views: v.number(),
    phoneClicks: v.number(),
    websiteClicks: v.number(),
    directionsClicks: v.number(),
    uniqueVisitors: v.number(),
    conversionRate: v.number(), // (clicks / views) * 100
    dailyStats: v.array(v.object({
      date: v.string(),
      views: v.number(),
      clicks: v.number(),
    })),
  }),
};

/**
 * Get owner dashboard analytics
 */
export const getOwnerAnalytics = {
  args: {
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  returns: v.object({
    totalViews: v.number(),
    totalClicks: v.number(),
    totalListings: v.number(),
    averageViewsPerListing: v.number(),
    topPerformingListings: v.array(v.object({
      listingId: v.id("listings"),
      name: v.string(),
      views: v.number(),
      clicks: v.number(),
    })),
    recentActivity: v.array(v.object({
      date: v.string(),
      views: v.number(),
      clicks: v.number(),
    })),
  }),
};

/**
 * Get system-wide analytics (admin only)
 */
export const getSystemAnalytics = {
  args: {
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  returns: v.object({
    totalListings: v.number(),
    totalViews: v.number(),
    totalSearches: v.number(),
    uniqueVisitors: v.number(),
    topCategories: v.array(v.object({
      categoryId: v.id("categories"),
      name: v.string(),
      listingCount: v.number(),
      viewCount: v.number(),
    })),
    topSearchTerms: v.array(v.object({
      term: v.string(),
      count: v.number(),
    })),
    userGrowth: v.array(v.object({
      date: v.string(),
      newUsers: v.number(),
      newListings: v.number(),
    })),
    geographicDistribution: v.array(v.object({
      city: v.string(),
      region: v.string(),
      listingCount: v.number(),
      viewCount: v.number(),
    })),
  }),
};

/**
 * Get search analytics
 */
export const getSearchAnalytics = {
  args: {
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    totalSearches: v.number(),
    averageResultsPerSearch: v.number(),
    noResultsRate: v.number(), // Percentage of searches with 0 results
    topQueries: v.array(v.object({
      query: v.string(),
      count: v.number(),
      averageResults: v.number(),
    })),
    topCategories: v.array(v.object({
      categoryId: v.id("categories"),
      name: v.string(),
      searchCount: v.number(),
    })),
  }),
};

// Mutation Functions

/**
 * Track analytics event
 */
export const trackEvent = {
  args: {
    type: v.union(
      v.literal("listing_view"),
      v.literal("search_query"),
      v.literal("contact_click"),
      v.literal("directions_click"),
      v.literal("map_interaction")
    ),
    listingId: v.optional(v.id("listings")),
    sessionId: v.string(),
    metadata: v.object({
      // Search query metadata
      query: v.optional(v.string()),
      category: v.optional(v.string()),
      location: v.optional(v.object({
        lat: v.number(),
        lng: v.number(),
      })),
      resultCount: v.optional(v.number()),
      
      // Contact click metadata
      contactType: v.optional(v.union(v.literal("phone"), v.literal("website"), v.literal("email"))),
      
      // Map interaction metadata
      action: v.optional(v.union(v.literal("zoom"), v.literal("pan"), v.literal("cluster_click"), v.literal("marker_click"))),
      zoomLevel: v.optional(v.number()),
      
      // General metadata
      userAgent: v.optional(v.string()),
      referrer: v.optional(v.string()),
      viewport: v.optional(v.object({
        width: v.number(),
        height: v.number(),
      })),
    }),
    ipAddress: v.optional(v.string()), // Will be hashed for privacy
  },
  returns: v.null(),
};

/**
 * Batch track multiple events (for performance)
 */
export const trackEventsBatch = {
  args: {
    events: v.array(v.object({
      type: v.union(
        v.literal("listing_view"),
        v.literal("search_query"),
        v.literal("contact_click"),
        v.literal("directions_click"),
        v.literal("map_interaction")
      ),
      listingId: v.optional(v.id("listings")),
      sessionId: v.string(),
      metadata: v.object({
        query: v.optional(v.string()),
        category: v.optional(v.string()),
        location: v.optional(v.object({
          lat: v.number(),
          lng: v.number(),
        })),
        resultCount: v.optional(v.number()),
        contactType: v.optional(v.union(v.literal("phone"), v.literal("website"), v.literal("email"))),
        action: v.optional(v.union(v.literal("zoom"), v.literal("pan"), v.literal("cluster_click"), v.literal("marker_click"))),
        zoomLevel: v.optional(v.number()),
        userAgent: v.optional(v.string()),
        referrer: v.optional(v.string()),
        viewport: v.optional(v.object({
          width: v.number(),
          height: v.number(),
        })),
      }),
      timestamp: v.optional(v.number()),
    })),
    ipAddress: v.optional(v.string()),
  },
  returns: v.object({
    processed: v.number(),
    errors: v.number(),
  }),
};

// Internal Functions

/**
 * Clean up expired analytics events
 */
export const cleanupExpiredEvents = {
  args: {
    retentionDays: v.optional(v.number()),
  },
  returns: v.object({
    deletedCount: v.number(),
    oldestRetained: v.number(),
  }),
};

/**
 * Generate analytics report
 */
export const generateReport = {
  args: {
    type: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    date: v.string(), // ISO date string
  },
  returns: v.object({
    reportId: v.string(),
    generatedAt: v.number(),
    data: v.object({
      period: v.string(),
      listings: v.object({
        total: v.number(),
        new: v.number(),
        views: v.number(),
      }),
      searches: v.object({
        total: v.number(),
        unique: v.number(),
        noResults: v.number(),
      }),
      interactions: v.object({
        phoneClicks: v.number(),
        websiteClicks: v.number(),
        directionsClicks: v.number(),
      }),
    }),
  }),
};

/**
 * Get rate limiting status for IP
 */
export const getRateLimitStatus = {
  args: {
    ipAddress: v.string(),
    action: v.union(v.literal("search"), v.literal("view"), v.literal("contact")),
  },
  returns: v.object({
    allowed: v.boolean(),
    remaining: v.number(),
    resetTime: v.number(),
  }),
};
