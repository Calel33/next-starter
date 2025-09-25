# Business Analytics Dashboard - Part 2: Frontend Components and Hooks

## Requirements Summary
- Create owner-specific analytics hook following existing real-time patterns
- Build Recharts-based dashboard components using design system tokens
- Implement metric cards with trend indicators and real-time updates
- Create time-series charts for performance visualization
- Integrate with existing owner dashboard navigation and layout

## Research Findings

### Best Practices
- Real-time data comparison with threshold-based notifications (useAdminAnalytics pattern)
- Grid-based metric cards with icon + title + value + secondary info (owner dashboard pattern)
- Type-safe color utilities for consistent chart theming (Tremor pattern)
- Recharts + date utilities + Radix UI for accessible components

### Reference Implementations
- `hooks/useAdminAnalytics.ts:41-217` - Real-time analytics patterns with change detection
- `app/dashboard/owner/page.tsx:127-139` - Owner dashboard card structure
- `components/ui/card.tsx` - Base UI components with design system
- Tremor Dashboard Template - Recharts integration and chart utilities

### Technology Decisions
- **Recharts v2.15.1** - React charting library (already installed)
- **Design System Tokens** - Use existing color/spacing tokens, no hard-coded styles
- **Real-time Updates** - Convex useQuery with automatic subscriptions
- **Component Composition** - Build on existing Card components

## Codebase Integration Points

### Files to Modify
- `app/dashboard/owner/page.tsx` - Add analytics navigation link
- `app/dashboard/owner/layout.tsx` - Add analytics route to navigation

### New Files to Create
- `hooks/useOwnerAnalytics.ts` - Owner-specific analytics hook
- `components/custom/AnalyticsDashboard.tsx` - Main dashboard component
- `components/custom/MetricCard.tsx` - KPI display component
- `components/custom/AnalyticsChart.tsx` - Chart wrapper component
- `app/dashboard/owner/analytics/page.tsx` - Analytics page route

### Existing Patterns to Follow
- Hook structure: `useState` + `useRef` + `useEffect` for change tracking
- Card layout: `<Card><CardHeader><CardTitle>` + `<CardContent>` structure
- Design tokens: `bg-primary`, `text-primary-foreground`, spacing classes
- Error handling: Loading states and error boundaries

## Technical Design

### Component Architecture
```
AnalyticsDashboard
├── MetricCard (KPI Overview)
│   ├── Total Views
│   ├── Contact Clicks  
│   ├── Conversion Rate
│   └── Top Listing
├── AnalyticsChart (Time Series)
│   ├── Views Trend
│   ├── Clicks Trend
│   └── Date Range Picker
└── Real-time Updates
    ├── Connection Status
    └── Change Notifications
```

## Implementation Instructions

### Step 1: Create Owner Analytics Hook
**File**: `hooks/useOwnerAnalytics.ts`

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export interface AnalyticsUpdate {
  type: 'analytics';
  message: string;
  timestamp: number;
}

export interface OwnerAnalyticsHookReturn {
  analyticsSummary: {
    totalViews: number;
    totalContactClicks: number;
    totalDirectionsClicks: number;
    conversionRate: number;
    topPerformingListing?: {
      listingId: string;
      title: string;
      views: number;
    };
  } | undefined;
  timeSeriesData: Array<{
    date: string;
    views: number;
    contactClicks: number;
    directionsClicks: number;
  }> | undefined;
  recentUpdates: AnalyticsUpdate[];
  hasUnreadUpdates: boolean;
  isLoading: boolean;
  error: string | null;
  markUpdatesAsRead: () => void;
  refreshData: () => void;
}

export function useOwnerAnalytics(timeRange: number = 30): OwnerAnalyticsHookReturn {
  const [recentUpdates, setRecentUpdates] = useState<AnalyticsUpdate[]>([]);
  const [hasUnreadUpdates, setHasUnreadUpdates] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store previous values for comparison
  const previousDataRef = useRef<{
    totalViews: number;
    totalContactClicks: number;
    totalDirectionsClicks: number;
  }>({
    totalViews: 0,
    totalContactClicks: 0,
    totalDirectionsClicks: 0,
  });

  // Calculate date range
  const endDate = Date.now();
  const startDate = endDate - (timeRange * 24 * 60 * 60 * 1000);

  // Real-time queries
  const analyticsSummary = useQuery(api.ownerAnalytics.getOwnerAnalyticsSummary, {
    startDate,
    endDate
  });

  const timeSeriesData = useQuery(api.ownerAnalytics.getOwnerAnalyticsTimeSeries, {
    startDate,
    endDate,
    granularity: timeRange <= 7 ? "day" : timeRange <= 30 ? "day" : "week"
  });

  const isLoading = analyticsSummary === undefined || timeSeriesData === undefined;

  // Track changes and generate updates
  useEffect(() => {
    if (isLoading || !analyticsSummary) return;

    try {
      const currentData = {
        totalViews: analyticsSummary.totalViews || 0,
        totalContactClicks: analyticsSummary.totalContactClicks || 0,
        totalDirectionsClicks: analyticsSummary.totalDirectionsClicks || 0,
      };

      const previousData = previousDataRef.current;
      const updates: AnalyticsUpdate[] = [];

      // Check for significant increases (threshold: 5+ new events)
      if (previousData.totalViews > 0 && currentData.totalViews > previousData.totalViews) {
        const viewIncrease = currentData.totalViews - previousData.totalViews;
        if (viewIncrease >= 5) {
          updates.push({
            type: 'analytics',
            message: `${viewIncrease} new listing views`,
            timestamp: Date.now(),
          });
        }
      }

      if (previousData.totalContactClicks > 0 && currentData.totalContactClicks > previousData.totalContactClicks) {
        const clickIncrease = currentData.totalContactClicks - previousData.totalContactClicks;
        if (clickIncrease >= 2) {
          updates.push({
            type: 'analytics',
            message: `${clickIncrease} new contact clicks`,
            timestamp: Date.now(),
          });
        }
      }

      if (updates.length > 0) {
        setRecentUpdates(prev => [...updates, ...prev].slice(0, 20));
        setHasUnreadUpdates(true);
      }

      previousDataRef.current = currentData;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analytics update failed');
    }
  }, [analyticsSummary, isLoading]);

  const markUpdatesAsRead = () => {
    setHasUnreadUpdates(false);
  };

  const refreshData = () => {
    // Convex handles automatic refresh, but we can reset error state
    setError(null);
  };

  return {
    analyticsSummary,
    timeSeriesData,
    recentUpdates,
    hasUnreadUpdates,
    isLoading,
    error,
    markUpdatesAsRead,
    refreshData
  };
}
```

### Step 2: Create Metric Card Component
**File**: `components/custom/MetricCard.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  className 
}: MetricCardProps) {
  const formatTrend = (trendValue: number) => {
    const absValue = Math.abs(trendValue);
    return `${trendValue > 0 ? '+' : ''}${absValue.toFixed(1)}%`;
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="h-3 w-3" />;
    if (trend.value < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.isPositive && trend.value > 0) return "text-green-600 dark:text-green-400";
    if (!trend.isPositive && trend.value > 0) return "text-red-600 dark:text-red-400";
    if (trend.isPositive && trend.value < 0) return "text-red-600 dark:text-red-400";
    if (!trend.isPositive && trend.value < 0) return "text-green-600 dark:text-green-400";
    return "text-muted-foreground";
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between">
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className={cn("flex items-center text-xs", getTrendColor())}>
              {getTrendIcon()}
              <span className="ml-1">{formatTrend(trend.value)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 3: Create Analytics Chart Component
**File**: `components/custom/AnalyticsChart.tsx`

```typescript
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

interface AnalyticsChartProps {
  data: Array<{
    date: string;
    views: number;
    contactClicks: number;
    directionsClicks: number;
  }>;
  title: string;
  className?: string;
}

export function AnalyticsChart({ data, title, className }: AnalyticsChartProps) {
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="text-sm font-medium mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                className="text-xs fill-muted-foreground"
              />
              <YAxis className="text-xs fill-muted-foreground" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Views"
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="contactClicks" 
                stroke="hsl(var(--secondary))" 
                strokeWidth={2}
                name="Contact Clicks"
                dot={{ fill: "hsl(var(--secondary))", strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="directionsClicks" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                name="Directions"
                dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
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
- Requires Part 1 backend analytics queries to be implemented
- Uses existing Card components from design system
- Depends on Recharts library (already installed)
- Follows existing real-time update patterns

## Next Steps
- Part 3: Main dashboard page and navigation integration
- Part 4: Testing and documentation
