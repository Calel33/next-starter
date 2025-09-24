"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Globe, Clock, Eye, Share2, Heart, Calendar, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LazyImage } from '@/components/ui/lazy-image';
import { cn } from '@/lib/utils';
import { SearchResult } from '@/hooks/useBusinessSearch';
import { formatDistance } from '@/hooks/useGeolocation';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useConversionTracking } from '@/hooks/useConversionTracking';

export interface ListingDetailProps {
  className?: string;
  listing: SearchResult;
  showBackButton?: boolean;
  onBack?: () => void;
  onShare?: (listing: SearchResult) => void;
  onFavorite?: (listing: SearchResult) => void;
  isFavorited?: boolean;
}

/**
 * ListingDetail component for displaying comprehensive business information
 * Includes image gallery, contact info, hours, and actions
 */
export function ListingDetail({
  className,
  listing,
  showBackButton = false,
  onBack,
  onShare,
  onFavorite,
  isFavorited = false,
}: ListingDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { trackListingView, trackContactClick, trackDirectionsClick } = useAnalytics();
  const { trackContactConversion, trackDirectionsConversion } = useConversionTracking();

  // Track listing view when component mounts
  useEffect(() => {
    trackListingView(listing._id, {
      conversionFunnel: 'listing_detail_view',
      conversionStep: 'detail_page_view',
    });
  }, [listing._id, trackListingView]);

  // Format business hours for display
  const formatBusinessHours = () => {
    if (!listing.hours || listing.hours.length === 0) {
      return [{ day: 'Hours', time: 'Not available' }];
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return listing.hours.map(hour => ({
      day: dayNames[hour.day],
      time: hour.closed ? 'Closed' : `${hour.open} - ${hour.close}`,
      isToday: hour.day === new Date().getDay(),
      isClosed: hour.closed,
    }));
  };

  // Handle contact actions with analytics and conversion tracking
  const handleCall = () => {
    if (listing.phone) {
      // Track phone click with conversion tracking
      trackContactClick(listing._id, 'phone', {
        conversionFunnel: 'listing_detail_to_phone',
        conversionStep: 'phone_click',
      });
      trackContactConversion(listing._id, 'phone', 'listing_detail');
      window.open(`tel:${listing.phone}`, '_self');
    }
  };

  const handleWebsite = () => {
    if (listing.website) {
      // Track website click with conversion tracking
      trackContactClick(listing._id, 'website', {
        conversionFunnel: 'listing_detail_to_website',
        conversionStep: 'website_click',
      });
      trackContactConversion(listing._id, 'website', 'listing_detail');
      window.open(listing.website, '_blank');
    }
  };

  const handleDirections = () => {
    // Track directions click with conversion tracking
    trackDirectionsClick(listing._id, {
      conversionFunnel: 'listing_detail_to_directions',
      conversionStep: 'directions_click',
    });
    trackDirectionsConversion(listing._id, 'listing_detail');
    const query = encodeURIComponent(`${listing.name} ${listing.address.line1} ${listing.address.city}`);
    window.open(`https://maps.google.com/maps?q=${query}`, '_blank');
  };

  const handleShare = () => {
    if (onShare) {
      onShare(listing);
    } else {
      // Default share behavior
      if (navigator.share) {
        navigator.share({
          title: listing.name,
          text: listing.description || `Check out ${listing.name}`,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    }
  };

  const handleFavorite = () => {
    if (onFavorite) {
      onFavorite(listing);
    }
  };

  // Image navigation
  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const businessHours = formatBusinessHours();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          {showBackButton && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{listing.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span>{listing.address.line1}, {listing.address.city}, {listing.address.region} {listing.address.postalCode}</span>
            </div>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className={cn(
                  "font-medium",
                  listing.isOpenNow ? "text-green-600" : "text-red-600"
                )}>
                  {listing.isOpenNow ? "Open now" : "Closed"}
                </span>
              </div>
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{listing.views} views</span>
              </div>
              
              {listing.distance && (
                <Badge variant="secondary">
                  {formatDistance(listing.distance)} away
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button 
            variant={isFavorited ? "default" : "outline"} 
            size="sm" 
            onClick={handleFavorite}
          >
            <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
          </Button>
        </div>
      </div>

      {/* Image Gallery */}
      {listing.images.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <LazyImage
                src={`/api/images/${listing.images[currentImageIndex]}`}
                alt={`${listing.name} - Image ${currentImageIndex + 1}`}
                fill
                className="object-cover"
                priority={currentImageIndex === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {listing.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                    <Badge variant="secondary" className="text-xs">
                      {currentImageIndex + 1} / {listing.images.length}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {listing.description && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {listing.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Contact Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {listing.phone && (
              <Button onClick={handleCall} className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Call
              </Button>
            )}
            
            {listing.website && (
              <Button variant="outline" onClick={handleWebsite} className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website
              </Button>
            )}
            
            <Button variant="outline" onClick={handleDirections} className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Directions
            </Button>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            {listing.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{listing.phone}</span>
              </div>
            )}
            
            {listing.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={listing.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {listing.website}
                </a>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                {listing.address.line1}, {listing.address.city}, {listing.address.region} {listing.address.postalCode}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {businessHours.map((hour, index) => (
              <div 
                key={index}
                className={cn(
                  "flex items-center justify-between py-1",
                  hour.isToday && "font-medium"
                )}
              >
                <span className={cn(
                  hour.isToday && "text-primary"
                )}>
                  {hour.day}
                </span>
                <span className={cn(
                  hour.isClosed ? "text-muted-foreground" : "text-foreground",
                  hour.isToday && !hour.isClosed && "text-primary"
                )}>
                  {hour.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
