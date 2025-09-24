"use client";

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { notFound } from 'next/navigation';
import { MapboxMap, type MapMarker } from '@/components/custom/MapboxMap';
import { ImageUpload } from '@/components/custom/ImageUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Phone, 
  Globe, 
  Mail, 
  Clock, 
  Star, 
  Share2, 
  Heart,
  Directions,
  Camera,
  ChevronLeft,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { LazyImage } from '@/components/ui/lazy-image';

interface ListingDetailPageProps {
  params: {
    slug: string;
  };
}

/**
 * Listing Detail Page
 * Displays comprehensive information about a specific business listing
 */
export default function ListingDetailPage({ params }: ListingDetailPageProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAllHours, setShowAllHours] = useState(false);

  // Fetch listing by slug
  const listing = useQuery(api.listings.getListingBySlug, { slug: params.slug });

  // Fetch categories for this listing
  const categories = useQuery(api.categories.getCategories);

  // Handle loading state
  if (listing === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle not found
  if (listing === null) {
    notFound();
  }

  // Get category names
  const listingCategories = categories?.filter(cat => 
    listing.categories.includes(cat._id)
  ) || [];

  // Create map marker for this listing
  const mapMarker: MapMarker = {
    id: listing._id,
    lng: listing.location.lng,
    lat: listing.location.lat,
    data: listing,
  };

  // Format business hours
  const formatHours = (hours: typeof listing.hours) => {
    if (!hours) return null;
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return hours.map(hour => ({
      day: dayNames[hour.day],
      time: hour.closed ? 'Closed' : `${hour.open} - ${hour.close}`,
      closed: hour.closed,
    }));
  };

  const formattedHours = formatHours(listing.hours);
  const currentDay = new Date().getDay();
  const todayHours = formattedHours?.[currentDay];

  // Get directions URL
  const getDirectionsUrl = () => {
    const address = `${listing.address.line1}, ${listing.address.city}, ${listing.address.region} ${listing.address.postalCode}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/directory">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Directory
              </Link>
            </Button>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <Card>
              <CardContent className="p-0">
                {listing.images && listing.images.length > 0 ? (
                  <div className="relative">
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <LazyImage
                        src={`/api/images/${listing.images[selectedImageIndex]}`}
                        alt={listing.name}
                        fill
                        className="object-cover"
                        priority={selectedImageIndex === 0}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                      />
                    </div>
                    {listing.images.length > 1 && (
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex gap-2 overflow-x-auto">
                          {listing.images.map((imageId, index) => (
                            <button
                              key={imageId}
                              onClick={() => setSelectedImageIndex(index)}
                              className={cn(
                                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors",
                                index === selectedImageIndex
                                  ? "border-primary"
                                  : "border-white/50 hover:border-white"
                              )}
                            >
                              <LazyImage
                                src={`/api/images/${imageId}`}
                                alt={`${listing.name} ${index + 1}`}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                                enableProgressiveLoading={false}
                                rootMargin="100px"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                    <Camera className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground">{listing.name}</h1>
                      {listingCategories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {listingCategories.map((category) => (
                            <Badge key={category._id} variant="secondary">
                              {category.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {listing.description && (
                      <p className="text-muted-foreground leading-relaxed">
                        {listing.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-muted-foreground">
                      {listing.address.line1}<br />
                      {listing.address.city}, {listing.address.region} {listing.address.postalCode}<br />
                      {listing.address.country}
                    </p>
                    <Button variant="link" className="p-0 h-auto mt-2" asChild>
                      <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer">
                        <Directions className="h-4 w-4 mr-2" />
                        Get Directions
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                </div>

                {listing.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a 
                        href={`tel:${listing.phone}`}
                        className="text-primary hover:underline"
                      >
                        {listing.phone}
                      </a>
                    </div>
                  </div>
                )}

                {listing.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a 
                        href={listing.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {listing.website.replace(/^https?:\/\//, '')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}

                {listing.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a 
                        href={`mailto:${listing.email}`}
                        className="text-primary hover:underline"
                      >
                        {listing.email}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Business Hours */}
            {formattedHours && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Business Hours
                    {todayHours && (
                      <Badge variant={todayHours.closed ? "destructive" : "default"}>
                        {todayHours.closed ? "Closed Today" : "Open Today"}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {formattedHours.slice(0, showAllHours ? undefined : 3).map((hour, index) => (
                      <div 
                        key={index}
                        className={cn(
                          "flex justify-between items-center py-1",
                          index === currentDay && "font-semibold text-primary"
                        )}
                      >
                        <span>{hour.day}</span>
                        <span className={cn(
                          hour.closed && "text-muted-foreground"
                        )}>
                          {hour.time}
                        </span>
                      </div>
                    ))}
                    {formattedHours.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllHours(!showAllHours)}
                        className="w-full mt-2"
                      >
                        {showAllHours ? "Show Less" : "Show All Hours"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <MapboxMap
                  markers={[mapMarker]}
                  height="300px"
                  className="rounded-b-lg overflow-hidden"
                  config={{
                    center: [listing.location.lng, listing.location.lat],
                    zoom: 15,
                  }}
                />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {listing.phone && (
                  <Button className="w-full" asChild>
                    <a href={`tel:${listing.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                )}
                
                <Button variant="outline" className="w-full" asChild>
                  <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer">
                    <Directions className="h-4 w-4 mr-2" />
                    Get Directions
                  </a>
                </Button>

                {listing.website && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={listing.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Related Listings */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Businesses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  More businesses like this coming soon...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
