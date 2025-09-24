/**
 * Contract Tests: Categories API
 * 
 * These tests validate the Convex function signatures and return types
 * for category management operations. Tests MUST FAIL until implementation is complete.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ConvexTestingHelper } from 'convex/testing';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

describe('Categories API Contracts', () => {
  let t: ConvexTestingHelper;
  let adminUserId: Id<'users'>;
  let parentCategoryId: Id<'categories'>;

  beforeEach(async () => {
    t = new ConvexTestingHelper();
    await t.run(async (ctx) => {
      // Seed test data
      adminUserId = await ctx.db.insert('users', {
        name: 'Admin User',
        externalId: 'admin-user-1',
        role: 'admin',
        listingCount: 0,
      });

      parentCategoryId = await ctx.db.insert('categories', {
        name: 'Food & Dining',
        slug: 'food-dining',
        description: 'All food and dining establishments',
        isActive: true,
        sortOrder: 1,
        listingCount: 0,
        createdBy: adminUserId,
        updatedAt: Date.now(),
      });

      await ctx.db.insert('categories', {
        name: 'Restaurants',
        slug: 'restaurants',
        description: 'Full-service restaurants',
        parentId: parentCategoryId,
        isActive: true,
        sortOrder: 1,
        listingCount: 5,
        createdBy: adminUserId,
        updatedAt: Date.now(),
      });
    });
  });

  describe('getCategories', () => {
    it('should return array of categories with proper structure', async () => {
      const result = await t.query(api.categories.getCategories, {
        includeInactive: false,
      });

      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        const category = result[0];
        expect(category).toHaveProperty('_id');
        expect(category).toHaveProperty('_creationTime');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('slug');
        expect(category).toHaveProperty('isActive');
        expect(category).toHaveProperty('sortOrder');
        expect(category).toHaveProperty('listingCount');
        expect(category).toHaveProperty('createdBy');
        expect(category).toHaveProperty('updatedAt');
      }
    });

    it('should handle optional includeInactive parameter', async () => {
      const result = await t.query(api.categories.getCategories, {});
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getCategory', () => {
    it('should return single category by ID or null', async () => {
      const result = await t.query(api.categories.getCategory, {
        categoryId: parentCategoryId,
      });

      if (result) {
        expect(result).toHaveProperty('_id');
        expect(result).toHaveProperty('name');
        expect(result._id).toBe(parentCategoryId);
      }
    });

    it('should return null for non-existent category', async () => {
      const result = await t.query(api.categories.getCategory, {
        categoryId: 'invalid-id' as Id<'categories'>,
      });

      expect(result).toBeNull();
    });
  });

  describe('getCategoryBySlug', () => {
    it('should return category by slug or null', async () => {
      const result = await t.query(api.categories.getCategoryBySlug, {
        slug: 'food-dining',
      });

      if (result) {
        expect(result).toHaveProperty('slug');
        expect(result.slug).toBe('food-dining');
      }
    });

    it('should return null for non-existent slug', async () => {
      const result = await t.query(api.categories.getCategoryBySlug, {
        slug: 'non-existent-slug',
      });

      expect(result).toBeNull();
    });
  });

  describe('getTopLevelCategories', () => {
    it('should return array of top-level categories', async () => {
      const result = await t.query(api.categories.getTopLevelCategories, {
        includeInactive: false,
      });

      expect(Array.isArray(result)).toBe(true);
      
      // All returned categories should have no parentId
      result.forEach(category => {
        expect(category.parentId).toBeUndefined();
      });
    });
  });

  describe('getSubcategories', () => {
    it('should return array of subcategories for parent', async () => {
      const result = await t.query(api.categories.getSubcategories, {
        parentId: parentCategoryId,
        includeInactive: false,
      });

      expect(Array.isArray(result)).toBe(true);
      
      // All returned categories should have the correct parentId
      result.forEach(category => {
        expect(category.parentId).toBe(parentCategoryId);
      });
    });
  });

  describe('searchCategories', () => {
    it('should return array of matching categories', async () => {
      const result = await t.query(api.categories.searchCategories, {
        query: 'food',
        limit: 10,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle optional limit parameter', async () => {
      const result = await t.query(api.categories.searchCategories, {
        query: 'restaurant',
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('createCategory', () => {
    it('should accept category data and return category ID', async () => {
      const categoryData = {
        name: 'New Category',
        description: 'A new test category',
        parentId: parentCategoryId,
        sortOrder: 10,
      };

      const result = await t.mutation(api.categories.createCategory, categoryData);

      expect(typeof result).toBe('string');
      expect(result).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it('should handle minimal required data', async () => {
      const result = await t.mutation(api.categories.createCategory, {
        name: 'Minimal Category',
      });

      expect(typeof result).toBe('string');
    });

    it('should validate required name field', async () => {
      await expect(
        t.mutation(api.categories.createCategory, {} as any)
      ).rejects.toThrow();
    });
  });

  describe('updateCategory', () => {
    let categoryId: Id<'categories'>;

    beforeEach(async () => {
      categoryId = await t.mutation(api.categories.createCategory, {
        name: 'Update Test Category',
      });
    });

    it('should accept partial updates and return boolean', async () => {
      const result = await t.mutation(api.categories.updateCategory, {
        categoryId,
        name: 'Updated Category Name',
        description: 'Updated description',
      });

      expect(typeof result).toBe('boolean');
    });

    it('should handle empty updates', async () => {
      const result = await t.mutation(api.categories.updateCategory, {
        categoryId,
      });

      expect(typeof result).toBe('boolean');
    });
  });

  describe('deleteCategory', () => {
    let categoryId: Id<'categories'>;

    beforeEach(async () => {
      categoryId = await t.mutation(api.categories.createCategory, {
        name: 'Delete Test Category',
      });
    });

    it('should accept category ID and return boolean', async () => {
      const result = await t.mutation(api.categories.deleteCategory, {
        categoryId,
      });

      expect(typeof result).toBe('boolean');
    });
  });

  describe('reorderCategories', () => {
    it('should accept array of category orders and return boolean', async () => {
      const result = await t.mutation(api.categories.reorderCategories, {
        categoryOrders: [
          { categoryId: parentCategoryId, sortOrder: 2 },
        ],
      });

      expect(typeof result).toBe('boolean');
    });

    it('should validate categoryOrders structure', async () => {
      await expect(
        t.mutation(api.categories.reorderCategories, {
          categoryOrders: [
            { categoryId: parentCategoryId } // Missing sortOrder
          ] as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('mergeCategories', () => {
    let sourceCategoryId: Id<'categories'>;
    let targetCategoryId: Id<'categories'>;

    beforeEach(async () => {
      sourceCategoryId = await t.mutation(api.categories.createCategory, {
        name: 'Source Category',
      });
      
      targetCategoryId = await t.mutation(api.categories.createCategory, {
        name: 'Target Category',
      });
    });

    it('should accept source and target IDs and return merge results', async () => {
      const result = await t.mutation(api.categories.mergeCategories, {
        sourceCategoryId,
        targetCategoryId,
      });

      expect(result).toHaveProperty('movedListings');
      expect(result).toHaveProperty('success');
      expect(typeof result.movedListings).toBe('number');
      expect(typeof result.success).toBe('boolean');
    });
  });
});
