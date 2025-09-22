/**
 * Convex Functions: Image Assets API
 * 
 * This file defines the Convex function signatures for image management.
 * All functions use the new Convex function syntax with args and returns validators.
 */

import { v } from "convex/values";

// Image asset validator
const imageAssetValidator = v.object({
  _id: v.id("imageAssets"),
  _creationTime: v.number(),
  storageId: v.id("_storage"),
  filename: v.string(),
  contentType: v.string(),
  size: v.number(),
  width: v.number(),
  height: v.number(),
  altText: v.optional(v.string()),
  variants: v.object({
    thumbnail: v.id("_storage"),
    medium: v.id("_storage"),
    full: v.id("_storage"),
  }),
  uploadedBy: v.id("users"),
  listingId: v.optional(v.id("listings")),
  isActive: v.boolean(),
  moderationStatus: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
});

// Query Functions

/**
 * Get image by ID with URL generation
 */
export const getImage = {
  args: {
    imageId: v.id("imageAssets"),
    variant: v.optional(v.union(v.literal("thumbnail"), v.literal("medium"), v.literal("full"))),
  },
  returns: v.union(v.object({
    image: imageAssetValidator,
    url: v.string(),
  }), v.null()),
};

/**
 * Get images for a listing
 */
export const getListingImages = {
  args: {
    listingId: v.id("listings"),
    variant: v.optional(v.union(v.literal("thumbnail"), v.literal("medium"), v.literal("full"))),
  },
  returns: v.array(v.object({
    image: imageAssetValidator,
    url: v.string(),
  })),
};

/**
 * Get images uploaded by user
 */
export const getUserImages = {
  args: {
    userId: v.optional(v.id("users")), // Optional - defaults to current user
    includeInactive: v.optional(v.boolean()),
  },
  returns: v.array(v.object({
    image: imageAssetValidator,
    url: v.string(),
  })),
};

/**
 * Get images pending moderation (admin only)
 */
export const getImageModerationQueue = {
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  returns: v.object({
    images: v.array(v.object({
      image: imageAssetValidator,
      url: v.string(),
    })),
    total: v.number(),
    hasMore: v.boolean(),
  }),
};

// Mutation Functions

/**
 * Generate upload URL for new image
 */
export const generateUploadUrl = {
  args: {},
  returns: v.string(),
};

/**
 * Create image asset record after upload
 */
export const createImageAsset = {
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    contentType: v.string(),
    size: v.number(),
    width: v.number(),
    height: v.number(),
    altText: v.optional(v.string()),
    listingId: v.optional(v.id("listings")),
  },
  returns: v.id("imageAssets"),
};

/**
 * Update image metadata
 */
export const updateImageAsset = {
  args: {
    imageId: v.id("imageAssets"),
    altText: v.optional(v.string()),
    listingId: v.optional(v.id("listings")),
  },
  returns: v.boolean(),
};

/**
 * Moderate image (admin only)
 */
export const moderateImage = {
  args: {
    imageId: v.id("imageAssets"),
    action: v.union(v.literal("approve"), v.literal("reject")),
    reason: v.optional(v.string()),
  },
  returns: v.boolean(),
};

/**
 * Delete image (soft delete - mark inactive)
 */
export const deleteImage = {
  args: {
    imageId: v.id("imageAssets"),
  },
  returns: v.boolean(),
};

/**
 * Reorder images for a listing
 */
export const reorderListingImages = {
  args: {
    listingId: v.id("listings"),
    imageIds: v.array(v.id("imageAssets")),
  },
  returns: v.boolean(),
};

// Internal Functions

/**
 * Process uploaded image - create variants
 */
export const processUploadedImage = {
  args: {
    storageId: v.id("_storage"),
  },
  returns: v.object({
    variants: v.object({
      thumbnail: v.id("_storage"),
      medium: v.id("_storage"),
      full: v.id("_storage"),
    }),
    metadata: v.object({
      width: v.number(),
      height: v.number(),
      size: v.number(),
    }),
  }),
};

/**
 * Clean up orphaned images (not associated with any listing)
 */
export const cleanupOrphanedImages = {
  args: {
    olderThanDays: v.optional(v.number()),
  },
  returns: v.object({
    deletedCount: v.number(),
    freedBytes: v.number(),
  }),
};

/**
 * Get image upload quota for user
 */
export const getUploadQuota = {
  args: {
    userId: v.optional(v.id("users")),
  },
  returns: v.object({
    used: v.number(),
    limit: v.number(),
    remaining: v.number(),
  }),
};
