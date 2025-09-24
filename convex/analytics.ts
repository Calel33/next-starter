/**
 * Convex Functions: Analytics API
 * 
 * Functions for tracking and analyzing user interactions, search patterns,
 * and business performance metrics.
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

// Validators
const locationValidator = v.object({
  lat: v.number(),
  lng: v.number(),
});

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
    query: v.optional(v.string()),
    category: v.optional(v.string()),
    location: v.optional(locationValidator),
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
  ipHash: v.optional(v.string()),
  retentionDate: v.number(),
});

// Queries

/**
 * Get analytics events for a specific listing (owner/admin only)
 */
export const getListingAnalytics = query({
  args: {
    listingId: v.id("listings"),
    eventType: v.optional(v.union(
      v.literal("listing_view"),
      v.literal("contact_click"),
      v.literal("directions_click")
    )),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.array(analyticsEventValidator),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Authentication required");
    }
    
    // Verify ownership or admin rights
    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }
    
    if (listing.ownerId !== user._id && user.role !== "admin") {
      throw new Error("Unauthorized: You can only view analytics for your own listings");
    }
    
    let events = await ctx.db
      .query("analyticsEvents")
      .withIndex("byListing", (q) => q.eq("listingId", args.listingId))
      .collect();
    
    // Filter by event type
    if (args.eventType) {
      events = events.filter(event => event.type === args.eventType);
    }
    
    // Filter by date range
    if (args.startDate) {
      events = events.filter(event => event._creationTime >= args.startDate!);
    }
    if (args.endDate) {
      events = events.filter(event => event._creationTime <= args.endDate!);
    }
    
    // Sort by creation time (newest first)
    events.sort((a, b) => b._creationTime - a._creationTime);
    
    // Apply limit
    if (args.limit) {
      events = events.slice(0, args.limit);
    }
    
    return events;
  },
});

/**
 * Get search analytics (admin only)
 */
export const getSearchAnalytics = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.array(analyticsEventValidator),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    
    let events = await ctx.db
      .query("analyticsEvents")
      .withIndex("byType", (q) => q.eq("type", "search_query"))
      .collect();
    
    // Filter by date range
    if (args.startDate) {
      events = events.filter(event => event._creationTime >= args.startDate!);
    }
    if (args.endDate) {
      events = events.filter(event => event._creationTime <= args.endDate!);
    }
    
    // Sort by creation time (newest first)
    events.sort((a, b) => b._creationTime - a._creationTime);
    
    // Apply limit
    if (args.limit) {
      events = events.slice(0, args.limit);
    }
    
    return events;
  },
});

/**
 * Get aggregated analytics summary (admin only)
 */
export const getAnalyticsSummary = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  returns: v.object({
    totalViews: v.number(),
    totalSearches: v.number(),
    totalContactClicks: v.number(),
    totalDirectionsClicks: v.number(),
    topSearchTerms: v.array(v.object({
      term: v.string(),
      count: v.number(),
    })),
    topListings: v.array(v.object({
      listingId: v.id("listings"),
      listingName: v.string(),
      views: v.number(),
    })),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    
    let events = await ctx.db.query("analyticsEvents").collect();
    
    // Filter by date range
    if (args.startDate) {
      events = events.filter(event => event._creationTime >= args.startDate!);
    }
    if (args.endDate) {
      events = events.filter(event => event._creationTime <= args.endDate!);
    }
    
    // Calculate totals
    const totalViews = events.filter(e => e.type === "listing_view").length;
    const totalSearches = events.filter(e => e.type === "search_query").length;
    const totalContactClicks = events.filter(e => e.type === "contact_click").length;
    const totalDirectionsClicks = events.filter(e => e.type === "directions_click").length;
    
    // Calculate top search terms
    const searchTerms: Record<string, number> = {};
    events
      .filter(e => e.type === "search_query" && e.metadata.query)
      .forEach(e => {
        const term = e.metadata.query!.toLowerCase();
        searchTerms[term] = (searchTerms[term] || 0) + 1;
      });
    
    const topSearchTerms = Object.entries(searchTerms)
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Calculate top listings
    const listingViews: Record<string, number> = {};
    events
      .filter(e => e.type === "listing_view" && e.listingId)
      .forEach(e => {
        const id = e.listingId!;
        listingViews[id] = (listingViews[id] || 0) + 1;
      });
    
    const topListingEntries = Object.entries(listingViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    
    const topListings = [];
    for (const [listingId, views] of topListingEntries) {
      const listing = await ctx.db.get(listingId as any);
      if (listing && "name" in listing) {
        topListings.push({
          listingId: listing._id as any,
          listingName: (listing as any).name,
          views,
        });
      }
    }
    
    return {
      totalViews,
      totalSearches,
      totalContactClicks,
      totalDirectionsClicks,
      topSearchTerms,
      topListings,
    };
  },
});

// Mutations

/**
 * Track an analytics event
 */
export const trackEvent = mutation({
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
      query: v.optional(v.string()),
      category: v.optional(v.string()),
      location: v.optional(locationValidator),
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
    ipHash: v.optional(v.string()),
  },
  returns: v.id("analyticsEvents"),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    // Set retention date (90 days from now)
    const retentionDate = Date.now() + (90 * 24 * 60 * 60 * 1000);
    
    return await ctx.db.insert("analyticsEvents", {
      type: args.type,
      listingId: args.listingId,
      userId: user?._id,
      sessionId: args.sessionId,
      metadata: args.metadata,
      ipHash: args.ipHash,
      retentionDate,
    });
  },
});

/**
 * Clean up expired analytics events (internal function)
 */
export const cleanupExpiredEvents = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const now = Date.now();
    const expiredEvents = await ctx.db
      .query("analyticsEvents")
      .withIndex("byRetentionDate", (q) => q.lt("retentionDate", now))
      .collect();
    
    for (const event of expiredEvents) {
      await ctx.db.delete(event._id);
    }
    
    return expiredEvents.length;
  },
});
