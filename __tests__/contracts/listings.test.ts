/**
 * Contract Tests: Listings Queries
 * 
 * These tests validate the Convex function signatures and return types
 * for listing query operations. Tests MUST FAIL until implementation is complete.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ConvexTestingHelper } from 'convex/testing';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

describe('Listings Query Contracts', () => {
  let t: ConvexTestingHelper;

  beforeEach(async () => {
    t = new ConvexTestingHelper();
    await t.run(async (ctx) => {
      // Seed test data
      const userId = await ctx.db.insert('users', {
        name: 'Test User',
        externalId: 'test-user-1',
        role: 'owner',
        listingCount: 0,
      });

      const categoryId = await ctx.db.insert('categories', {
        name: 'Restaurants',
        slug: 'restaurants',
        isActive: true,
        sortOrder: 1,
        listingCount: 0,
        createdBy: userId,
        updatedAt: Date.now(),
      });

      await ctx.db.insert('listings', {
        name: 'Test Restaurant',
        slug: 'test-restaurant',
        description: 'A test restaurant',
        phone: '+1-555-123-4567',
        website: 'https://test-restaurant.com',
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

  describe('searchListings', () => {
    it('should accept valid search parameters and return structured results', async () => {
      const result = await t.query(api.listings.searchListings, {
        bounds: {
          north: 41.0,
          south: 40.0,
          east: -73.0,
          west: -74.0,
        },
        query: 'restaurant',
        categoryIds: [],
        openNow: false,
        limit: 10,
        offset: 0,
      });

      // Contract validation
      expect(result).toHaveProperty('listings');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.listings)).toBe(true);
      expect(typeof result.total).toBe('number');
      expect(typeof result.hasMore).toBe('boolean');

      // Listing structure validation
      if (result.listings.length > 0) {
        const listing = result.listings[0];
        expect(listing).toHaveProperty('_id');
        expect(listing).toHaveProperty('_creationTime');
        expect(listing).toHaveProperty('name');
        expect(listing).toHaveProperty('slug');
        expect(listing).toHaveProperty('address');
        expect(listing).toHaveProperty('location');
        expect(listing).toHaveProperty('categories');
        expect(listing).toHaveProperty('status');
        expect(listing).toHaveProperty('views');
        expect(listing).toHaveProperty('phoneClicks');
        expect(listing).toHaveProperty('websiteClicks');
        expect(listing).toHaveProperty('directionsClicks');
        expect(listing).toHaveProperty('updatedAt');
      }
    });

    it('should handle optional parameters correctly', async () => {
      const result = await t.query(api.listings.searchListings, {
        bounds: {
          north: 41.0,
          south: 40.0,
          east: -73.0,
          west: -74.0,
        },
      });

      expect(result).toHaveProperty('listings');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('hasMore');
    });

    it('should validate bounds parameter structure', async () => {
      await expect(
        t.query(api.listings.searchListings, {
          bounds: {
            north: 41.0,
            south: 40.0,
            east: -73.0,
            // Missing west property
          } as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('getListing', () => {
    it('should accept listing ID and return single listing or null', async () => {
      const listings = await t.query(api.listings.searchListings, {
        bounds: {
          north: 41.0,
          south: 40.0,
          east: -73.0,
          west: -74.0,
        },
      });

      if (listings.listings.length > 0) {
        const listingId = listings.listings[0]._id;
        const result = await t.query(api.listings.getListing, {
          listingId,
          trackView: true,
        });

        if (result) {
          expect(result).toHaveProperty('_id');
          expect(result).toHaveProperty('name');
          expect(result).toHaveProperty('slug');
          expect(result._id).toBe(listingId);
        }
      }
    });

    it('should handle non-existent listing ID', async () => {
      const result = await t.query(api.listings.getListing, {
        listingId: 'invalid-id' as Id<'listings'>,
      });

      expect(result).toBeNull();
    });

    it('should handle optional trackView parameter', async () => {
      const listings = await t.query(api.listings.searchListings, {
        bounds: {
          north: 41.0,
          south: 40.0,
          east: -73.0,
          west: -74.0,
        },
      });

      if (listings.listings.length > 0) {
        const listingId = listings.listings[0]._id;
        const result = await t.query(api.listings.getListing, {
          listingId,
        });

        // Should work without trackView parameter
        expect(result).toBeDefined();
      }
    });
  });

  describe('getListingBySlug', () => {
    it('should accept slug and return single listing or null', async () => {
      const result = await t.query(api.listings.getListingBySlug, {
        slug: 'test-restaurant',
        trackView: false,
      });

      if (result) {
        expect(result).toHaveProperty('_id');
        expect(result).toHaveProperty('slug');
        expect(result.slug).toBe('test-restaurant');
      }
    });

    it('should handle non-existent slug', async () => {
      const result = await t.query(api.listings.getListingBySlug, {
        slug: 'non-existent-slug',
      });

      expect(result).toBeNull();
    });
  });

  describe('getMyListings', () => {
    it('should return array of listings for current user', async () => {
      // This test requires authentication context
      const result = await t.query(api.listings.getMyListings, {
        status: 'approved',
      });

      expect(Array.isArray(result)).toBe(true);
      
      // Each listing should have proper structure
      result.forEach(listing => {
        expect(listing).toHaveProperty('_id');
        expect(listing).toHaveProperty('name');
        expect(listing).toHaveProperty('status');
        expect(listing).toHaveProperty('ownerId');
      });
    });

    it('should handle optional status filter', async () => {
      const result = await t.query(api.listings.getMyListings, {});

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getModerationQueue', () => {
    it('should return paginated moderation queue for admin', async () => {
      const result = await t.query(api.listings.getModerationQueue, {
        status: 'pending',
        limit: 10,
        offset: 0,
      });

      expect(result).toHaveProperty('listings');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.listings)).toBe(true);
      expect(typeof result.total).toBe('number');
      expect(typeof result.hasMore).toBe('boolean');
    });

    it('should handle optional parameters', async () => {
      const result = await t.query(api.listings.getModerationQueue, {});

      expect(result).toHaveProperty('listings');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('hasMore');
    });
  });
});
