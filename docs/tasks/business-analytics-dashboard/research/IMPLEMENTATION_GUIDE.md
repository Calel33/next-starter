# Implementation Guide: Business Analytics Dashboard

## Overview

This guide provides step-by-step implementation instructions for creating a comprehensive analytics dashboard for business owners to track their listing performance.

## Prerequisites

- Existing analytics system in `convex/analytics.ts`
- Role-based access control system
- Design system components (shadcn/ui)
- Recharts library (already installed)

## Implementation Steps

### Step 1: Backend Analytics Extensions

#### 1.1 Create Owner-Specific Analytics Queries

Create `convex/ownerAnalytics.ts`:

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const getOwnerListingAnalytics = query({
  args: {
    timeRange: v.optional(v.union(v.literal("7d"), v.literal("30d"), v.literal("90d"))),
    listingId: v.optional(v.id("listings")),
  },
  returns: v.object({
    totalViews: v.number(),
    totalClicks: v.number(),
    totalConversions: v.number(),
    viewsChange: v.number(),
    clicksChange: v.number(),
    conversionsChange: v.number(),
    chartData: v.array(v.object({
      date: v.string(),
      views: v.number(),
      clicks: v.number(),
      conversions: v.number(),
    })),
    topPerformingListings: v.array(v.object({
      listingId: v.id("listings"),
      name: v.string(),
      views: v.number(),
      clicks: v.number(),
    })),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "owner") {
      throw new Error("Unauthorized: Owner access required");
    }

    // Implementation details...
  },
});
```

#### 1.2 Add Geographic Analytics

```typescript
export const getGeographicAnalytics = query({
  args: {
    timeRange: v.optional(v.union(v.literal("7d"), v.literal("30d"), v.literal("90d"))),
  },
  returns: v.object({
    locationData: v.array(v.object({
      city: v.string(),
      region: v.string(),
      views: v.number(),
      clicks: v.number(),
      lat: v.number(),
      lng: v.number(),
    })),
  }),
  handler: async (ctx, args) => {
    // Geographic aggregation logic
  },
});
```

### Step 2: Frontend Analytics Hook

#### 2.1 Create `hooks/useOwnerAnalytics.ts`

```typescript
"use client";

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState, useEffect } from 'react';

export interface OwnerAnalyticsReturn {
  // Data
  analytics: any;
  geographicData: any;
  
  // Loading states
  isLoading: boolean;
  isRealTimeConnected: boolean;
  
  // Computed metrics
  totalViews: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  
  // Time range control
  timeRange: "7d" | "30d" | "90d";
  setTimeRange: (range: "7d" | "30d" | "90d") => void;
}

export function useOwnerAnalytics(): OwnerAnalyticsReturn {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  
  const analytics = useQuery(api.ownerAnalytics.getOwnerListingAnalytics, {
    timeRange,
  });
  
  const geographicData = useQuery(api.ownerAnalytics.getGeographicAnalytics, {
    timeRange,
  });
  
  // Implementation details...
  
  return {
    analytics,
    geographicData,
    isLoading: analytics === undefined || geographicData === undefined,
    isRealTimeConnected: analytics !== null && geographicData !== null,
    totalViews: analytics?.totalViews || 0,
    totalClicks: analytics?.totalClicks || 0,
    totalConversions: analytics?.totalConversions || 0,
    conversionRate: analytics ? (analytics.totalConversions / analytics.totalViews) * 100 : 0,
    timeRange,
    setTimeRange,
  };
}
```

### Step 3: Dashboard Components

#### 3.1 Create `components/custom/MetricCard.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  format?: "number" | "percentage" | "currency";
}

export function MetricCard({ title, value, change, icon, format = "number" }: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (format === "percentage") return `${val}%`;
    if (format === "currency") return `$${val}`;
    return val.toLocaleString();
  };

  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {isPositive && <IconTrendingUp className="h-3 w-3 text-green-500" />}
            {isNegative && <IconTrendingDown className="h-3 w-3 text-red-500" />}
            <span className={isPositive ? "text-green-500" : isNegative ? "text-red-500" : ""}>
              {change > 0 ? "+" : ""}{change.toFixed(1)}%
            </span>
            <span>from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### 3.2 Create `components/custom/AnalyticsChart.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AnalyticsChartProps {
  title: string;
  data: Array<{
    date: string;
    views: number;
    clicks: number;
    conversions: number;
  }>;
  type?: "line" | "bar";
  dataKeys?: string[];
}

export function AnalyticsChart({ title, data, type = "line", dataKeys = ["views", "clicks"] }: AnalyticsChartProps) {
  const Chart = type === "line" ? LineChart : BarChart;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <Chart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            {type === "line" ? (
              dataKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={`hsl(var(--chart-${index + 1}))`}
                  strokeWidth={2}
                />
              ))
            ) : (
              dataKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={`hsl(var(--chart-${index + 1}))`}
                />
              ))
            )}
          </Chart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

### Step 4: Main Dashboard Page

#### 4.1 Create `app/dashboard/owner/analytics/page.tsx`

```typescript
"use client";

import { OwnerProtection } from "@/components/custom/RoleProtection";
import { useOwnerAnalytics } from "@/hooks/useOwnerAnalytics";
import { MetricCard } from "@/components/custom/MetricCard";
import { AnalyticsChart } from "@/components/custom/AnalyticsChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconEye, IconMouse, IconTarget, IconMapPin } from "@tabler/icons-react";

export default function OwnerAnalyticsPage() {
  return (
    <OwnerProtection>
      <AnalyticsContent />
    </OwnerProtection>
  );
}

function AnalyticsContent() {
  const {
    analytics,
    geographicData,
    isLoading,
    totalViews,
    totalClicks,
    totalConversions,
    conversionRate,
    timeRange,
    setTimeRange,
  } = useOwnerAnalytics();

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Views"
          value={totalViews}
          change={analytics?.viewsChange}
          icon={<IconEye className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Total Clicks"
          value={totalClicks}
          change={analytics?.clicksChange}
          icon={<IconMouse className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Conversions"
          value={totalConversions}
          change={analytics?.conversionsChange}
          icon={<IconTarget className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Conversion Rate"
          value={conversionRate.toFixed(2)}
          format="percentage"
          icon={<IconMapPin className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <AnalyticsChart
          title="Views & Clicks Over Time"
          data={analytics?.chartData || []}
          type="line"
          dataKeys={["views", "clicks"]}
        />
        <AnalyticsChart
          title="Conversion Trends"
          data={analytics?.chartData || []}
          type="bar"
          dataKeys={["conversions"]}
        />
      </div>
    </div>
  );
}
```

### Step 5: Navigation Integration

#### 5.1 Update `app/dashboard/app-sidebar.tsx`

Add analytics route to owner navigation:

```typescript
const ownerNavItems = [
  {
    title: "My Business",
    url: "/dashboard/owner",
    icon: IconBuilding,
  },
  {
    title: "My Listings",
    url: "/dashboard/owner/listings",
    icon: IconListDetails,
  },
  {
    title: "Analytics", // Add this
    url: "/dashboard/owner/analytics",
    icon: IconAnalyze,
  },
  {
    title: "Add Listing",
    url: "/dashboard/owner/create",
    icon: IconPlus,
  },
]
```

## Testing Strategy

1. **Unit Tests**: Test analytics calculations and data transformations
2. **Integration Tests**: Test role-based access and data flow
3. **Performance Tests**: Test chart rendering with large datasets
4. **User Acceptance Tests**: Test dashboard usability and responsiveness

## Deployment Checklist

- [ ] Backend analytics queries implemented and tested
- [ ] Frontend components created and styled
- [ ] Role-based access control verified
- [ ] Real-time updates working
- [ ] Mobile responsiveness tested
- [ ] Performance optimized for large datasets
- [ ] Error handling implemented
- [ ] Navigation updated
