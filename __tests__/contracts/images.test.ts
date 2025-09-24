/**
 * Contract Tests: Images API
 * 
 * These tests validate the Convex function signatures and return types
 * for image management operations. Tests MUST FAIL until implementation is complete.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ConvexTestingHelper } from 'convex/testing';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

describe('Images API Contracts', () => {
  let t: ConvexTestingHelper;
  let userId: Id<'users'>;
  let listingId: Id<'listings'>;
  let categoryId: Id<'categories'>;

  beforeEach(async () => {
    t = new ConvexTestingHelper();
    await t.run(async (ctx) => {
      // Seed test data
      userId = await ctx.db.insert('users', {
        name: 'Test User',
        externalId: 'test-user-1',
        role: 'owner',
        listingCount: 0,
      });

      categoryId = await ctx.db.insert('categories', {
        name: 'Restaurants',
        slug: 'restaurants',
        isActive: true,
        sortOrder: 1,
        listingCount: 0,
        createdBy: userId,
        updatedAt: Date.now(),
      });

      listingId = await ctx.db.insert('listings', {
        name: 'Test Restaurant',
        slug: 'test-restaurant',
        address: {
          line1: '123 Main St',
          city: 'Test City',
          region: 'TS',
          postalCode: '12345',
          country: 'US',
        },
        location: {
          lat: 40.7589,
          lng: -73.9851,
        },
        categories: [categoryId],
        images: [],
        ownerId: userId,
        status: 'approved',
        views: 0,
        phoneClicks: 0,
        websiteClicks: 0,
        directionsClicks: 0,
        updatedAt: Date.now(),
      });
    });
  });

  describe('getImage', () => {
    it('should return image with URL or null', async () => {
      // This test requires an actual image to be created first
      const result = await t.query(api.images.getImage, {
        imageId: 'test-image-id' as Id<'imageAssets'>,
        variant: 'medium',
      });

      if (result) {
        expect(result).toHaveProperty('image');
        expect(result).toHaveProperty('url');
        expect(typeof result.url).toBe('string');
        
        const image = result.image;
        expect(image).toHaveProperty('_id');
        expect(image).toHaveProperty('_creationTime');
        expect(image).toHaveProperty('storageId');
        expect(image).toHaveProperty('filename');
        expect(image).toHaveProperty('contentType');
        expect(image).toHaveProperty('size');
        expect(image).toHaveProperty('width');
        expect(image).toHaveProperty('height');
        expect(image).toHaveProperty('variants');
        expect(image).toHaveProperty('uploadedBy');
        expect(image).toHaveProperty('isActive');
        expect(image).toHaveProperty('moderationStatus');
      } else {
        expect(result).toBeNull();
      }
    });

    it('should handle optional variant parameter', async () => {
      const result = await t.query(api.images.getImage, {
        imageId: 'test-image-id' as Id<'imageAssets'>,
      });

      // Should work without variant parameter
      expect(result === null || (result && typeof result.url === 'string')).toBe(true);
    });

    it('should validate variant parameter values', async () => {
      await expect(
        t.query(api.images.getImage, {
          imageId: 'test-image-id' as Id<'imageAssets'>,
          variant: 'invalid-variant' as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('getListingImages', () => {
    it('should return array of images with URLs for listing', async () => {
      const result = await t.query(api.images.getListingImages, {
        listingId,
        variant: 'thumbnail',
      });

      expect(Array.isArray(result)).toBe(true);
      
      result.forEach(item => {
        expect(item).toHaveProperty('image');
        expect(item).toHaveProperty('url');
        expect(typeof item.url).toBe('string');
        expect(item.image).toHaveProperty('_id');
        expect(item.image).toHaveProperty('listingId');
        expect(item.image.listingId).toBe(listingId);
      });
    });

    it('should handle optional variant parameter', async () => {
      const result = await t.query(api.images.getListingImages, {
        listingId,
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getUserImages', () => {
    it('should return array of images uploaded by user', async () => {
      const result = await t.query(api.images.getUserImages, {
        userId,
        includeInactive: false,
      });

      expect(Array.isArray(result)).toBe(true);
      
      result.forEach(item => {
        expect(item).toHaveProperty('image');
        expect(item).toHaveProperty('url');
        expect(item.image.uploadedBy).toBe(userId);
      });
    });

    it('should handle optional parameters', async () => {
      const result = await t.query(api.images.getUserImages, {});

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getImageModerationQueue', () => {
    it('should return paginated moderation queue', async () => {
      const result = await t.query(api.images.getImageModerationQueue, {
        status: 'pending',
        limit: 10,
        offset: 0,
      });

      expect(result).toHaveProperty('images');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.images)).toBe(true);
      expect(typeof result.total).toBe('number');
      expect(typeof result.hasMore).toBe('boolean');
    });

    it('should handle optional parameters', async () => {
      const result = await t.query(api.images.getImageModerationQueue, {});

      expect(result).toHaveProperty('images');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('hasMore');
    });
  });

  describe('generateUploadUrl', () => {
    it('should return upload URL string', async () => {
      const result = await t.mutation(api.images.generateUploadUrl, {});

      expect(typeof result).toBe('string');
      expect(result).toMatch(/^https?:\/\//); // Basic URL validation
    });
  });

  describe('createImageAsset', () => {
    it('should accept image data and return image ID', async () => {
      const imageData = {
        storageId: 'test-storage-id' as Id<'_storage'>,
        filename: 'test-image.jpg',
        contentType: 'image/jpeg',
        size: 1024000,
        width: 800,
        height: 600,
        altText: 'Test image description',
        listingId,
      };

      const result = await t.mutation(api.images.createImageAsset, imageData);

      expect(typeof result).toBe('string');
      expect(result).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it('should handle minimal required data', async () => {
      const minimalData = {
        storageId: 'test-storage-id' as Id<'_storage'>,
        filename: 'minimal.jpg',
        contentType: 'image/jpeg',
        size: 500000,
        width: 400,
        height: 300,
      };

      const result = await t.mutation(api.images.createImageAsset, minimalData);

      expect(typeof result).toBe('string');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        // Missing storageId
        filename: 'test.jpg',
        contentType: 'image/jpeg',
        size: 1000,
        width: 100,
        height: 100,
      };

      await expect(
        t.mutation(api.images.createImageAsset, invalidData as any)
      ).rejects.toThrow();
    });
  });

  describe('updateImageAsset', () => {
    let imageId: Id<'imageAssets'>;

    beforeEach(async () => {
      imageId = await t.mutation(api.images.createImageAsset, {
        storageId: 'test-storage-id' as Id<'_storage'>,
        filename: 'update-test.jpg',
        contentType: 'image/jpeg',
        size: 1000,
        width: 100,
        height: 100,
      });
    });

    it('should accept partial updates and return boolean', async () => {
      const result = await t.mutation(api.images.updateImageAsset, {
        imageId,
        altText: 'Updated alt text',
        listingId,
      });

      expect(typeof result).toBe('boolean');
    });

    it('should handle empty updates', async () => {
      const result = await t.mutation(api.images.updateImageAsset, {
        imageId,
      });

      expect(typeof result).toBe('boolean');
    });
  });

  describe('moderateImage', () => {
    let imageId: Id<'imageAssets'>;

    beforeEach(async () => {
      imageId = await t.mutation(api.images.createImageAsset, {
        storageId: 'test-storage-id' as Id<'_storage'>,
        filename: 'moderate-test.jpg',
        contentType: 'image/jpeg',
        size: 1000,
        width: 100,
        height: 100,
      });
    });

    it('should accept moderation action and return boolean', async () => {
      const result = await t.mutation(api.images.moderateImage, {
        imageId,
        action: 'approve',
        reason: 'Image approved',
      });

      expect(typeof result).toBe('boolean');
    });

    it('should validate action parameter', async () => {
      await expect(
        t.mutation(api.images.moderateImage, {
          imageId,
          action: 'invalid-action' as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('deleteImage', () => {
    let imageId: Id<'imageAssets'>;

    beforeEach(async () => {
      imageId = await t.mutation(api.images.createImageAsset, {
        storageId: 'test-storage-id' as Id<'_storage'>,
        filename: 'delete-test.jpg',
        contentType: 'image/jpeg',
        size: 1000,
        width: 100,
        height: 100,
      });
    });

    it('should accept image ID and return boolean', async () => {
      const result = await t.mutation(api.images.deleteImage, {
        imageId,
      });

      expect(typeof result).toBe('boolean');
    });
  });

  describe('reorderListingImages', () => {
    it('should accept listing ID and image order and return boolean', async () => {
      const result = await t.mutation(api.images.reorderListingImages, {
        listingId,
        imageIds: [],
      });

      expect(typeof result).toBe('boolean');
    });
  });
});
