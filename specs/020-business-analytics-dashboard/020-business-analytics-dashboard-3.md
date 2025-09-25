# Business Analytics Dashboard - Part 3: Dashboard Page and Navigation Integration

## Requirements Summary
- Create main analytics dashboard page at `/dashboard/owner/analytics`
- Integrate analytics navigation into existing owner dashboard layout
- Implement real-time connection status and update notifications
- Add role-based access protection using existing middleware patterns
- Create responsive layout with mobile-first design using design system tokens

## Research Findings

### Best Practices
- Grid-based metric cards with responsive breakpoints (existing owner dashboard pattern)
- Real-time connection indicators with status badges (admin dashboard pattern)
- Navigation integration with existing sidebar structure
- Role-based route protection using middleware

### Reference Implementations
- `app/dashboard/owner/page.tsx:127-139` - Owner dashboard grid layout
- `app/dashboard/owner/layout.tsx` - Navigation structure
- `middleware.ts` - Route protection patterns
- `hooks/useAdminAnalytics.ts` - Real-time update notifications

### Technology Decisions
- **Next.js App Router** - Follow existing route structure
- **Design System Tokens** - Use grid classes and spacing tokens
- **Real-time Updates** - Connection status with notification badges
- **Responsive Design** - Mobile-first with Tailwind breakpoints

## Codebase Integration Points

### Files to Modify
- `app/dashboard/owner/layout.tsx` - Add analytics navigation link
- `middleware.ts` - Ensure analytics route is protected (if needed)

### New Files to Create
- `app/dashboard/owner/analytics/page.tsx` - Main analytics dashboard page
- `components/custom/AnalyticsDashboard.tsx` - Complete dashboard component
- `components/custom/ConnectionStatus.tsx` - Real-time connection indicator

### Existing Patterns to Follow
- Page structure: `export default function Page()` with metadata
- Navigation: Sidebar link structure with icons and active states
- Grid layout: `grid gap-4 md:grid-cols-2 lg:grid-cols-4` responsive pattern
- Loading states: Skeleton components and loading indicators

## Technical Design

### Page Structure
```
/dashboard/owner/analytics
├── Connection Status Banner
├── KPI Metrics Grid (4 cards)
│   ├── Total Views
│   ├── Contact Clicks
│   ├── Conversion Rate
│   └── Top Performing Listing
├── Time Series Chart
└── Real-time Updates Panel
```

### Navigation Integration
```
Owner Dashboard Sidebar
├── Overview (existing)
├── Listings (existing)
├── Analytics (NEW)
└── Settings (existing)
```

## Implementation Instructions

### Step 1: Create Main Dashboard Component
**File**: `components/custom/AnalyticsDashboard.tsx`

```typescript
"use client";

import { useOwnerAnalytics } from "@/hooks/useOwnerAnalytics";
import { MetricCard } from "./MetricCard";
import { AnalyticsChart } from "./AnalyticsChart";
import { ConnectionStatus } from "./ConnectionStatus";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Phone, 
  TrendingUp, 
  Trophy,
  RefreshCw,
  Bell
} from "lucide-react";
import { useState } from "react";

interface AnalyticsDashboardProps {
  timeRange?: number;
}

export function AnalyticsDashboard({ timeRange = 30 }: AnalyticsDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const {
    analyticsSummary,
    timeSeriesData,
    recentUpdates,
    hasUnreadUpdates,
    isLoading,
    error,
    markUpdatesAsRead,
    refreshData
  } = useOwnerAnalytics(selectedTimeRange);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load analytics: {error}</p>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <ConnectionStatus 
        isConnected={!isLoading && !error}
        lastUpdate={analyticsSummary ? Date.now() : undefined}
      />

      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Overview</h2>
        <div className="flex items-center gap-2">
          {hasUnreadUpdates && (
            <Button
              variant="outline"
              size="sm"
              onClick={markUpdatesAsRead}
              className="relative"
            >
              <Bell className="h-4 w-4 mr-2" />
              Updates
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {recentUpdates.length}
              </Badge>
            </Button>
          )}
          <div className="flex gap-1">
            {[7, 30, 90].map((days) => (
              <Button
                key={days}
                variant={selectedTimeRange === days ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeRange(days)}
              >
                {days}d
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Views"
          value={isLoading ? "..." : analyticsSummary?.totalViews.toLocaleString() || "0"}
          subtitle="Listing page views"
          icon={<Eye className="h-4 w-4" />}
          trend={{
            value: 12.5, // TODO: Calculate from previous period
            isPositive: true
          }}
        />
        
        <MetricCard
          title="Contact Clicks"
          value={isLoading ? "..." : analyticsSummary?.totalContactClicks.toLocaleString() || "0"}
          subtitle="Phone/email clicks"
          icon={<Phone className="h-4 w-4" />}
          trend={{
            value: 8.2,
            isPositive: true
          }}
        />
        
        <MetricCard
          title="Conversion Rate"
          value={isLoading ? "..." : `${analyticsSummary?.conversionRate || 0}%`}
          subtitle="Views to contacts"
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{
            value: -2.1,
            isPositive: true // Lower conversion rate is bad, but positive trend means improvement
          }}
        />
        
        <MetricCard
          title="Top Listing"
          value={isLoading ? "..." : analyticsSummary?.topPerformingListing?.title || "No data"}
          subtitle={
            analyticsSummary?.topPerformingListing 
              ? `${analyticsSummary.topPerformingListing.views} views`
              : "No listings yet"
          }
          icon={<Trophy className="h-4 w-4" />}
        />
      </div>

      {/* Time Series Chart */}
      {timeSeriesData && timeSeriesData.length > 0 && (
        <AnalyticsChart
          data={timeSeriesData}
          title={`Performance Trends (Last ${selectedTimeRange} days)`}
          className="col-span-full"
        />
      )}

      {/* Recent Updates Panel */}
      {recentUpdates.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {recentUpdates.slice(0, 5).map((update, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span>{update.message}</span>
                <span className="text-muted-foreground">
                  {new Date(update.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Step 2: Create Connection Status Component
**File**: `components/custom/ConnectionStatus.tsx`

```typescript
"use client";

import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface ConnectionStatusProps {
  isConnected: boolean;
  lastUpdate?: number;
}

export function ConnectionStatus({ isConnected, lastUpdate }: ConnectionStatusProps) {
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    if (!lastUpdate) return;

    const updateTimeAgo = () => {
      const now = Date.now();
      const diff = now - lastUpdate;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      
      if (seconds < 60) {
        setTimeAgo("Just now");
      } else if (minutes < 60) {
        setTimeAgo(`${minutes}m ago`);
      } else {
        setTimeAgo(`${Math.floor(minutes / 60)}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <Wifi className="h-4 w-4 text-green-600" />
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Connected
            </Badge>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-red-600" />
            <Badge variant="destructive">
              Disconnected
            </Badge>
          </>
        )}
      </div>
      
      {lastUpdate && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Updated {timeAgo}</span>
        </div>
      )}
    </div>
  );
}
```

### Step 3: Create Analytics Page
**File**: `app/dashboard/owner/analytics/page.tsx`

```typescript
import { AnalyticsDashboard } from "@/components/custom/AnalyticsDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics | Business Dashboard",
  description: "Track your business listing performance and analytics",
};

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Business Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track your listing performance, views, and customer engagement
        </p>
      </div>
      
      <AnalyticsDashboard />
    </div>
  );
}
```

### Step 4: Update Owner Dashboard Navigation
**File**: `app/dashboard/owner/layout.tsx` (modification)

Add analytics navigation link to existing sidebar:

```typescript
// Add to existing navigation items array
{
  title: "Analytics",
  href: "/dashboard/owner/analytics",
  icon: TrendingUp, // Import from lucide-react
  description: "View performance metrics"
}
```

## Full Implementation Checklist
- [ ] Frontend changes (components, forms, UI state) - **THIS PART**
- [ ] Backend changes (services, controllers, logic) - Part 1 ✓
- [ ] Database changes (schemas, migrations, seeds) - Part 1 ✓
- [ ] API changes (routes, contracts, clients) - Part 1 ✓
- [ ] Test updates (unit, integration, E2E) - Part 4
- [ ] Documentation updates (API reference, guides, changelogs) - Part 4

## Integration Dependencies
- Requires Parts 1 & 2 to be implemented (backend + components)
- Uses existing navigation and layout patterns
- Depends on design system tokens and components
- Follows existing role-based access patterns

## Next Steps
- Part 4: Testing, error handling, and documentation
- Geographic analytics visualization (future enhancement)
- Export functionality (future enhancement)
