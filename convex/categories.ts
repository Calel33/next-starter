/**
 * Convex Functions: Categories API
 * 
 * Functions for managing business categories including hierarchical structure,
 * sorting, and category-based filtering.
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

// Validators
const categoryValidator = v.object({
  _id: v.id("categories"),
  _creationTime: v.number(),
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  parentId: v.optional(v.id("categories")),
  isActive: v.boolean(),
  sortOrder: v.number(),
  listingCount: v.number(),
  createdBy: v.id("users"),
  updatedAt: v.number(),
});

// Queries

/**
 * Get all active categories with optional parent filter
 */
export const getCategories = query({
  args: {
    parentId: v.optional(v.id("categories")),
    includeInactive: v.optional(v.boolean()),
  },
  returns: v.array(categoryValidator),
  handler: async (ctx, args) => {
    let query;

    if (args.parentId !== undefined) {
      // Filter by parent (including null for root categories)
      query = ctx.db.query("categories").withIndex("byParent", (q) => q.eq("parentId", args.parentId));
    } else {
      query = ctx.db.query("categories");
    }
    
    let results = await query.collect();
    
    // Filter by active status unless explicitly including inactive
    if (!args.includeInactive) {
      results = results.filter(category => category.isActive);
    }
    
    // Sort by sortOrder
    results.sort((a, b) => a.sortOrder - b.sortOrder);
    
    return results;
  },
});

/**
 * Get category by ID
 */
export const getCategory = query({
  args: { categoryId: v.id("categories") },
  returns: v.union(categoryValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.categoryId);
  },
});

/**
 * Get category by slug
 */
export const getCategoryBySlug = query({
  args: { slug: v.string() },
  returns: v.union(categoryValidator, v.null()),
  handler: async (ctx, args) => {
    const categories = await ctx.db.query("categories").collect();
    return categories.find(cat => cat.slug === args.slug) || null;
  },
});

/**
 * Get category hierarchy (breadcrumb trail)
 */
export const getCategoryHierarchy = query({
  args: { categoryId: v.id("categories") },
  returns: v.array(categoryValidator),
  handler: async (ctx, args) => {
    const hierarchy: any[] = [];
    let currentId: string | undefined = args.categoryId;

    while (currentId) {
      const category: any = await ctx.db.get(currentId as any);
      if (!category || !("parentId" in category)) break;

      hierarchy.unshift(category);
      currentId = category.parentId;
    }

    return hierarchy;
  },
});

// Mutations

/**
 * Create a new category
 */
export const createCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    parentId: v.optional(v.id("categories")),
    sortOrder: v.optional(v.number()),
  },
  returns: v.id("categories"),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    
    // Generate slug from name
    const slug = generateSlug(args.name);
    
    // Check for duplicate slug
    const existing = await ctx.db.query("categories").collect();
    const duplicateSlug = existing.find(cat => cat.slug === slug);
    if (duplicateSlug) {
      throw new Error("A category with this name already exists");
    }
    
    // Determine sort order
    let sortOrder = args.sortOrder;
    if (sortOrder === undefined) {
      // Get max sort order for siblings
      const siblings = existing.filter(cat => cat.parentId === args.parentId);
      sortOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.sortOrder)) + 1 : 0;
    }
    
    const now = Date.now();
    
    return await ctx.db.insert("categories", {
      name: args.name,
      slug,
      description: args.description,
      parentId: args.parentId,
      isActive: true,
      sortOrder,
      listingCount: 0,
      createdBy: user._id,
      updatedAt: now,
    });
  },
});

/**
 * Update an existing category
 */
export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    parentId: v.optional(v.id("categories")),
    isActive: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }
    
    const updates: any = {
      updatedAt: Date.now(),
    };
    
    // Add provided updates
    if (args.name !== undefined) {
      updates.name = args.name;
      updates.slug = generateSlug(args.name);
    }
    if (args.description !== undefined) updates.description = args.description;
    if (args.parentId !== undefined) updates.parentId = args.parentId;
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    if (args.sortOrder !== undefined) updates.sortOrder = args.sortOrder;
    
    await ctx.db.patch(args.categoryId, updates);
    return null;
  },
});

/**
 * Delete a category (admin only)
 */
export const deleteCategory = mutation({
  args: { categoryId: v.id("categories") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }
    
    // Check if category has listings
    if (category.listingCount > 0) {
      throw new Error("Cannot delete category with existing listings");
    }
    
    // Check if category has children
    const children = await ctx.db
      .query("categories")
      .withIndex("byParent", (q) => q.eq("parentId", args.categoryId))
      .collect();
    
    if (children.length > 0) {
      throw new Error("Cannot delete category with subcategories");
    }
    
    await ctx.db.delete(args.categoryId);
    return null;
  },
});

/**
 * Reorder categories
 */
export const reorderCategories = mutation({
  args: {
    categoryIds: v.array(v.id("categories")),
    parentId: v.optional(v.id("categories")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Update sort order for each category
    for (let i = 0; i < args.categoryIds.length; i++) {
      await ctx.db.patch(args.categoryIds[i], {
        sortOrder: i,
        updatedAt: Date.now(),
      });
    }

    return null;
  },
});

/**
 * Merge categories (admin only)
 */
export const mergeCategories = mutation({
  args: {
    sourceId: v.id("categories"),
    targetId: v.id("categories"),
    deleteSource: v.optional(v.boolean()),
  },
  returns: v.object({
    listingsUpdated: v.number(),
    sourceDeleted: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const [sourceCategory, targetCategory] = await Promise.all([
      ctx.db.get(args.sourceId),
      ctx.db.get(args.targetId),
    ]);

    if (!sourceCategory || !targetCategory) {
      throw new Error("Source or target category not found");
    }

    if (args.sourceId === args.targetId) {
      throw new Error("Cannot merge category with itself");
    }

    // Find all listings that use the source category
    const allListings = await ctx.db.query("listings").collect();
    const listingsToUpdate = allListings.filter(listing =>
      listing.categories.includes(args.sourceId)
    );

    let listingsUpdated = 0;

    // Update listings to use target category instead of source
    for (const listing of listingsToUpdate) {
      const updatedCategories = listing.categories.map(catId =>
        catId === args.sourceId ? args.targetId : catId
      );

      // Remove duplicates
      const uniqueCategories = [...new Set(updatedCategories)];

      await ctx.db.patch(listing._id, {
        categories: uniqueCategories,
        updatedAt: Date.now(),
      });

      listingsUpdated++;
    }

    // Update target category listing count
    await ctx.db.patch(args.targetId, {
      listingCount: targetCategory.listingCount + sourceCategory.listingCount,
      updatedAt: Date.now(),
    });

    let sourceDeleted = false;

    // Delete source category if requested and it has no children
    if (args.deleteSource) {
      const children = await ctx.db
        .query("categories")
        .withIndex("byParent", (q) => q.eq("parentId", args.sourceId))
        .collect();

      if (children.length === 0) {
        await ctx.db.delete(args.sourceId);
        sourceDeleted = true;
      } else {
        // Move children to target category's parent
        for (const child of children) {
          await ctx.db.patch(child._id, {
            parentId: targetCategory.parentId,
            updatedAt: Date.now(),
          });
        }
        await ctx.db.delete(args.sourceId);
        sourceDeleted = true;
      }
    } else {
      // Just mark source as inactive
      await ctx.db.patch(args.sourceId, {
        isActive: false,
        listingCount: 0,
        updatedAt: Date.now(),
      });
    }

    return {
      listingsUpdated,
      sourceDeleted,
    };
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
