"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminProtection } from "@/components/custom/RoleProtection"
import { AdminNotifications, AdminStatusIndicator } from "@/components/custom/AdminNotifications"
import { useAdminAnalytics, formatAnalyticsNumber } from "@/hooks/useAdminAnalytics"
import {
  IconShield,
  IconEye,
  IconClock,
  IconTrendingUp,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconArchive,
  IconActivity,
  IconRefresh
} from "@tabler/icons-react"
import Link from "next/link"

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
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

export default function AdminDashboardPage() {
  return (
    <AdminProtection>
      <AdminDashboardContent />
    </AdminProtection>
  )
}

function AdminDashboardContent() {
  const user = useQuery(api.users.current)
  const {
    moderationQueue,
    recentActivity,
    analyticsSummary,
    isLoading,
    isRealTimeConnected,
    recentUpdates,
    hasUnreadUpdates,
    markUpdatesAsRead,
    pendingCount,
    totalViews,
    totalSearches,
    totalContactClicks,
    lastUpdated,
  } = useAdminAnalytics(30) // Last 30 days

  if (user === undefined || isLoading) {
    return <AdminDashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <p className="text-muted-foreground">
              Monitor system activity and manage the business directory
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

          {/* Refresh indicator */}
          {isRealTimeConnected && (
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0" disabled>
              <IconRefresh className="h-4 w-4 animate-spin" />
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Pending Moderation</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {pendingCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IconClock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Awaiting review
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Views (30d)</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {totalViews.toLocaleString()}
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
            <CardDescription>Searches (30d)</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {totalSearches.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IconActivity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Search queries
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Contact Clicks (30d)</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {totalContactClicks.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                User interactions
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending Moderation */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Moderation</CardTitle>
              <CardDescription>
                Listings awaiting approval
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/admin/moderation">
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingCount === 0 ? (
              <div className="text-center py-8">
                <IconCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No pending listings
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {moderationQueue.slice(0, 5).map((listing) => (
                  <div key={listing._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{listing.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {listing.address.city}, {listing.address.region}
                      </p>
                    </div>
                    <Badge variant="outline">
                      <IconClock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                ))}
                {pendingCount > 5 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    And {pendingCount - 5} more...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest moderation actions
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/admin/analytics">
                View Analytics
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <IconActivity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No recent activity
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((log) => (
                  <div key={log._id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {log.action === "approve" && <IconCheck className="h-4 w-4 text-green-600" />}
                      {log.action === "reject" && <IconX className="h-4 w-4 text-red-600" />}
                      {log.action === "archive" && <IconArchive className="h-4 w-4 text-gray-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {log.action.charAt(0).toUpperCase() + log.action.slice(1)}d {log.entityType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log._creationTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
