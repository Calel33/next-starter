/**
 * Convex Functions: Categories API
 * 
 * This file defines the Convex function signatures for category management.
 * All functions use the new Convex function syntax with args and returns validators.
 */

import { v } from "convex/values";

// Category validator
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

// Query Functions

/**
 * Get all active categories in hierarchical structure
 */
export const getCategories = {
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  returns: v.array(categoryValidator),
};

/**
 * Get category by ID
 */
export const getCategory = {
  args: {
    categoryId: v.id("categories"),
  },
  returns: v.union(categoryValidator, v.null()),
};

/**
 * Get category by slug
 */
export const getCategoryBySlug = {
  args: {
    slug: v.string(),
  },
  returns: v.union(categoryValidator, v.null()),
};

/**
 * Get top-level categories (no parent)
 */
export const getTopLevelCategories = {
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  returns: v.array(categoryValidator),
};

/**
 * Get subcategories for a parent category
 */
export const getSubcategories = {
  args: {
    parentId: v.id("categories"),
    includeInactive: v.optional(v.boolean()),
  },
  returns: v.array(categoryValidator),
};

/**
 * Search categories by name
 */
export const searchCategories = {
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(categoryValidator),
};

// Mutation Functions

/**
 * Create new category (admin only)
 */
export const createCategory = {
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    parentId: v.optional(v.id("categories")),
    sortOrder: v.optional(v.number()),
  },
  returns: v.id("categories"),
};

/**
 * Update category (admin only)
 */
export const updateCategory = {
  args: {
    categoryId: v.id("categories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    parentId: v.optional(v.id("categories")),
    sortOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.boolean(),
};

/**
 * Delete category (admin only) - only if no listings
 */
export const deleteCategory = {
  args: {
    categoryId: v.id("categories"),
  },
  returns: v.boolean(),
};

/**
 * Reorder categories (admin only)
 */
export const reorderCategories = {
  args: {
    categoryOrders: v.array(v.object({
      categoryId: v.id("categories"),
      sortOrder: v.number(),
    })),
  },
  returns: v.boolean(),
};

/**
 * Merge categories (admin only) - move all listings from source to target
 */
export const mergeCategories = {
  args: {
    sourceCategoryId: v.id("categories"),
    targetCategoryId: v.id("categories"),
  },
  returns: v.object({
    movedListings: v.number(),
    success: v.boolean(),
  }),
};

// Internal Functions

/**
 * Generate unique slug from category name
 */
export const generateCategorySlug = {
  args: {
    name: v.string(),
    categoryId: v.optional(v.id("categories")),
  },
  returns: v.string(),
};

/**
 * Update listing count for category
 */
export const updateListingCount = {
  args: {
    categoryId: v.id("categories"),
  },
  returns: v.number(),
};

/**
 * Get category path (breadcrumb trail)
 */
export const getCategoryPath = {
  args: {
    categoryId: v.id("categories"),
  },
  returns: v.array(v.object({
    id: v.id("categories"),
    name: v.string(),
    slug: v.string(),
  })),
};
