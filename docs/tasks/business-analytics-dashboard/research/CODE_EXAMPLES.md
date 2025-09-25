# Code Examples: Business Analytics Dashboard

## Overview

This document contains actual code examples and patterns discovered through MCP tool research for implementing the business analytics dashboard.

## Analytics Dashboard Patterns

### 1. Payload Dashboard Analytics Plugin Pattern

**Source**: `NouanceLabs/payload-dashboard-analytics/src/index.ts`

```typescript
import type { Config as PayloadConfig } from "payload/config";
import type { DashboardAnalyticsConfig } from "./types";

const dashboardAnalytics =
  (incomingConfig: DashboardAnalyticsConfig) =>
  (config: PayloadConfig): PayloadConfig => {
    const { admin, collections, globals } = config;
    const { provider, navigation, dashboard, access, cache } = incomingConfig;
    
    const processedConfig: PayloadConfig = {
      ...config,
      admin: {
        ...admin,
        components: {
          ...admin?.components,
          ...(dashboard?.beforeDashboard && {
            beforeDashboard: [
              ...(admin?.components?.beforeDashboard ?? []),
              ...dashboard.beforeDashboard.map(
                (widget) => DashboardWidgetMap[widget]
              ),
            ],
          }),
          ...(dashboard?.afterDashboard && {
            afterDashboard: [
              ...(admin?.components?.afterDashboard ?? []),
              ...dashboard.afterDashboard.map(
                (widget) => DashboardWidgetMap[widget]
              ),
            ],
          }),
        },
      },
      endpoints: [
        ...endpoints,
        getGlobalAggregate(apiProvider, routeOptions),
        getGlobalChart(apiProvider, routeOptions),
        getPageChart(apiProvider, routeOptions),
        getPageAggregate(apiProvider, routeOptions),
        getLive(apiProvider, routeOptions),
        getReport(apiProvider, routeOptions),
      ],
    };

    return processedConfig;
  };
```

**Key Patterns Identified**:
- Plugin-based architecture for analytics integration
- Widget mapping system for dashboard components
- Multiple endpoint types (aggregate, chart, live, report)
- Configuration-driven component injection

### 2. Tremor Dashboard Dependencies Pattern

**Source**: `tremorlabs/template-dashboard-oss/package.json`

```json
{
  "dependencies": {
    "@internationalized/date": "^3.7.0",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-slot": "^1.1.2",
    "@react-aria/datepicker": "^3.14.1",
    "@react-stately/datepicker": "^3.13.0",
    "@remixicon/react": "^4.6.0",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "next": "14.2.23",
    "next-themes": "^0.4.6",
    "react": "18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "18.3.1",
    "recharts": "^2.15.1",
    "tailwind-merge": "^2.6.0",
    "tailwind-variants": "^0.3.1"
  }
}
```

**Key Dependencies for Analytics Dashboards**:
- `recharts` - Primary charting library
- `date-fns` - Date manipulation and formatting
- `react-day-picker` - Date range selection
- `@internationalized/date` - Internationalization support
- `@radix-ui/*` - Accessible UI primitives
- `tailwind-variants` - Dynamic styling

### 3. Chart Color Utilities Pattern

**Source**: `tremorlabs/template-dashboard-oss/src/lib/chartUtils.ts`

```typescript
// Tremor Raw chartColors [v0.0.0]

export type ColorUtility = "bg" | "stroke" | "fill" | "text"

export const chartColors = {
  indigo: {
    bg: "bg-indigo-500",
    stroke: "stroke-indigo-500", 
    fill: "fill-indigo-500",
    text: "text-indigo-500"
  },
  // Additional color definitions...
}
```

**Pattern Benefits**:
- Consistent color theming across charts
- Type-safe color utilities
- Easy theme switching capability
- Design system integration

## Existing Codebase Patterns

### 1. Analytics Query Pattern (Current Implementation)

**Source**: `convex/analytics.ts:55-112`

```typescript
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
```

**Key Patterns**:
- Role-based access control with ownership verification
- Flexible filtering by event type and date range
- Index-based querying for performance
- Proper error handling and validation

### 2. Real-time Analytics Hook Pattern

**Source**: `hooks/useAdminAnalytics.ts:41-217`

```typescript
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

    // Add updates if any
    if (updates.length > 0) {
      setRecentUpdates(prev => {
        const combined = [...updates, ...prev];
        return combined.slice(0, 20); // Keep last 20 updates
      });
      setHasUnreadUpdates(true);
      setLastUpdated(Date.now());
    }

    // Update previous data
    previousDataRef.current = currentData;
  }, [isLoading, pendingCount, totalViews, totalSearches, totalContactClicks, recentActivity]);

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
```

**Key Patterns**:
- Real-time data comparison with useRef for previous values
- Threshold-based update notifications
- Update history management with limits
- Connection status tracking
- Computed values from raw data

### 3. Owner Dashboard Structure Pattern

**Source**: `app/dashboard/owner/page.tsx:127-139`

```typescript
{/* Summary Cards */}
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
      <IconBuilding className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{listings.length}</div>
      <p className="text-xs text-muted-foreground">
        {approvedListings.length} approved, {pendingListings.length} pending
      </p>
    </CardContent>
  </Card>
  
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Total Views</CardTitle>
      <IconEye className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {listings.reduce((sum, listing) => sum + listing.views, 0)}
      </div>
      <p className="text-xs text-muted-foreground">
        Across all listings
      </p>
    </CardContent>
  </Card>
</div>
```

**Key Patterns**:
- Grid-based metric card layout
- Icon + title + value structure
- Secondary information display
- Responsive grid breakpoints
- Aggregated data calculations
