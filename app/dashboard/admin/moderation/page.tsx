"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminProtection } from "@/components/custom/RoleProtection"
import { AdminNotifications, AdminStatusIndicator } from "@/components/custom/AdminNotifications"
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics"
import {
  IconCheck,
  IconX,
  IconClock,
  IconMapPin,
  IconPhone,
  IconWorld,
  IconMail,
  IconBuilding,
  IconAlertTriangle,
  IconEye,
  IconRefresh
} from "@tabler/icons-react"
import { toast } from "sonner"

function ModerationQueueSkeleton() {
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
      
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

interface ModerationModalProps {
  listing: {
    _id: string
    name: string
    phone?: string
    website?: string
    email?: string
    address: {
      line1: string
      city: string
      region: string
      postalCode: string
      country: string
    }
    description?: string
  }
  onClose: () => void
  onModerate: (action: "approve" | "reject", notes?: string) => void
}

function ModerationModal({ listing, onClose, onModerate }: ModerationModalProps) {
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleModerate = async (action: "approve" | "reject") => {
    setIsSubmitting(true)
    try {
      await onModerate(action, notes)
      onClose()
    } catch (error) {
      console.error("Moderation failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{listing.name}</CardTitle>
              <CardDescription>Review listing details</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <IconX className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Listing Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Contact Information</h4>
              <div className="space-y-2 text-sm">
                {listing.phone && (
                  <div className="flex items-center gap-2">
                    <IconPhone className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.phone}</span>
                  </div>
                )}
                {listing.website && (
                  <div className="flex items-center gap-2">
                    <IconWorld className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.website}</span>
                  </div>
                )}
                {listing.email && (
                  <div className="flex items-center gap-2">
                    <IconMail className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Address</h4>
              <div className="flex items-start gap-2 text-sm">
                <IconMapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div>{listing.address.line1}</div>
                  <div>{listing.address.city}, {listing.address.region} {listing.address.postalCode}</div>
                  <div>{listing.address.country}</div>
                </div>
              </div>
            </div>

            {listing.description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{listing.description}</p>
              </div>
            )}
          </div>

          {/* Moderation Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Moderation Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about your decision..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => handleModerate("approve")}
              disabled={isSubmitting}
              className="flex-1"
            >
              <IconCheck className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => handleModerate("reject")}
              disabled={isSubmitting}
              variant="destructive"
              className="flex-1"
            >
              <IconX className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ModerationQueuePage() {
  return (
    <AdminProtection>
      <ModerationQueueContent />
    </AdminProtection>
  )
}

function ModerationQueueContent() {
  const [statusFilter, setStatusFilter] = useState<"pending" | "rejected">("pending")
  const [selectedListing, setSelectedListing] = useState<{
    _id: string
    name: string
    phone?: string
    website?: string
    email?: string
    address: {
      line1: string
      city: string
      region: string
      postalCode: string
      country: string
    }
    description?: string
  } | null>(null)
  
  const user = useQuery(api.users.current)
  const moderationQueue = useQuery(api.listings.getModerationQueue, { status: statusFilter })
  const moderateListing = useMutation(api.listings.moderateListing)

  // Get real-time analytics for notifications
  const {
    isRealTimeConnected,
    recentUpdates,
    hasUnreadUpdates,
    markUpdatesAsRead,
    lastUpdated,
  } = useAdminAnalytics()

  if (user === undefined || moderationQueue === undefined) {
    return <ModerationQueueSkeleton />
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <IconAlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">
          You don&apos;t have permission to access the moderation queue.
        </p>
      </div>
    )
  }

  const handleModerate = async (action: "approve" | "reject", notes?: string) => {
    if (!selectedListing) return

    try {
      await moderateListing({
        listingId: selectedListing._id,
        action,
        notes
      })
      
      toast.success(`Listing ${action}d successfully`)
    } catch (error) {
      toast.error(`Failed to ${action} listing`)
      throw error
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Moderation Queue</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <p className="text-muted-foreground">
              Review and approve business listings
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

          <Select value={statusFilter} onValueChange={(value: "pending" | "rejected") => setStatusFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
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

      {/* Queue Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total {statusFilter}</CardDescription>
            <CardTitle className="text-2xl">{moderationQueue.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Listings */}
      <div className="space-y-4">
        {moderationQueue.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <IconCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No {statusFilter} listings</h3>
              <p className="text-muted-foreground">
                {statusFilter === "pending" 
                  ? "All listings have been reviewed" 
                  : "No rejected listings to review"}
              </p>
            </CardContent>
          </Card>
        ) : (
          moderationQueue.map((listing) => (
            <Card key={listing._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <IconBuilding className="h-5 w-5" />
                      {listing.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <IconMapPin className="h-4 w-4" />
                      {listing.address.city}, {listing.address.region}
                    </CardDescription>
                  </div>
                  <Badge variant={statusFilter === "pending" ? "outline" : "destructive"}>
                    <IconClock className="h-3 w-3 mr-1" />
                    {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Submitted {new Date(listing._creationTime).toLocaleDateString()}
                    </p>
                    {listing.description && (
                      <p className="text-sm line-clamp-2">{listing.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedListing(listing)}
                    >
                      <IconEye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Moderation Modal */}
      {selectedListing && (
        <ModerationModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onModerate={handleModerate}
        />
      )}
    </div>
  )
}
