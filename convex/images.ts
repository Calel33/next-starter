/**
 * Convex Functions: Images API
 * 
 * Functions for managing image assets including upload, moderation,
 * and variant generation for business listings.
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

// Validators
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

// Queries

/**
 * Get images for a specific listing
 */
export const getListingImages = query({
  args: { 
    listingId: v.id("listings"),
    includeInactive: v.optional(v.boolean()),
  },
  returns: v.array(imageAssetValidator),
  handler: async (ctx, args) => {
    let images = await ctx.db
      .query("imageAssets")
      .withIndex("byListing", (q) => q.eq("listingId", args.listingId))
      .collect();
    
    // Filter by active status unless explicitly including inactive
    if (!args.includeInactive) {
      images = images.filter(image => image.isActive && image.moderationStatus === "approved");
    }
    
    return images;
  },
});

/**
 * Get image by ID
 */
export const getImage = query({
  args: { imageId: v.id("imageAssets") },
  returns: v.union(imageAssetValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.imageId);
  },
});

/**
 * Get images uploaded by current user
 */
export const getMyImages = query({
  args: { listingId: v.optional(v.id("listings")) },
  returns: v.array(imageAssetValidator),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }
    
    let query = ctx.db
      .query("imageAssets")
      .withIndex("byUploader", (q) => q.eq("uploadedBy", user._id));
    
    let images = await query.collect();
    
    // Filter by listing if specified
    if (args.listingId) {
      images = images.filter(image => image.listingId === args.listingId);
    }
    
    return images;
  },
});

/**
 * Get images pending moderation (admin only)
 */
export const getModerationQueue = query({
  args: { status: v.optional(v.union(v.literal("pending"), v.literal("rejected"))) },
  returns: v.array(imageAssetValidator),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    
    const status = args.status || "pending";
    return await ctx.db
      .query("imageAssets")
      .withIndex("byModerationStatus", (q) => q.eq("moderationStatus", status))
      .collect();
  },
});

// Mutations

/**
 * Create image asset record after upload
 */
export const createImageAsset = mutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    contentType: v.string(),
    size: v.number(),
    width: v.number(),
    height: v.number(),
    altText: v.optional(v.string()),
    listingId: v.optional(v.id("listings")),
    variants: v.object({
      thumbnail: v.id("_storage"),
      medium: v.id("_storage"),
      full: v.id("_storage"),
    }),
  },
  returns: v.id("imageAssets"),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Authentication required");
    }
    
    // If listing is specified, verify ownership or admin rights
    if (args.listingId) {
      const listing = await ctx.db.get(args.listingId);
      if (!listing) {
        throw new Error("Listing not found");
      }
      
      if (listing.ownerId !== user._id && user.role !== "admin") {
        throw new Error("Unauthorized: You can only upload images to your own listings");
      }
    }
    
    return await ctx.db.insert("imageAssets", {
      storageId: args.storageId,
      filename: args.filename,
      contentType: args.contentType,
      size: args.size,
      width: args.width,
      height: args.height,
      altText: args.altText,
      variants: args.variants,
      uploadedBy: user._id,
      listingId: args.listingId,
      isActive: true,
      moderationStatus: "pending",
    });
  },
});

/**
 * Update image metadata
 */
export const updateImage = mutation({
  args: {
    imageId: v.id("imageAssets"),
    altText: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Authentication required");
    }
    
    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new Error("Image not found");
    }
    
    // Check ownership or admin rights
    if (image.uploadedBy !== user._id && user.role !== "admin") {
      throw new Error("Unauthorized: You can only edit your own images");
    }
    
    const updates: any = {};
    
    if (args.altText !== undefined) updates.altText = args.altText;
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    
    await ctx.db.patch(args.imageId, updates);
    return null;
  },
});

/**
 * Moderate an image (admin only)
 */
export const moderateImage = mutation({
  args: {
    imageId: v.id("imageAssets"),
    action: v.union(v.literal("approve"), v.literal("reject")),
    reason: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    
    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new Error("Image not found");
    }
    
    const updates: any = {
      moderationStatus: args.action === "approve" ? "approved" : "rejected",
    };
    
    await ctx.db.patch(args.imageId, updates);
    return null;
  },
});

/**
 * Delete an image
 */
export const deleteImage = mutation({
  args: { imageId: v.id("imageAssets") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Authentication required");
    }
    
    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new Error("Image not found");
    }
    
    // Check ownership or admin rights
    if (image.uploadedBy !== user._id && user.role !== "admin") {
      throw new Error("Unauthorized: You can only delete your own images");
    }
    
    // Remove from listing if associated
    if (image.listingId) {
      const listing = await ctx.db.get(image.listingId);
      if (listing) {
        const updatedImages = listing.images.filter(id => id !== args.imageId);
        await ctx.db.patch(image.listingId, { images: updatedImages });
      }
    }
    
    await ctx.db.delete(args.imageId);
    return null;
  },
});

/**
 * Associate image with listing
 */
export const addImageToListing = mutation({
  args: {
    imageId: v.id("imageAssets"),
    listingId: v.id("listings"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Authentication required");
    }

    const [image, listing] = await Promise.all([
      ctx.db.get(args.imageId),
      ctx.db.get(args.listingId),
    ]);

    if (!image) throw new Error("Image not found");
    if (!listing) throw new Error("Listing not found");

    // Check ownership or admin rights
    if (listing.ownerId !== user._id && user.role !== "admin") {
      throw new Error("Unauthorized: You can only add images to your own listings");
    }

    if (image.uploadedBy !== user._id && user.role !== "admin") {
      throw new Error("Unauthorized: You can only use your own images");
    }

    // Update image with listing association
    await ctx.db.patch(args.imageId, { listingId: args.listingId });

    // Add image to listing's images array if not already present
    if (!listing.images.includes(args.imageId)) {
      await ctx.db.patch(args.listingId, {
        images: [...listing.images, args.imageId],
      });
    }

    return null;
  },
});

/**
 * Process uploaded image (generate variants)
 */
export const processUploadedImage = mutation({
  args: {
    imageId: v.id("imageAssets"),
    generateVariants: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Authentication required");
    }

    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new Error("Image not found");
    }

    // Check ownership or admin rights
    if (image.uploadedBy !== user._id && user.role !== "admin") {
      throw new Error("Unauthorized: You can only process your own images");
    }

    // In a real implementation, this would:
    // 1. Generate thumbnail, medium, and full variants
    // 2. Optimize images for web
    // 3. Extract metadata (dimensions, etc.)
    // 4. Run content moderation checks

    // For now, we'll just mark it as processed
    await ctx.db.patch(args.imageId, {
      moderationStatus: "pending", // Would be set based on automated checks
    });

    return null;
  },
});

/**
 * Clean up orphaned images (admin only)
 */
export const cleanupOrphanedImages = mutation({
  args: {
    olderThanDays: v.optional(v.number()),
    dryRun: v.optional(v.boolean()),
  },
  returns: v.object({
    found: v.number(),
    deleted: v.number(),
    orphanedImages: v.array(v.id("imageAssets")),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const cutoffDays = args.olderThanDays || 30;
    const cutoffDate = Date.now() - (cutoffDays * 24 * 60 * 60 * 1000);
    const dryRun = args.dryRun || false;

    // Find images that are not associated with any listing
    const allImages = await ctx.db.query("imageAssets").collect();
    const orphanedImages = allImages.filter(image =>
      !image.listingId &&
      image._creationTime < cutoffDate &&
      !image.isActive
    );

    let deleted = 0;
    const orphanedIds: string[] = [];

    for (const image of orphanedImages) {
      orphanedIds.push(image._id);

      if (!dryRun) {
        // In a real implementation, would also delete from storage
        await ctx.db.delete(image._id);
        deleted++;
      }
    }

    return {
      found: orphanedImages.length,
      deleted,
      orphanedImages: orphanedIds as any,
    };
  },
});
