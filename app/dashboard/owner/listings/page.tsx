"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  IconSearch,
  IconFilter,
  IconBuilding,
  IconTrendingUp,
  IconCalendar,
  IconArchive,
  IconWifi,
  IconWifiOff
} from "@tabler/icons-react"
import Link from "next/link"
import { useState, useMemo, useEffect } from "react"
import { useDebounce } from "@/hooks/useDebounce"

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

export default function OwnerListingsPage() {
  return (
    <OwnerProtection>
      <OwnerListingsContent />
    </OwnerProtection>
  )
}

function OwnerListingsContent() {
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
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")

  // Debounce search query to improve performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Filter and sort listings
  const filteredAndSortedListings = useMemo(() => {
    if (!listings) return []

    let filtered = listings

    // Apply search filter (using debounced query)
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase()
      filtered = filtered.filter(listing =>
        listing.name.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.address.city.toLowerCase().includes(query) ||
        listing.address.region.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(listing => listing.status === statusFilter)
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b._creationTime - a._creationTime
        case "oldest":
          return a._creationTime - b._creationTime
        case "name":
          return a.name.localeCompare(b.name)
        case "views":
          return b.views - a.views
        case "interactions":
          const aInteractions = a.phoneClicks + a.websiteClicks + a.directionsClicks
          const bInteractions = b.phoneClicks + b.websiteClicks + b.directionsClicks
          return bInteractions - aInteractions
        default:
          return 0
      }
    })

    return sorted
  }, [listings, debouncedSearchQuery, statusFilter, sortBy])

  if (user === undefined || listingsLoading) {
    return <OwnerListingsSkeleton />
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <IconBuilding className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
        <p className="text-muted-foreground mb-4">
          Please sign in to access your listings.
        </p>
      </div>
    )
  }

  // Calculate summary statistics
  const totalViews = listings.reduce((sum, listing) => sum + listing.views, 0)
  const totalInteractions = listings.reduce((sum, listing) => 
    sum + listing.phoneClicks + listing.websiteClicks + listing.directionsClicks, 0)
  
  const statusCounts = listings.reduce((acc, listing) => {
    acc[listing.status] = (acc[listing.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Listings</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">
                Manage and track your business listings ({listings.length} total)
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

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <IconBuilding className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.approved || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <IconClock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statusCounts.pending || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <IconEye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interactions</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInteractions.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFilter className="h-5 w-5" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search listings by name, description, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="views">Most Views</SelectItem>
                <SelectItem value="interactions">Most Interactions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listings Grid */}
      <div className="space-y-4">
        {filteredAndSortedListings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              {listings.length === 0 ? (
                <>
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
                </>
              ) : (
                <>
                  <IconSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No listings found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filter criteria.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("")
                      setStatusFilter("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedListings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))
        )}
      </div>
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

  const totalInteractions = listing.phoneClicks + listing.websiteClicks + listing.directionsClicks
  const conversionRate = listing.views > 0 ? ((totalInteractions / listing.views) * 100).toFixed(1) : "0"

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold truncate">{listing.name}</h3>
              <StatusIndicator status={listing.status} />
            </div>
            
            {listing.description && (
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {listing.description}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <IconMapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{listing.address.city}, {listing.address.region}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <IconEye className="h-3 w-3 flex-shrink-0" />
                <span>{listing.views} views</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <IconTrendingUp className="h-3 w-3 flex-shrink-0" />
                <span>{totalInteractions} interactions</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <IconCalendar className="h-3 w-3 flex-shrink-0" />
                <span>{formatTimeAgo(listing._creationTime)}</span>
              </div>
            </div>

            {listing.status === "rejected" && listing.moderationNotes && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                <p className="text-sm text-red-800 dark:text-red-300">
                  <strong>Rejection reason:</strong> {listing.moderationNotes}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 lg:flex-col lg:items-end">
            <div className="text-right mb-2 hidden lg:block">
              <div className="text-sm font-medium">{conversionRate}%</div>
              <div className="text-xs text-muted-foreground">conversion</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/owner/edit/${listing._id}`}>
                  <IconEdit className="h-3 w-3 mr-1" />
                  Edit
                </Link>
              </Button>
              {listing.status === "approved" && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/directory/listing/${listing.slug}`} target="_blank">
                    <IconEye className="h-3 w-3 mr-1" />
                    View
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function OwnerListingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Skeleton key={j} className="h-4 w-24" />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
