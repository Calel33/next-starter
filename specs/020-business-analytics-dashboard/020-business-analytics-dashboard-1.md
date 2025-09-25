# Business Analytics Dashboard - Part 1: Backend Analytics Extensions

## Requirements Summary
- Extend Convex analytics system with owner-specific queries for business performance tracking
- Add geographic analytics aggregation for location-based insights
- Implement time-series data queries for trend analysis and charts
- Create conversion funnel tracking with role-based access control
- Maintain existing admin analytics functionality without breaking changes

## Research Findings

### Best Practices
- Plugin-based architecture with widget mapping (from Payload Dashboard Analytics)
- Role-based access control with ownership verification (existing pattern in codebase)
- Real-time data comparison with threshold-based notifications (existing useAdminAnalytics pattern)
- Type-safe query validators with flexible filtering (existing analytics.ts pattern)

### Reference Implementations
- `convex/analytics.ts:55-112` - Existing analytics queries with role-based access
- `hooks/useAdminAnalytics.ts:41-217` - Real-time analytics patterns
- Payload Dashboard Analytics - Plugin-based analytics with multiple endpoint types
- Tremor Dashboard Template - Recharts integration patterns

### Technology Decisions
- **Convex Queries** - Extend existing analytics.ts with owner-specific functions
- **Role-based Access** - Use existing ownership verification pattern
- **Real-time Updates** - Leverage existing Convex subscription patterns
- **Type Safety** - Follow existing validator patterns with v.* types

## Codebase Integration Points

### Files to Modify
- `convex/analytics.ts` - Add owner-specific analytics queries
- `convex/schema.ts` - Add geographic metadata fields to analytics events

### New Files to Create
- `convex/ownerAnalytics.ts` - Owner-specific analytics functions
- `convex/geoAnalytics.ts` - Geographic analytics aggregation functions

### Existing Patterns to Follow
- Role verification: `listing.ownerId !== user._id && user.role !== "admin"`
- Query structure: `query({ args: {...}, returns: v.array(...), handler: async (ctx, args) => {...} })`
- Index usage: `.withIndex("byListing", (q) => q.eq("listingId", args.listingId))`
- Error handling: `throw new Error("Unauthorized: You can only view analytics for your own listings")`

## Technical Design

### Architecture Overview
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Convex Queries │    │   Database      │
│   Dashboard     │◄──►│   ownerAnalytics │◄──►│   Analytics     │
│   Components    │    │   geoAnalytics   │    │   Events        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Database Schema Extensions

#### Analytics Events Geographic Enhancement
```typescript
// Add to existing analyticsEvents table in schema.ts
export const analyticsEventValidator = v.object({
  // ... existing fields
  location: v.optional(v.object({
    country: v.optional(v.string()),
    region: v.optional(v.string()),
    city: v.optional(v.string()),
    coordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number()
    }))
  }))
});
```

## Implementation Instructions

### Step 1: Extend Analytics Schema
**File**: `convex/schema.ts`

Add geographic fields to existing analyticsEvents table:

```typescript
// Extend the existing analyticsEventValidator
export const analyticsEventValidator = v.object({
  type: v.union(
    v.literal("listing_view"),
    v.literal("contact_click"),
    v.literal("directions_click"),
    v.literal("search_performed"),
    v.literal("category_browse")
  ),
  listingId: v.optional(v.id("listings")),
  userId: v.optional(v.id("users")),
  sessionId: v.string(),
  userAgent: v.optional(v.string()),
  referrer: v.optional(v.string()),
  searchQuery: v.optional(v.string()),
  categoryId: v.optional(v.id("categories")),
  // NEW: Geographic data
  location: v.optional(v.object({
    country: v.optional(v.string()),
    region: v.optional(v.string()),
    city: v.optional(v.string()),
    coordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number()
    }))
  }))
});
```

### Step 2: Create Owner Analytics Queries
**File**: `convex/ownerAnalytics.ts`

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

// Get analytics summary for owner's listings
export const getOwnerAnalyticsSummary = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  returns: v.object({
    totalViews: v.number(),
    totalContactClicks: v.number(),
    totalDirectionsClicks: v.number(),
    conversionRate: v.number(),
    topPerformingListing: v.optional(v.object({
      listingId: v.id("listings"),
      title: v.string(),
      views: v.number()
    }))
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Authentication required");
    if (user.role !== "owner" && user.role !== "admin") {
      throw new Error("Unauthorized: Owner access required");
    }

    // Get owner's listings
    const listings = await ctx.db
      .query("listings")
      .withIndex("byOwner", (q) => q.eq("ownerId", user._id))
      .collect();

    const listingIds = listings.map(l => l._id);
    
    // Get analytics events for owner's listings
    let events = await ctx.db
      .query("analyticsEvents")
      .collect();

    // Filter by owner's listings and date range
    events = events.filter(event => 
      event.listingId && listingIds.includes(event.listingId)
    );

    if (args.startDate) {
      events = events.filter(event => event._creationTime >= args.startDate!);
    }
    if (args.endDate) {
      events = events.filter(event => event._creationTime <= args.endDate!);
    }

    // Calculate metrics
    const totalViews = events.filter(e => e.type === "listing_view").length;
    const totalContactClicks = events.filter(e => e.type === "contact_click").length;
    const totalDirectionsClicks = events.filter(e => e.type === "directions_click").length;
    const conversionRate = totalViews > 0 ? 
      ((totalContactClicks + totalDirectionsClicks) / totalViews) * 100 : 0;

    // Find top performing listing
    const listingViews = new Map<string, number>();
    events.filter(e => e.type === "listing_view" && e.listingId).forEach(event => {
      const count = listingViews.get(event.listingId!) || 0;
      listingViews.set(event.listingId!, count + 1);
    });

    let topPerformingListing = undefined;
    if (listingViews.size > 0) {
      const topListingId = Array.from(listingViews.entries())
        .sort(([,a], [,b]) => b - a)[0][0];
      const topListing = listings.find(l => l._id === topListingId);
      if (topListing) {
        topPerformingListing = {
          listingId: topListing._id,
          title: topListing.title,
          views: listingViews.get(topListingId)!
        };
      }
    }

    return {
      totalViews,
      totalContactClicks,
      totalDirectionsClicks,
      conversionRate: Math.round(conversionRate * 100) / 100,
      topPerformingListing
    };
  },
});
```

### Step 3: Create Time-Series Analytics Query
**File**: `convex/ownerAnalytics.ts` (continued)

```typescript
// Get time-series data for charts
export const getOwnerAnalyticsTimeSeries = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    granularity: v.union(v.literal("day"), v.literal("week"), v.literal("month"))
  },
  returns: v.array(v.object({
    date: v.string(),
    views: v.number(),
    contactClicks: v.number(),
    directionsClicks: v.number()
  })),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Authentication required");
    if (user.role !== "owner" && user.role !== "admin") {
      throw new Error("Unauthorized: Owner access required");
    }

    // Get owner's listings
    const listings = await ctx.db
      .query("listings")
      .withIndex("byOwner", (q) => q.eq("ownerId", user._id))
      .collect();

    const listingIds = listings.map(l => l._id);
    
    // Get analytics events for date range
    let events = await ctx.db
      .query("analyticsEvents")
      .collect();

    events = events.filter(event => 
      event.listingId && 
      listingIds.includes(event.listingId) &&
      event._creationTime >= args.startDate &&
      event._creationTime <= args.endDate
    );

    // Group by time period
    const timeSeriesData = new Map<string, {
      views: number;
      contactClicks: number;
      directionsClicks: number;
    }>();

    events.forEach(event => {
      const date = new Date(event._creationTime);
      let dateKey: string;
      
      switch (args.granularity) {
        case "day":
          dateKey = date.toISOString().split('T')[0];
          break;
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          dateKey = weekStart.toISOString().split('T')[0];
          break;
        case "month":
          dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      if (!timeSeriesData.has(dateKey)) {
        timeSeriesData.set(dateKey, { views: 0, contactClicks: 0, directionsClicks: 0 });
      }

      const data = timeSeriesData.get(dateKey)!;
      switch (event.type) {
        case "listing_view":
          data.views++;
          break;
        case "contact_click":
          data.contactClicks++;
          break;
        case "directions_click":
          data.directionsClicks++;
          break;
      }
    });

    return Array.from(timeSeriesData.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});
```

## Full Implementation Checklist
- [ ] Frontend changes (components, forms, UI state) - Part 2
- [ ] Backend changes (services, controllers, logic) - **THIS PART**
- [ ] Database changes (schemas, migrations, seeds) - **THIS PART**
- [ ] API changes (routes, contracts, clients) - **THIS PART**
- [ ] Test updates (unit, integration, E2E) - Part 4
- [ ] Documentation updates (API reference, guides, changelogs) - Part 4

## Integration Dependencies
- Requires existing `convex/users.ts` getCurrentUser function
- Depends on existing `convex/schema.ts` analyticsEvents table
- Uses existing role-based access patterns
- Maintains compatibility with existing admin analytics

## Next Steps
- Part 2: Frontend dashboard components and hooks
- Part 3: Geographic analytics and visualization
- Part 4: Testing and documentation
