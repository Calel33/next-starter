/**
 * Convex Functions: Listings API
 * 
 * Core functions for managing business listings including queries, mutations,
 * and utility functions for the business directory.
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

// Validators
const addressValidator = v.object({
  line1: v.string(),
  city: v.string(),
  region: v.string(),
  postalCode: v.string(),
  country: v.string(),
});

const locationValidator = v.object({
  lat: v.number(),
  lng: v.number(),
});

const businessHoursValidator = v.array(v.object({
  day: v.union(v.literal(0), v.literal(1), v.literal(2), v.literal(3), v.literal(4), v.literal(5), v.literal(6)),
  open: v.string(),
  close: v.string(),
  closed: v.boolean(),
}));

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
  status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("archived")),
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

// Queries

/**
 * Search listings with filters and location bounds
 */
export const searchListings = query({
  args: {
    query: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    bounds: v.optional(v.object({
      north: v.number(),
      south: v.number(),
      east: v.number(),
      west: v.number(),
    })),
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("archived"))),
    limit: v.optional(v.number()),
  },
  returns: v.array(listingValidator),
  handler: async (ctx, args) => {
    // Filter by status (default to approved for public searches)
    const status = args.status || "approved";
    let query = ctx.db.query("listings").withIndex("byStatus", (q) => q.eq("status", status));
    
    let results = await query.collect();
    
    // Apply text search filter
    if (args.query) {
      const searchTerm = args.query.toLowerCase();
      results = results.filter(listing => 
        listing.name.toLowerCase().includes(searchTerm) ||
        listing.description?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply category filter
    if (args.categoryId) {
      results = results.filter(listing =>
        listing.categories.includes(args.categoryId!)
      );
    }
    
    // Apply location bounds filter
    if (args.bounds) {
      results = results.filter(listing => 
        listing.location.lat >= args.bounds!.south &&
        listing.location.lat <= args.bounds!.north &&
        listing.location.lng >= args.bounds!.west &&
        listing.location.lng <= args.bounds!.east
      );
    }
    
    // Apply limit
    if (args.limit) {
      results = results.slice(0, args.limit);
    }
    
    return results;
  },
});

/**
 * Get a single listing by ID
 */
export const getListing = query({
  args: { listingId: v.id("listings") },
  returns: v.union(listingValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.listingId);
  },
});

/**
 * Get a listing by slug
 */
export const getListingBySlug = query({
  args: { slug: v.string() },
  returns: v.union(listingValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("listings")
      .withIndex("bySlug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

/**
 * Get listings owned by current user
 */
export const getMyListings = query({
  args: {},
  returns: v.array(listingValidator),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }
    
    return await ctx.db
      .query("listings")
      .withIndex("byOwner", (q) => q.eq("ownerId", user._id))
      .collect();
  },
});

/**
 * Get moderation queue (admin only)
 */
export const getModerationQueue = query({
  args: { status: v.optional(v.union(v.literal("pending"), v.literal("rejected"))) },
  returns: v.array(listingValidator),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    
    const status = args.status || "pending";
    return await ctx.db
      .query("listings")
      .withIndex("byStatus", (q) => q.eq("status", status))
      .collect();
  },
});

// Mutations

/**
 * Create a new listing
 */
export const createListing = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    email: v.optional(v.string()),
    address: addressValidator,
    location: locationValidator,
    categories: v.array(v.id("categories")),
    hours: v.optional(businessHoursValidator),
  },
  returns: v.id("listings"),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Authentication required");
    }
    
    // Generate slug from name
    const slug = generateSlug(args.name);
    
    // Check for duplicate slug
    const existing = await ctx.db
      .query("listings")
      .withIndex("bySlug", (q) => q.eq("slug", slug))
      .unique();
    
    if (existing) {
      throw new Error("A listing with this name already exists");
    }
    
    const now = Date.now();
    
    return await ctx.db.insert("listings", {
      name: args.name,
      slug,
      description: args.description,
      phone: args.phone,
      website: args.website,
      email: args.email,
      address: args.address,
      location: args.location,
      categories: args.categories,
      hours: args.hours,
      images: [],
      ownerId: user._id,
      status: "pending",
      views: 0,
      phoneClicks: 0,
      websiteClicks: 0,
      directionsClicks: 0,
      lastUpdatedBy: user._id,
      updatedAt: now,
    });
  },
});

/**
 * Update an existing listing
 */
export const updateListing = mutation({
  args: {
    listingId: v.id("listings"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(addressValidator),
    location: v.optional(locationValidator),
    categories: v.optional(v.array(v.id("categories"))),
    hours: v.optional(businessHoursValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Authentication required");
    }
    
    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }
    
    // Check ownership or admin rights
    if (listing.ownerId !== user._id && user.role !== "admin") {
      throw new Error("Unauthorized: You can only edit your own listings");
    }
    
    const updates: any = {
      lastUpdatedBy: user._id,
      updatedAt: Date.now(),
    };
    
    // Add provided updates
    if (args.name !== undefined) {
      updates.name = args.name;
      updates.slug = generateSlug(args.name);
    }
    if (args.description !== undefined) updates.description = args.description;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.website !== undefined) updates.website = args.website;
    if (args.email !== undefined) updates.email = args.email;
    if (args.address !== undefined) updates.address = args.address;
    if (args.location !== undefined) updates.location = args.location;
    if (args.categories !== undefined) updates.categories = args.categories;
    if (args.hours !== undefined) updates.hours = args.hours;
    
    await ctx.db.patch(args.listingId, updates);
    return null;
  },
});

/**
 * Moderate a listing (admin only)
 */
export const moderateListing = mutation({
  args: {
    listingId: v.id("listings"),
    action: v.union(v.literal("approve"), v.literal("reject"), v.literal("archive")),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    const now = Date.now();
    const updates: any = {
      moderatedBy: user._id,
      moderatedAt: now,
      lastUpdatedBy: user._id,
      updatedAt: now,
    };

    if (args.action === "approve") {
      updates.status = "approved";
    } else if (args.action === "reject") {
      updates.status = "rejected";
    } else if (args.action === "archive") {
      updates.status = "archived";
    }

    if (args.notes) {
      updates.moderationNotes = args.notes;
    }

    await ctx.db.patch(args.listingId, updates);
    return null;
  },
});

/**
 * Track user interaction with listing
 */
export const trackInteraction = mutation({
  args: {
    listingId: v.id("listings"),
    type: v.union(v.literal("view"), v.literal("phone"), v.literal("website"), v.literal("directions")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    switch (args.type) {
      case "view":
        updates.views = listing.views + 1;
        break;
      case "phone":
        updates.phoneClicks = listing.phoneClicks + 1;
        break;
      case "website":
        updates.websiteClicks = listing.websiteClicks + 1;
        break;
      case "directions":
        updates.directionsClicks = listing.directionsClicks + 1;
        break;
    }

    await ctx.db.patch(args.listingId, updates);
    return null;
  },
});

/**
 * Archive a listing (admin only)
 */
export const archiveListing = mutation({
  args: {
    listingId: v.id("listings"),
    reason: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    const now = Date.now();
    await ctx.db.patch(args.listingId, {
      status: "archived",
      moderatedBy: user._id,
      moderatedAt: now,
      moderationNotes: args.reason,
      lastUpdatedBy: user._id,
      updatedAt: now,
    });

    return null;
  },
});

/**
 * Check for duplicate listings by name and location
 */
export const checkDuplicates = query({
  args: {
    name: v.string(),
    location: locationValidator,
    excludeId: v.optional(v.id("listings")),
  },
  returns: v.array(listingValidator),
  handler: async (ctx, args) => {
    const listings = await ctx.db.query("listings").collect();

    const duplicates = listings.filter(listing => {
      // Skip the listing we're excluding (for updates)
      if (args.excludeId && listing._id === args.excludeId) {
        return false;
      }

      // Check name similarity (case insensitive)
      const nameSimilar = listing.name.toLowerCase() === args.name.toLowerCase();

      // Check location proximity (within ~100 meters)
      const latDiff = Math.abs(listing.location.lat - args.location.lat);
      const lngDiff = Math.abs(listing.location.lng - args.location.lng);
      const locationClose = latDiff < 0.001 && lngDiff < 0.001; // ~100m

      return nameSimilar && locationClose;
    });

    return duplicates;
  },
});

/**
 * Increment counter for listing metrics
 */
export const incrementCounter = mutation({
  args: {
    listingId: v.id("listings"),
    counter: v.union(v.literal("views"), v.literal("phoneClicks"), v.literal("websiteClicks"), v.literal("directionsClicks")),
    amount: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    const increment = args.amount || 1;
    const updates: any = {
      updatedAt: Date.now(),
    };

    updates[args.counter] = listing[args.counter] + increment;

    await ctx.db.patch(args.listingId, updates);
    return null;
  },
});

/**
 * Bulk import listings (admin only)
 */
export const bulkImportListings = mutation({
  args: {
    listings: v.array(v.object({
      name: v.string(),
      description: v.optional(v.string()),
      phone: v.optional(v.string()),
      website: v.optional(v.string()),
      email: v.optional(v.string()),
      address: addressValidator,
      location: locationValidator,
      categories: v.array(v.id("categories")),
      hours: v.optional(businessHoursValidator),
    })),
    skipDuplicates: v.optional(v.boolean()),
  },
  returns: v.object({
    imported: v.number(),
    skipped: v.number(),
    errors: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    const now = Date.now();

    for (const listingData of args.listings) {
      try {
        // Generate slug
        const slug = generateSlug(listingData.name);

        // Check for duplicates if requested
        if (args.skipDuplicates) {
          const existing = await ctx.db
            .query("listings")
            .withIndex("bySlug", (q) => q.eq("slug", slug))
            .unique();

          if (existing) {
            skipped++;
            continue;
          }
        }

        // Create listing
        await ctx.db.insert("listings", {
          name: listingData.name,
          slug,
          description: listingData.description,
          phone: listingData.phone,
          website: listingData.website,
          email: listingData.email,
          address: listingData.address,
          location: listingData.location,
          categories: listingData.categories,
          hours: listingData.hours,
          images: [],
          ownerId: undefined, // Bulk imports don't have owners initially
          status: "pending",
          views: 0,
          phoneClicks: 0,
          websiteClicks: 0,
          directionsClicks: 0,
          lastUpdatedBy: user._id,
          updatedAt: now,
        });

        imported++;
      } catch (error) {
        errors.push(`Failed to import "${listingData.name}": ${error}`);
      }
    }

    return { imported, skipped, errors };
  },
});

// Utility function to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
