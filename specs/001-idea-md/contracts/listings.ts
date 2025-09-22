/**
 * Convex Functions: Listings API
 * 
 * This file defines the Convex function signatures for listing management.
 * All functions use the new Convex function syntax with args and returns validators.
 */

import { v } from "convex/values";

// Shared validators
const locationValidator = v.object({
  lat: v.number(),
  lng: v.number(),
});

const addressValidator = v.object({
  line1: v.string(),
  city: v.string(),
  region: v.string(),
  postalCode: v.string(),
  country: v.string(),
});

const businessHoursValidator = v.array(v.object({
  day: v.union(v.literal(0), v.literal(1), v.literal(2), v.literal(3), v.literal(4), v.literal(5), v.literal(6)),
  open: v.string(),
  close: v.string(),
  closed: v.boolean(),
}));

const listingStatusValidator = v.union(
  v.literal("pending"),
  v.literal("approved"), 
  v.literal("rejected"),
  v.literal("archived")
);

// Full listing object validator
const listingValidator = v.object({
  _id: v.id("listings"),
  _creationTime: v.number(),
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  phone: v.optional(v.string()),
  website: v.optional(v.string()),
  email: v.optional(v.string()),
  address: addressValidator,
  location: locationValidator,
  categories: v.array(v.id("categories")),
  hours: v.optional(businessHoursValidator),
  images: v.array(v.id("imageAssets")),
  ownerId: v.optional(v.id("users")),
  status: listingStatusValidator,
  moderationNotes: v.optional(v.string()),
  moderatedBy: v.optional(v.id("users")),
  moderatedAt: v.optional(v.number()),
  views: v.number(),
  phoneClicks: v.number(),
  websiteClicks: v.number(),
  directionsClicks: v.number(),
  lastUpdatedBy: v.optional(v.id("users")),
  updatedAt: v.number(),
});

// Query Functions

/**
 * Search listings by location and optional filters
 */
export const searchListings = {
  args: {
    // Geographical bounds
    bounds: v.object({
      north: v.number(),
      south: v.number(),
      east: v.number(), 
      west: v.number(),
    }),
    // Optional filters
    query: v.optional(v.string()),
    categoryIds: v.optional(v.array(v.id("categories"))),
    openNow: v.optional(v.boolean()),
    // Pagination
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  returns: v.object({
    listings: v.array(listingValidator),
    total: v.number(),
    hasMore: v.boolean(),
  }),
};

/**
 * Get single listing by ID with view tracking
 */
export const getListing = {
  args: {
    listingId: v.id("listings"),
    trackView: v.optional(v.boolean()),
  },
  returns: v.union(listingValidator, v.null()),
};

/**
 * Get listing by slug for SEO-friendly URLs
 */
export const getListingBySlug = {
  args: {
    slug: v.string(),
    trackView: v.optional(v.boolean()),
  },
  returns: v.union(listingValidator, v.null()),
};

/**
 * Get listings owned by current user
 */
export const getMyListings = {
  args: {
    status: v.optional(listingStatusValidator),
  },
  returns: v.array(listingValidator),
};

/**
 * Get listings for admin moderation queue
 */
export const getModerationQueue = {
  args: {
    status: v.optional(listingStatusValidator),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  returns: v.object({
    listings: v.array(listingValidator),
    total: v.number(),
    hasMore: v.boolean(),
  }),
};

// Mutation Functions

/**
 * Create new listing (owner or admin)
 */
export const createListing = {
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    email: v.optional(v.string()),
    address: addressValidator,
    location: locationValidator,
    categoryIds: v.array(v.id("categories")),
    hours: v.optional(businessHoursValidator),
    imageIds: v.optional(v.array(v.id("imageAssets"))),
  },
  returns: v.id("listings"),
};

/**
 * Update existing listing (owner or admin)
 */
export const updateListing = {
  args: {
    listingId: v.id("listings"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(addressValidator),
    location: v.optional(locationValidator),
    categoryIds: v.optional(v.array(v.id("categories"))),
    hours: v.optional(businessHoursValidator),
    imageIds: v.optional(v.array(v.id("imageAssets"))),
  },
  returns: v.union(v.id("listings"), v.null()),
};

/**
 * Moderate listing (admin only)
 */
export const moderateListing = {
  args: {
    listingId: v.id("listings"),
    action: v.union(v.literal("approve"), v.literal("reject"), v.literal("request_changes")),
    notes: v.optional(v.string()),
  },
  returns: v.boolean(),
};

/**
 * Archive/delete listing (owner or admin)
 */
export const archiveListing = {
  args: {
    listingId: v.id("listings"),
  },
  returns: v.boolean(),
};

/**
 * Track interaction with listing (analytics)
 */
export const trackInteraction = {
  args: {
    listingId: v.id("listings"),
    type: v.union(v.literal("phone"), v.literal("website"), v.literal("directions")),
  },
  returns: v.null(),
};

/**
 * Bulk import listings (admin only)
 */
export const bulkImportListings = {
  args: {
    listings: v.array(v.object({
      name: v.string(),
      description: v.optional(v.string()),
      phone: v.optional(v.string()),
      website: v.optional(v.string()),
      email: v.optional(v.string()),
      address: addressValidator,
      location: locationValidator,
      categoryNames: v.array(v.string()), // Category names, not IDs
      hours: v.optional(businessHoursValidator),
    })),
    dryRun: v.optional(v.boolean()),
  },
  returns: v.object({
    imported: v.number(),
    skipped: v.number(),
    errors: v.array(v.object({
      index: v.number(),
      error: v.string(),
    })),
  }),
};

// Internal Functions (not exposed to client)

/**
 * Generate unique slug from listing name
 */
export const generateSlug = {
  args: {
    name: v.string(),
    listingId: v.optional(v.id("listings")),
  },
  returns: v.string(),
};

/**
 * Check for duplicate listings within radius
 */
export const checkDuplicates = {
  args: {
    name: v.string(),
    location: locationValidator,
    radiusKm: v.optional(v.number()),
    excludeId: v.optional(v.id("listings")),
  },
  returns: v.array(v.object({
    listingId: v.id("listings"),
    name: v.string(),
    distance: v.number(),
  })),
};

/**
 * Update listing analytics counters
 */
export const incrementCounter = {
  args: {
    listingId: v.id("listings"),
    counter: v.union(v.literal("views"), v.literal("phoneClicks"), v.literal("websiteClicks"), v.literal("directionsClicks")),
  },
  returns: v.null(),
};
