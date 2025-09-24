"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { OwnerProtection } from "@/components/custom/RoleProtection"
import { useGeocoding } from "@/hooks/useGeocoding"
import {
  IconArrowLeft,
  IconBuilding,
  IconMapPin,
  IconPhone,
  IconWorld,
  IconMail,
  IconClock,
  IconCamera,
  IconPlus,
  IconX,
  IconLoader2
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

export default function CreateListingPage() {
  return (
    <OwnerProtection>
      <CreateListingContent />
    </OwnerProtection>
  )
}

function CreateListingContent() {
  const router = useRouter()
  const user = useQuery(api.users.current)
  const categories = useQuery(api.categories.getCategories)
  const createListing = useMutation(api.listings.createListing)
  const { geocode } = useGeocoding()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  // Initialize default business hours (9 AM - 5 PM, Monday-Friday)
  const initializeDefaultHours = () => {
    const defaultHours: BusinessHours[] = DAYS_OF_WEEK.map(day => ({
      day: day.value as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      open: day.value >= 1 && day.value <= 5 ? "09:00" : "",
      close: day.value >= 1 && day.value <= 5 ? "17:00" : "",
      closed: day.value === 0 || day.value === 6
    }))
    setFormData(prev => ({ ...prev, hours: defaultHours }))
  }

  // Initialize hours on component mount
  useState(() => {
    initializeDefaultHours()
  })

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
      // Geocode the address to get coordinates
      const fullAddress = `${formData.address.line1}, ${formData.address.city}, ${formData.address.region} ${formData.address.postalCode}, ${formData.address.country}`;

      let location = {
        lat: 40.7128, // Default to NYC
        lng: -74.0060
      };

      try {
        const geocodeResults = await geocode(fullAddress, {
          country: formData.address.country.toLowerCase(),
          limit: 1
        });

        if (geocodeResults.length > 0) {
          const [lng, lat] = geocodeResults[0].center;
          location = { lat, lng };
        }
      } catch (geocodeError) {
        console.warn('Geocoding failed, using default location:', geocodeError);
        // Continue with default location
      }

      const listingId = await createListing({
        name: formData.name,
        description: formData.description || undefined,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        email: formData.email || undefined,
        address: formData.address,
        location,
        categoryIds: formData.categoryIds as any[],
        hours: formData.hours.length > 0 ? formData.hours : undefined
      })

      toast.success("Listing created successfully! It will be reviewed by our team.")
      router.push("/dashboard/owner/listings")
    } catch (error) {
      console.error("Error creating listing:", error)
      toast.error("Failed to create listing. Please try again.")
    } finally {
      setIsSubmitting(false)
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

  if (user === undefined || categories === undefined) {
    return <CreateListingSkeleton />
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <IconBuilding className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
        <p className="text-muted-foreground mb-4">
          Please sign in to create a listing.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/owner">
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Listing</h1>
          <p className="text-muted-foreground">
            Add your business to the directory
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBuilding className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Tell us about your business
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
              Where is your business located?
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
              Set your operating hours (optional)
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
            <Link href="/dashboard/owner">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Listing...
              </>
            ) : (
              <>
                <IconPlus className="h-4 w-4 mr-2" />
                Create Listing
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

function CreateListingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-32" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {Array.from({ length: 4 }).map((_, i) => (
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
