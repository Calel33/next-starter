"use client";

import React from 'react';
import { MapPin, Phone, Globe, Clock, Eye, Star, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LazyImage } from '@/components/ui/lazy-image';
import { cn } from '@/lib/utils';
import { SearchResult } from '@/hooks/useBusinessSearch';
import { formatDistance } from '@/hooks/useGeolocation';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useConversionTracking } from '@/hooks/useConversionTracking';

export interface ListingCardProps {
  className?: string;
  listing: SearchResult;
  variant?: 'default' | 'compact' | 'featured';
  showActions?: boolean;
  showDistance?: boolean;
  showStatus?: boolean;
  onEdit?: (listing: SearchResult) => void;
  onDelete?: (listing: SearchResult) => void;
  onClick?: (listing: SearchResult) => void;
}

/**
 * ListingCard component for displaying business listings
 * Supports different variants and interactive actions
 */
export function ListingCard({
  className,
  listing,
  variant = 'default',
  showActions = false,
  showDistance = true,
  showStatus = false,
  onEdit,
  onDelete,
  onClick,
}: ListingCardProps) {
  const { trackListingView, trackContactClick, trackDirectionsClick } = useAnalytics();
  const { trackContactConversion, trackDirectionsConversion } = useConversionTracking();

  // Format business hours for display
  const formatBusinessHours = (hours?: SearchResult['hours']) => {
    if (!hours || hours.length === 0) return 'Hours not available';
    
    const today = new Date().getDay();
    const todayHours = hours.find(h => h.day === today);
    
    if (!todayHours) return 'Hours not available';
    if (todayHours.closed) return 'Closed today';
    
    return `${todayHours.open} - ${todayHours.close}`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Handle contact actions with analytics and conversion tracking
  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing.phone) {
      // Track phone click with conversion tracking
      trackContactClick(listing._id, 'phone', {
        conversionFunnel: 'listing_card_to_phone',
        conversionStep: 'phone_click',
      });
      trackContactConversion(listing._id, 'phone', 'listing_card');
      window.open(`tel:${listing.phone}`, '_self');
    }
  };

  const handleWebsite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing.website) {
      // Track website click with conversion tracking
      trackContactClick(listing._id, 'website', {
        conversionFunnel: 'listing_card_to_website',
        conversionStep: 'website_click',
      });
      trackContactConversion(listing._id, 'website', 'listing_card');
      window.open(listing.website, '_blank');
    }
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Track directions click with conversion tracking
    trackDirectionsClick(listing._id, {
      conversionFunnel: 'listing_card_to_directions',
      conversionStep: 'directions_click',
    });
    trackDirectionsConversion(listing._id, 'listing_card');
    const query = encodeURIComponent(`${listing.name} ${listing.address.line1} ${listing.address.city}`);
    window.open(`https://maps.google.com/maps?q=${query}`, '_blank');
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(listing);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(listing);
    }
  };

  const handleCardClick = () => {
    // Track listing view when card is clicked
    trackListingView(listing._id, {
      conversionFunnel: 'listing_card_view',
      conversionStep: 'card_click',
    });

    if (onClick) {
      onClick(listing);
    }
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          className
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={listing.images[0] ? `/api/images/${listing.images[0]}` : undefined} />
              <AvatarFallback>{listing.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{listing.name}</h4>
              <p className="text-sm text-muted-foreground truncate">
                {listing.address.city}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {showDistance && listing.distance && (
                <Badge variant="secondary" className="text-xs">
                  {formatDistance(listing.distance)}
                </Badge>
              )}
              {showStatus && (
                <Badge className={cn("text-xs", getStatusColor(listing.status))}>
                  {listing.status}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Featured variant
  if (variant === 'featured') {
    return (
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-lg border-primary/20 bg-gradient-to-br from-primary/5 to-transparent",
          className
        )}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={listing.images[0] ? `/api/images/${listing.images[0]}` : undefined} />
                <AvatarFallback>{listing.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{listing.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{listing.address.line1}, {listing.address.city}</span>
                </div>
              </div>
            </div>
            <Badge className="bg-primary text-primary-foreground">Featured</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {listing.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {listing.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className={cn(
                  listing.isOpenNow ? "text-green-600" : "text-muted-foreground"
                )}>
                  {listing.isOpenNow ? "Open" : "Closed"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span>{listing.views}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {listing.phone && (
                <Button variant="outline" size="sm" onClick={handleCall}>
                  <Phone className="h-3 w-3" />
                </Button>
              )}
              {listing.website && (
                <Button variant="outline" size="sm" onClick={handleWebsite}>
                  <Globe className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        className
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={listing.images[0] ? `/api/images/${listing.images[0]}` : undefined} />
                <AvatarFallback>{listing.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{listing.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">
                    {listing.address.line1}, {listing.address.city}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-2">
              {showDistance && listing.distance && (
                <Badge variant="secondary" className="text-xs">
                  {formatDistance(listing.distance)}
                </Badge>
              )}
              {showStatus && (
                <Badge className={cn("text-xs", getStatusColor(listing.status))}>
                  {listing.status}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {listing.description}
            </p>
          )}

          {/* Business info */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className={cn(
                listing.isOpenNow ? "text-green-600" : "text-muted-foreground"
              )}>
                {listing.isOpenNow ? "Open" : "Closed"} • {formatBusinessHours(listing.hours)}
              </span>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>{listing.views}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {listing.phone && (
                <Button variant="outline" size="sm" onClick={handleCall}>
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </Button>
              )}
              
              {listing.website && (
                <Button variant="outline" size="sm" onClick={handleWebsite}>
                  <Globe className="h-3 w-3 mr-1" />
                  Website
                </Button>
              )}

              <Button variant="outline" size="sm" onClick={handleDirections}>
                <MapPin className="h-3 w-3 mr-1" />
                Directions
              </Button>
            </div>

            {showActions && (
              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button variant="ghost" size="sm" onClick={handleEdit}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button variant="ghost" size="sm" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
