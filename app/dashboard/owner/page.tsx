"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { OwnerProtection } from "@/components/custom/RoleProtection"
import { ModerationStatusNotifications, StatusIndicator } from "@/components/custom/ModerationStatusNotifications"
import { useModerationStatus } from "@/hooks/useModerationStatus"
import {
  IconPlus,
  IconEye,
  IconPhone,
  IconWorld,
  IconMapPin,
  IconClock,
  IconEdit,
  IconTrendingUp,
  IconBuilding,
  IconWifi,
  IconWifiOff
} from "@tabler/icons-react"
import Link from "next/link"

// Helper function to format relative time
function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

export default function OwnerDashboardPage() {
  return (
    <OwnerProtection>
      <OwnerDashboardContent />
    </OwnerProtection>
  )
}

function OwnerDashboardContent() {
  const user = useQuery(api.users.current)
  const {
    listings,
    isLoading: listingsLoading,
    isRealTimeConnected,
    recentStatusUpdates,
    hasUnreadUpdates,
    markUpdatesAsRead,
    getStatusCounts,
  } = useModerationStatus()

  if (user === undefined || listingsLoading) {
    return <OwnerDashboardSkeleton />
  }

  // Calculate summary statistics
  const totalViews = listings.reduce((sum, listing) => sum + listing.views, 0)
  const totalPhoneClicks = listings.reduce((sum, listing) => sum + listing.phoneClicks, 0)
  const totalWebsiteClicks = listings.reduce((sum, listing) => sum + listing.websiteClicks, 0)
  const totalDirectionsClicks = listings.reduce((sum, listing) => sum + listing.directionsClicks, 0)
  const totalInteractions = totalPhoneClicks + totalWebsiteClicks + totalDirectionsClicks

  const statusCounts = getStatusCounts()
  const pendingListings = listings.filter(listing => listing.status === "pending")
  const approvedListings = listings.filter(listing => listing.status === "approved")
  const rejectedListings = listings.filter(listing => listing.status === "rejected")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Business Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">
                Manage your listings and track performance
              </p>
              {/* Real-time connection indicator */}
              <div className="flex items-center gap-1">
                {isRealTimeConnected ? (
                  <IconWifi className="h-3 w-3 text-green-500" />
                ) : (
                  <IconWifiOff className="h-3 w-3 text-red-500" />
                )}
                <span className="text-xs text-muted-foreground">
                  {isRealTimeConnected ? 'Live updates' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Real-time notifications */}
          <ModerationStatusNotifications
            recentUpdates={recentStatusUpdates}
            hasUnreadUpdates={hasUnreadUpdates}
            isRealTimeConnected={isRealTimeConnected}
            onMarkAsRead={markUpdatesAsRead}
          />

          <Button asChild>
            <Link href="/dashboard/owner/create">
              <IconPlus className="h-4 w-4 mr-2" />
              Add New Listing
            </Link>
          </Button>
        </div>
      </div>

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
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all listings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInteractions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Phone, website & directions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalViews > 0 ? ((totalInteractions / totalViews) * 100).toFixed(1) : "0"}%
            </div>
            <p className="text-xs text-muted-foreground">
              Interactions per view
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Listings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Listings</CardTitle>
            <CardDescription>
              Manage and track your business listings
            </CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/owner/listings">
              View All
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {listings.length === 0 ? (
            <div className="text-center py-8">
              <IconBuilding className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first business listing to get started.
              </p>
              <Button asChild>
                <Link href="/dashboard/owner/create">
                  <IconPlus className="h-4 w-4 mr-2" />
                  Create First Listing
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.slice(0, 5).map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
              {listings.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/owner/listings">
                      View {listings.length - 5} more listings
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ListingCard({ listing }: { listing: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold truncate">{listing.name}</h4>
          <Badge className={getStatusColor(listing.status)}>
            {listing.status}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <IconMapPin className="h-3 w-3" />
            <span className="truncate">{listing.address.city}, {listing.address.region}</span>
          </div>
          <div className="flex items-center gap-1">
            <IconEye className="h-3 w-3" />
            <span>{listing.views} views</span>
          </div>
          <div className="flex items-center gap-1">
            <IconClock className="h-3 w-3" />
            <span>{formatTimeAgo(listing._creationTime)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/owner/edit/${listing._id}`}>
            <IconEdit className="h-3 w-3" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

function OwnerDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
