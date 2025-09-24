"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { OwnerProtection } from "@/components/custom/RoleProtection"
import {
  IconArrowLeft,
  IconBuilding,
  IconMapPin,
  IconPhone,
  IconWorld,
  IconMail,
  IconClock,
  IconEdit,
  IconX,
  IconLoader2,
  IconTrash
} from "@tabler/icons-react"
import Link from "next/link"
import { toast } from "sonner"

interface BusinessHours {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6
  open: string
  close: string
  closed: boolean
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
]

export default function EditListingPage({ params }: { params: { id: string } }) {
  return (
    <OwnerProtection>
      <EditListingContent params={params} />
    </OwnerProtection>
  )
}

function EditListingContent({ params }: { params: { id: string } }) {
  const router = useRouter()
  const listingId = params.id as Id<"listings">

  const user = useQuery(api.users.current)
  const listing = useQuery(api.listings.getListing, { listingId, trackView: false })
  const categories = useQuery(api.categories.getCategories)
  const updateListing = useMutation(api.listings.updateListing)
  const archiveListing = useMutation(api.listings.archiveListing)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    website: "",
    email: "",
    address: {
      line1: "",
      city: "",
      region: "",
      postalCode: "",
      country: "US"
    },
    categoryIds: [] as string[],
    hours: [] as BusinessHours[]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load listing data into form when available
  useEffect(() => {
    if (listing) {
      setFormData({
        name: listing.name,
        description: listing.description || "",
        phone: listing.phone || "",
        website: listing.website || "",
        email: listing.email || "",
        address: listing.address,
        categoryIds: listing.categories,
        hours: listing.hours || DAYS_OF_WEEK.map(day => ({
          day: day.value as 0 | 1 | 2 | 3 | 4 | 5 | 6,
          open: "",
          close: "",
          closed: true
        }))
      })
    }
  }, [listing])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Business name is required"
    }

    if (!formData.phone && !formData.website && !formData.email) {
      newErrors.contact = "At least one contact method (phone, website, or email) is required"
    }

    if (!formData.address.line1.trim()) {
      newErrors.addressLine1 = "Street address is required"
    }

    if (!formData.address.city.trim()) {
      newErrors.city = "City is required"
    }

    if (!formData.address.region.trim()) {
      newErrors.region = "State/Region is required"
    }

    if (!formData.address.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required"
    }

    if (formData.categoryIds.length === 0) {
      newErrors.categories = "At least one category is required"
    }

    if (formData.website && !formData.website.startsWith('http')) {
      newErrors.website = "Website must start with http:// or https://"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setIsSubmitting(true)

    try {
      await updateListing({
        listingId,
        name: formData.name,
        description: formData.description || undefined,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        email: formData.email || undefined,
        address: formData.address,
        categoryIds: formData.categoryIds as any[],
        hours: formData.hours.length > 0 ? formData.hours : undefined
      })

      toast.success("Listing updated successfully!")
      router.push("/dashboard/owner/listings")
    } catch (error) {
      console.error("Error updating listing:", error)
      toast.error("Failed to update listing. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this listing? It will no longer be visible to visitors.")) {
      return
    }

    setIsArchiving(true)

    try {
      await archiveListing({ listingId })
      toast.success("Listing archived successfully")
      router.push("/dashboard/owner/listings")
    } catch (error) {
      console.error("Error archiving listing:", error)
      toast.error("Failed to archive listing. Please try again.")
    } finally {
      setIsArchiving(false)
    }
  }

  const updateHours = (dayIndex: number, field: keyof BusinessHours, value: any) => {
    setFormData(prev => ({
      ...prev,
      hours: prev.hours.map((hour, index) => 
        index === dayIndex ? { ...hour, [field]: value } : hour
      )
    }))
  }

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }))
  }

  if (user === undefined || listing === undefined || categories === undefined) {
    return <EditListingSkeleton />
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <IconBuilding className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
        <p className="text-muted-foreground mb-4">
          Please sign in to edit listings.
        </p>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <IconBuilding className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Listing Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The listing you're looking for doesn't exist or you don't have permission to edit it.
        </p>
        <Button asChild>
          <Link href="/dashboard/owner/listings">
            Back to Listings
          </Link>
        </Button>
      </div>
    )
  }

  // Check if user owns this listing
  if (listing.ownerId !== user._id && user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <IconBuilding className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">
          You don't have permission to edit this listing.
        </p>
        <Button asChild>
          <Link href="/dashboard/owner/listings">
            Back to Listings
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/owner/listings">
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back to Listings
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Listing</h1>
            <p className="text-muted-foreground">
              Update your business information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={
            listing.status === "approved" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" :
            listing.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" :
            listing.status === "rejected" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" :
            "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
          }>
            {listing.status}
          </Badge>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleArchive}
            disabled={isArchiving}
          >
            {isArchiving ? (
              <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <IconTrash className="h-4 w-4 mr-2" />
            )}
            Archive
          </Button>
        </div>
      </div>

      {/* Status Message */}
      {listing.status === "rejected" && listing.moderationNotes && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">
                  Listing Rejected
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400">
                  {listing.moderationNotes}
                </p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                  Please address the issues above and resubmit your listing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {listing.status === "pending" && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                  Pending Review
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Your listing is currently being reviewed by our team. Any changes you make will reset the review process.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBuilding className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Update your business details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your business name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your business"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconPhone className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              At least one contact method is required
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.contact && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {errors.contact}
              </p>
            )}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                  className={errors.website ? "border-red-500" : ""}
                />
                {errors.website && <p className="text-sm text-red-500">{errors.website}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@business.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconMapPin className="h-5 w-5" />
              Business Address
            </CardTitle>
            <CardDescription>
              Update your business location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Street Address *</Label>
              <Input
                id="addressLine1"
                value={formData.address.line1}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, line1: e.target.value }
                }))}
                placeholder="123 Main Street"
                className={errors.addressLine1 ? "border-red-500" : ""}
              />
              {errors.addressLine1 && <p className="text-sm text-red-500">{errors.addressLine1}</p>}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.address.city}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, city: e.target.value }
                  }))}
                  placeholder="New York"
                  className={errors.city ? "border-red-500" : ""}
                />
                {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">State/Region *</Label>
                <Input
                  id="region"
                  value={formData.address.region}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, region: e.target.value }
                  }))}
                  placeholder="NY"
                  className={errors.region ? "border-red-500" : ""}
                />
                {errors.region && <p className="text-sm text-red-500">{errors.region}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  value={formData.address.postalCode}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, postalCode: e.target.value }
                  }))}
                  placeholder="10001"
                  className={errors.postalCode ? "border-red-500" : ""}
                />
                {errors.postalCode && <p className="text-sm text-red-500">{errors.postalCode}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Business Categories *</CardTitle>
            <CardDescription>
              Select categories that best describe your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errors.categories && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md mb-4">
                {errors.categories}
              </p>
            )}
            <div className="grid gap-2 md:grid-cols-3">
              {categories.map((category) => (
                <div key={category._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category._id}
                    checked={formData.categoryIds.includes(category._id)}
                    onCheckedChange={() => toggleCategory(category._id)}
                  />
                  <Label htmlFor={category._id} className="text-sm font-normal">
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
            {formData.categoryIds.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Selected categories:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.categoryIds.map(categoryId => {
                    const category = categories.find(c => c._id === categoryId)
                    return category ? (
                      <Badge key={categoryId} variant="secondary">
                        {category.name}
                        <button
                          type="button"
                          onClick={() => toggleCategory(categoryId)}
                          className="ml-1 hover:text-red-500"
                        >
                          <IconX className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconClock className="h-5 w-5" />
              Business Hours
            </CardTitle>
            <CardDescription>
              Update your operating hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.hours.map((hour, index) => {
              const day = DAYS_OF_WEEK.find(d => d.value === hour.day)
              return (
                <div key={hour.day} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">
                    {day?.label}
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={!hour.closed}
                      onCheckedChange={(checked) =>
                        updateHours(index, 'closed', !checked)
                      }
                    />
                    <Label className="text-sm">Open</Label>
                  </div>
                  {!hour.closed && (
                    <>
                      <Input
                        type="time"
                        value={hour.open}
                        onChange={(e) => updateHours(index, 'open', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={hour.close}
                        onChange={(e) => updateHours(index, 'close', e.target.value)}
                        className="w-32"
                      />
                    </>
                  )}
                  {hour.closed && (
                    <span className="text-sm text-muted-foreground">Closed</span>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/owner/listings">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating Listing...
              </>
            ) : (
              <>
                <IconEdit className="h-4 w-4 mr-2" />
                Update Listing
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

function EditListingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-32" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end gap-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}
