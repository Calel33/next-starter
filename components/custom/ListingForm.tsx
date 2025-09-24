"use client";

import React, { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useIsMobile } from '@/hooks/use-mobile';

// Zod validation schema
const listingFormSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters').max(100, 'Business name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number').optional(),
  website: z.string().url('Please enter a valid website URL').optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  address: z.object({
    line1: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    region: z.string().min(2, 'State/Province is required'),
    postalCode: z.string().min(3, 'Postal code is required'),
    country: z.string().min(2, 'Country is required'),
  }),
  categories: z.array(z.string()).min(1, 'Please select at least one category'),
  hours: z.array(z.object({
    day: z.number().min(0).max(6),
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    closed: z.boolean(),
  })).optional(),
}).refine((data) => {
  // At least one contact method required
  return data.phone || data.website || data.email;
}, {
  message: "At least one contact method (phone, website, or email) is required",
  path: ["phone"],
});

type ListingFormData = z.infer<typeof listingFormSchema>;

export interface ListingFormProps {
  className?: string;
  initialData?: Partial<ListingFormData>;
  onSubmit: (data: ListingFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  // Mobile-specific props
  enableMobileOptimizations?: boolean;
  mobileLayout?: 'stacked' | 'accordion';
  autoFocusFirstField?: boolean;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * ListingForm component with comprehensive Zod validation and mobile optimizations
 * Handles business listing creation and editing with mobile-friendly input patterns
 */
export function ListingForm({
  className,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save Listing',
  // Mobile-specific defaults
  enableMobileOptimizations = true,
  mobileLayout = 'stacked',
  autoFocusFirstField = false,
}: ListingFormProps) {
  const [showHours, setShowHours] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  // Mobile detection and refs
  const isMobile = useIsMobile();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Fetch categories for selection
  const categories = useQuery(api.categories.getCategories, {});

  // Initialize form with default values
  const defaultHours = dayNames.map((_, index) => ({
    day: index,
    open: '09:00',
    close: '17:00',
    closed: index === 0, // Sunday closed by default
  }));

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      name: '',
      description: '',
      phone: '',
      website: '',
      email: '',
      address: {
        line1: '',
        city: '',
        region: '',
        postalCode: '',
        country: 'US',
      },
      categories: [],
      hours: defaultHours,
      ...initialData,
    },
  });

  const handleSubmit = (data: ListingFormData) => {
    onSubmit(data);
  };

  // Mobile-specific form navigation
  const sections = ['basic', 'contact', 'address', 'hours'];
  const sectionTitles = ['Basic Info', 'Contact', 'Address', 'Hours'];

  const nextSection = useCallback(() => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  }, [currentSection, sections.length]);

  const prevSection = useCallback(() => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  }, [currentSection]);

  // Mobile keyboard optimization
  const handleMobileKeyDown = useCallback((e: React.KeyboardEvent, nextFieldRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && isMobile && enableMobileOptimizations) {
      e.preventDefault();
      if (nextFieldRef?.current) {
        nextFieldRef.current.focus();
      }
    }
  }, [isMobile, enableMobileOptimizations]);

  const toggleHours = () => {
    setShowHours(!showHours);
    if (!showHours) {
      form.setValue('hours', defaultHours);
    } else {
      form.setValue('hours', undefined);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Mobile progress indicator */}
      {isMobile && enableMobileOptimizations && mobileLayout === 'accordion' && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex space-x-2">
            {sections.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-3 h-3 rounded-full",
                  index === currentSection ? "bg-primary" :
                  index < currentSection ? "bg-primary/60" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <span className="text-sm font-medium">
            {sectionTitles[currentSection]} ({currentSection + 1}/{sections.length})
          </span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          {(!isMobile || !enableMobileOptimizations || mobileLayout === 'stacked' || currentSection === 0) && (
            <Card>
              <CardHeader>
                <CardTitle className={cn(
                  isMobile && enableMobileOptimizations && "text-lg"
                )}>
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name *</FormLabel>
                      <FormControl>
                        <Input
                          ref={firstFieldRef}
                          placeholder="Enter business name"
                          autoComplete="organization"
                          autoFocus={autoFocusFirstField && !isMobile}
                          className={cn(
                            isMobile && enableMobileOptimizations && "h-12 text-base"
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your business..."
                          className={cn(
                            "min-h-[100px]",
                            isMobile && enableMobileOptimizations && "min-h-[80px] text-base"
                          )}
                          autoComplete="off"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories *</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value[0] || ''}
                        onValueChange={(value) => field.onChange([value])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          {(!isMobile || !enableMobileOptimizations || mobileLayout === 'stacked' || currentSection === 1) && (
            <Card>
              <CardHeader>
                <CardTitle className={cn(
                  isMobile && enableMobileOptimizations && "text-lg"
                )}>
                  Contact Information
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  At least one contact method is required
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1-555-123-4567"
                          autoComplete="tel"
                          inputMode="tel"
                          className={cn(
                            isMobile && enableMobileOptimizations && "h-12 text-base"
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com"
                          autoComplete="url"
                          inputMode="url"
                          className={cn(
                            isMobile && enableMobileOptimizations && "h-12 text-base"
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contact@business.com"
                          autoComplete="email"
                          inputMode="email"
                          className={cn(
                            isMobile && enableMobileOptimizations && "h-12 text-base"
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address.line1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address *</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province *</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="GB">United Kingdom</SelectItem>
                            <SelectItem value="AU">Australia</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-hours"
                  checked={showHours}
                  onCheckedChange={toggleHours}
                />
                <Label htmlFor="show-hours">Set business hours</Label>
              </div>
            </CardHeader>
            {showHours && (
              <CardContent className="space-y-4">
                {dayNames.map((day, index) => (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-20 text-sm font-medium">{day}</div>
                    
                    <FormField
                      control={form.control}
                      name={`hours.${index}.closed`}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <Label className="text-sm">Closed</Label>
                        </div>
                      )}
                    />

                    {!form.watch(`hours.${index}.closed`) && (
                      <>
                        <FormField
                          control={form.control}
                          name={`hours.${index}.open`}
                          render={({ field }) => (
                            <Input
                              type="time"
                              className="w-32"
                              {...field}
                            />
                          )}
                        />
                        <span className="text-sm text-muted-foreground">to</span>
                        <FormField
                          control={form.control}
                          name={`hours.${index}.close`}
                          render={({ field }) => (
                            <Input
                              type="time"
                              className="w-32"
                              {...field}
                            />
                          )}
                        />
                      </>
                    )}
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Mobile navigation buttons */}
          {isMobile && enableMobileOptimizations && mobileLayout === 'accordion' && (
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <Button
                type="button"
                variant="outline"
                onClick={prevSection}
                disabled={currentSection === 0}
                className="flex items-center gap-2"
              >
                ← Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                {currentSection + 1} of {sections.length}
              </span>

              {currentSection < sections.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextSection}
                  className="flex items-center gap-2"
                >
                  Next →
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : submitLabel}
                </Button>
              )}
            </div>
          )}

          {/* Form Actions */}
          {(!isMobile || !enableMobileOptimizations || mobileLayout === 'stacked') && (
            <div className="flex items-center justify-end gap-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : submitLabel}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
