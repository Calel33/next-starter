"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminProtection } from "@/components/custom/RoleProtection"
import { AdminNotifications, AdminStatusIndicator } from "@/components/custom/AdminNotifications"
import { useAdminAnalytics, formatAnalyticsNumber } from "@/hooks/useAdminAnalytics"
import {
  IconEye,
  IconSearch,
  IconPhone,
  IconMapPin,
  IconAlertTriangle,
  IconUsers,
  IconBuilding,
  IconRefresh,
  IconTrendingUp
} from "@tabler/icons-react"

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <AdminProtection>
      <AnalyticsContent />
    </AdminProtection>
  )
}

function AnalyticsContent() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")

  const user = useQuery(api.users.current)

  // Convert timeRange to days for the hook
  const timeRangeDays = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;

  const {
    analyticsSummary,
    isLoading: analyticsLoading,
    isRealTimeConnected,
    recentUpdates,
    hasUnreadUpdates,
    markUpdatesAsRead,
    totalViews,
    totalSearches,
    totalContactClicks,
    lastUpdated,
  } = useAdminAnalytics(timeRangeDays)

  // Calculate date range for moderation stats
  const endDate = Date.now()
  const startDate = endDate - (timeRangeDays * 24 * 60 * 60 * 1000)

  const moderationStats = useQuery(api.moderationLogs.getModerationStats, {
    startDate,
    endDate
  })

  if (user === undefined || analyticsLoading || moderationStats === undefined) {
    return <AnalyticsSkeleton />
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <IconAlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">
          You don&apos;t have permission to view analytics.
        </p>
      </div>
    )
  }

  const timeRangeLabel = timeRange === "7d" ? "7 days" : timeRange === "30d" ? "30 days" : "90 days"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <p className="text-muted-foreground">
              Monitor platform usage and performance metrics
            </p>
            <AdminStatusIndicator
              isRealTimeConnected={isRealTimeConnected}
              lastUpdated={lastUpdated}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Real-time notifications */}
          <AdminNotifications
            recentUpdates={recentUpdates}
            hasUnreadUpdates={hasUnreadUpdates}
            isRealTimeConnected={isRealTimeConnected}
            onMarkAsRead={markUpdatesAsRead}
          />

          <Select value={timeRange} onValueChange={(value: "7d" | "30d" | "90d") => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          {/* Real-time refresh indicator */}
          {isRealTimeConnected && (
            <Button variant="outline" size="sm" disabled>
              <IconRefresh className="h-4 w-4 animate-spin" />
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Views ({timeRangeLabel})</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {analyticsSummary.totalViews.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IconEye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Listing views
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Search Queries ({timeRangeLabel})</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {analyticsSummary.totalSearches.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IconSearch className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                User searches
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Contact Clicks ({timeRangeLabel})</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {analyticsSummary.totalContactClicks.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IconPhone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Phone/website clicks
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Directions Clicks ({timeRangeLabel})</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {analyticsSummary.totalDirectionsClicks.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IconMapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Map directions
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Moderation Activity ({timeRangeLabel})</CardTitle>
          <CardDescription>
            Review and approval statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{moderationStats.totalActions}</div>
              <div className="text-sm text-muted-foreground">Total Actions</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {moderationStats.actionsByType.approve || 0}
              </div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {moderationStats.actionsByType.reject || 0}
              </div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">
                {moderationStats.averageReviewTime ? 
                  `${Math.round(moderationStats.averageReviewTime / 60)}m` : 
                  "N/A"
                }
              </div>
              <div className="text-sm text-muted-foreground">Avg Review Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Search Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Top Search Terms</CardTitle>
            <CardDescription>
              Most popular search queries ({timeRangeLabel})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsSummary.topSearchTerms.length === 0 ? (
              <div className="text-center py-8">
                <IconSearch className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No search data available
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {analyticsSummary.topSearchTerms.slice(0, 10).map((term, index) => (
                  <div key={term.term} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium">{term.term}</span>
                    </div>
                    <Badge variant="outline">
                      {term.count} searches
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Listings</CardTitle>
            <CardDescription>
              Most viewed listings ({timeRangeLabel})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsSummary.topListings.length === 0 ? (
              <div className="text-center py-8">
                <IconBuilding className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No listing data available
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {analyticsSummary.topListings.slice(0, 10).map((listing, index) => (
                  <div key={listing.listingId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{listing.listingName}</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      <IconEye className="h-3 w-3 mr-1" />
                      {listing.views}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Moderator Activity */}
      {moderationStats.actionsByModerator.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Moderator Activity</CardTitle>
            <CardDescription>
              Actions by moderator ({timeRangeLabel})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moderationStats.actionsByModerator.map((moderator) => (
                <div key={moderator.moderatorId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <IconUsers className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{moderator.moderatorName}</span>
                  </div>
                  <Badge variant="outline">
                    {moderator.actionCount} actions
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
