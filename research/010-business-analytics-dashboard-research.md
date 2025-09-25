# Research: Business Analytics Dashboard

## Executive Summary

- **Feature Description**: Comprehensive analytics dashboard for business owners to track listing performance, including views, clicks, conversion metrics, and geographic insights
- **Scope and Impact**: Tests integration between analytics system, real-time data updates, role-based access control, and data visualization components
- **Estimated Complexity**: High - involves multiple system layers (frontend, backend, database, real-time updates, role management)

## Feature Analysis

### User Interactions

Based on research of analytics dashboard implementations, the business analytics dashboard will provide:

1. **Performance Metrics Overview**
   - Key performance indicators (KPIs) cards showing total views, clicks, conversions
   - Percentage change indicators with trend arrows
   - Real-time data updates with connection status indicators

2. **Time-based Trend Analysis**
   - Interactive charts showing performance over time (7d, 30d, 90d)
   - Line charts for views/clicks trends using Recharts
   - Bar charts for conversion metrics
   - Date range picker for custom time periods

3. **Geographic Distribution**
   - Map visualization showing engagement by location
   - Heatmap overlay for view density
   - Geographic breakdown tables

4. **Conversion Funnel Visualization**
   - Step-by-step conversion tracking
   - Funnel charts showing drop-off rates
   - Attribution analysis for traffic sources

5. **Export and Reporting**
   - CSV/PDF export functionality
   - Scheduled report generation
   - Email report delivery

### Edge Cases & Constraints

**Error Scenarios:**
- Network connectivity issues affecting real-time updates
- Large datasets causing performance degradation
- Missing or corrupted analytics data
- Role permission conflicts

**Boundary Conditions:**
- Zero data states for new business listings
- Maximum data limits for chart rendering
- Time zone handling for global businesses
- Mobile responsiveness constraints

**Security Considerations:**
- Role-based data access (owners see only their data)
- Data privacy compliance
- Secure API endpoints for analytics data
- Input validation for date ranges and filters

**Performance Limitations:**
- Chart rendering with large datasets (>10k points)
- Real-time update frequency limits
- Memory usage with multiple concurrent dashboards
- Database query optimization for analytics aggregations

## Technical Research

### Web Search Findings

**Analytics Dashboard Patterns:**
- **Latitude Analytics** - Developer-first embedded analytics with TypeScript
- **Briefer Dashboard** - Notebooks and dashboards with real-time capabilities
- **Tremor Dashboard Template** - Open-source dashboard using Recharts and Next.js
- **Payload Dashboard Analytics** - Plugin-based analytics with Google Analytics integration

**Key Technologies Identified:**
- **Recharts** - Most popular React charting library (used in Tremor template)
- **Real-time Updates** - WebSocket/SSE patterns for live data
- **Role-based Access** - Middleware-based permission checking
- **Data Visualization** - Card-based metric displays with trend indicators

### Code Examples from Research

#### 1. Payload Dashboard Analytics Plugin Pattern
**Source**: `NouanceLabs/payload-dashboard-analytics/src/index.ts`

```typescript
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
        },
      },
      endpoints: [
        ...endpoints,
        getGlobalAggregate(apiProvider, routeOptions),
        getGlobalChart(apiProvider, routeOptions),
        getPageChart(apiProvider, routeOptions),
        getLive(apiProvider, routeOptions),
      ],
    };
    return processedConfig;
  };
```

**Pattern**: Plugin-based architecture with widget mapping and multiple endpoint types

#### 2. Tremor Dashboard Dependencies
**Source**: `tremorlabs/template-dashboard-oss/package.json`

```json
{
  "dependencies": {
    "recharts": "^2.15.1",
    "date-fns": "^3.6.0",
    "react-day-picker": "^8.10.1",
    "@radix-ui/react-select": "^2.1.6",
    "tailwind-merge": "^2.6.0",
    "tailwind-variants": "^0.3.1"
  }
}
```

**Pattern**: Recharts + date utilities + Radix UI for accessible components

#### 3. Chart Color Utilities
**Source**: `tremorlabs/template-dashboard-oss/src/lib/chartUtils.ts`

```typescript
export type ColorUtility = "bg" | "stroke" | "fill" | "text"

export const chartColors = {
  indigo: {
    bg: "bg-indigo-500",
    stroke: "stroke-indigo-500",
    fill: "fill-indigo-500",
    text: "text-indigo-500"
  }
}
```

**Pattern**: Type-safe color utilities for consistent chart theming

### Codebase Analysis

**Existing Components to Leverage:**

#### 1. Analytics Query Pattern (Current Implementation)
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
  },
  returns: v.array(analyticsEventValidator),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Authentication required");

    // Verify ownership or admin rights
    const listing = await ctx.db.get(args.listingId);
    if (listing.ownerId !== user._id && user.role !== "admin") {
      throw new Error("Unauthorized: You can only view analytics for your own listings");
    }

    let events = await ctx.db
      .query("analyticsEvents")
      .withIndex("byListing", (q) => q.eq("listingId", args.listingId))
      .collect();

    // Filter by event type and date range
    if (args.eventType) {
      events = events.filter(event => event.type === args.eventType);
    }
    if (args.startDate) {
      events = events.filter(event => event._creationTime >= args.startDate!);
    }

    return events.sort((a, b) => b._creationTime - a._creationTime);
  },
});
```

**Pattern**: Role-based access control with ownership verification and flexible filtering

#### 2. Real-time Analytics Hook Pattern
**Source**: `hooks/useAdminAnalytics.ts:41-217`

```typescript
export function useAdminAnalytics(timeRange: number = 30): AdminAnalyticsHookReturn {
  const [recentUpdates, setRecentUpdates] = useState<AnalyticsUpdate[]>([]);
  const [hasUnreadUpdates, setHasUnreadUpdates] = useState(false);

  // Store previous values for comparison
  const previousDataRef = useRef<{
    totalViews: number;
    totalSearches: number;
    totalContactClicks: number;
  }>({
    totalViews: 0,
    totalSearches: 0,
    totalContactClicks: 0,
  });

  // Real-time queries
  const analyticsSummary = useQuery(api.analytics.getAnalyticsSummary, {
    startDate: Date.now() - (timeRange * 24 * 60 * 60 * 1000),
    endDate: Date.now()
  });

  // Track changes and generate updates
  useEffect(() => {
    if (isLoading) return;

    const currentData = {
      totalViews: analyticsSummary?.totalViews || 0,
      totalSearches: analyticsSummary?.totalSearches || 0,
      totalContactClicks: analyticsSummary?.totalContactClicks || 0,
    };

    const previousData = previousDataRef.current;
    const updates: AnalyticsUpdate[] = [];

    // Check for significant increases
    if (previousData.totalViews > 0 && currentData.totalViews > previousData.totalViews) {
      const viewIncrease = currentData.totalViews - previousData.totalViews;
      if (viewIncrease >= 10) {
        updates.push({
          type: 'analytics',
          message: `${viewIncrease} new listing views`,
          timestamp: Date.now(),
        });
      }
    }

    if (updates.length > 0) {
      setRecentUpdates(prev => [...updates, ...prev].slice(0, 20));
      setHasUnreadUpdates(true);
    }

    previousDataRef.current = currentData;
  }, [analyticsSummary]);

  return { analyticsSummary, recentUpdates, hasUnreadUpdates };
}
```

**Pattern**: Real-time data comparison with threshold-based notifications

#### 3. Owner Dashboard Card Structure
**Source**: `app/dashboard/owner/page.tsx:127-139`

```typescript
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
</div>
```

**Pattern**: Grid-based metric cards with icon + title + value + secondary info

**Required Modifications:**
- Extend `convex/analytics.ts` with owner-specific queries using existing patterns
- Create `useOwnerAnalytics.ts` hook following real-time update pattern
- Build chart components using existing card structure + Recharts
- Add geographic analytics queries with same role-based access pattern

**State Management Impacts:**
- Real-time Convex queries for live dashboard updates
- Local state for chart interactions and filters
- Session storage for dashboard preferences
- Error boundary handling for chart failures

## Reference Index

**External Documentation:**
- Recharts Documentation - https://recharts.org/en-US/
- Tremor Dashboard Template - https://github.com/tremorlabs/template-dashboard-oss
- Payload Analytics Plugin - https://github.com/NouanceLabs/payload-dashboard-analytics
- Latitude Analytics - https://github.com/latitude-dev/latitude

**Relevant Code Locations:**
- convex/analytics.ts:55-112 - Existing analytics queries
- hooks/useAnalytics.ts:70-240 - Analytics tracking system
- hooks/useAdminAnalytics.ts:41-217 - Real-time analytics patterns
- app/dashboard/owner/page.tsx:127-139 - Owner dashboard structure
- components/ui/card.tsx - Base UI components
- convex/schema.ts:150-170 - Analytics data schema

**Library/Framework References:**
- Recharts v2.15.1 - React charting library
- Next.js 15 - App Router patterns
- Convex - Real-time database queries
- Tailwind CSS v4 - Design system styling
- Radix UI - Accessible component primitives

**Related Issues or Discussions:**
- Role-based analytics access patterns
- Real-time dashboard performance optimization
- Chart rendering with large datasets
- Geographic data visualization techniques

## Implementation Strategy

### Phase 1: Backend Analytics Extensions
1. **Extend Convex Analytics Functions**
   - Create `getOwnerListingAnalytics` query for business-specific metrics
   - Add geographic aggregation queries
   - Implement time-series data queries for charts
   - Add conversion funnel tracking queries

2. **Schema Enhancements**
   - Add geographic metadata to analytics events
   - Create analytics aggregation tables for performance
   - Add conversion tracking fields

### Phase 2: Frontend Dashboard Components
1. **Analytics Hook Development**
   - Create `useOwnerAnalytics` hook for business owner data
   - Implement real-time updates with Convex subscriptions
   - Add error handling and loading states

2. **Chart Components**
   - Build Recharts-based metric cards
   - Create time-series line/bar charts
   - Implement geographic visualization components
   - Add conversion funnel charts

### Phase 3: Dashboard Integration
1. **Owner Dashboard Page**
   - Create `/dashboard/owner/analytics` route
   - Integrate with existing owner navigation
   - Add role-based access protection

2. **Real-time Features**
   - Live data updates with connection indicators
   - Notification system for significant changes
   - Export functionality for reports

### Phase 4: Performance & Polish
1. **Optimization**
   - Chart rendering performance with large datasets
   - Database query optimization
   - Caching strategies for aggregated data

2. **User Experience**
   - Mobile responsiveness
   - Loading states and error boundaries
   - Accessibility compliance

## Technical Specifications

### Required Dependencies
- Recharts (already installed) - Chart rendering
- Date-fns (for date manipulation)
- React-window (for large dataset virtualization)

### New Files to Create
- `hooks/useOwnerAnalytics.ts` - Owner-specific analytics hook
- `components/custom/AnalyticsDashboard.tsx` - Main dashboard component
- `components/custom/MetricCard.tsx` - KPI display component
- `components/custom/AnalyticsChart.tsx` - Chart wrapper component
- `app/dashboard/owner/analytics/page.tsx` - Analytics page route
- `convex/ownerAnalytics.ts` - Owner-specific analytics queries

### Integration Points
- Extends existing analytics system without breaking admin functionality
- Uses established role-based access patterns
- Integrates with current design system and navigation
- Leverages existing real-time update infrastructure
