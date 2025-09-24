/**
 * Contract Tests: Listings Mutations
 * 
 * These tests validate the Convex function signatures and return types
 * for listing mutation operations. Tests MUST FAIL until implementation is complete.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ConvexTestingHelper } from 'convex/testing';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

describe('Listings Mutation Contracts', () => {
  let t: ConvexTestingHelper;
  let userId: Id<'users'>;
  let categoryId: Id<'categories'>;

  beforeEach(async () => {
    t = new ConvexTestingHelper();
    await t.run(async (ctx) => {
      // Seed test data
      userId = await ctx.db.insert('users', {
        name: 'Test Owner',
        externalId: 'test-owner-1',
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
    });
  });

  describe('createListing', () => {
    it('should accept valid listing data and return listing ID', async () => {
      const listingData = {
        name: 'New Restaurant',
        description: 'A brand new restaurant',
        phone: '+1-555-987-6543',
        website: 'https://new-restaurant.com',
        email: 'contact@new-restaurant.com',
        address: {
          line1: '456 Oak Ave',
          city: 'New City',
          region: 'NC',
          postalCode: '54321',
          country: 'US',
        },
        location: {
          lat: 40.7128,
          lng: -74.0060,
        },
        categoryIds: [categoryId],
        hours: [
          {
            day: 1 as const,
            open: '09:00',
            close: '17:00',
            closed: false,
          },
          {
            day: 0 as const,
            open: '10:00',
            close: '16:00',
            closed: false,
          },
        ],
        imageIds: [],
      };

      const result = await t.mutation(api.listings.createListing, listingData);

      // Should return a valid listing ID
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^[a-zA-Z0-9]+$/); // Basic ID format validation
    });

    it('should handle minimal required data', async () => {
      const minimalData = {
        name: 'Minimal Restaurant',
        address: {
          line1: '123 Simple St',
          city: 'Simple City',
          region: 'SC',
          postalCode: '12345',
          country: 'US',
        },
        location: {
          lat: 40.7589,
          lng: -73.9851,
        },
        categoryIds: [categoryId],
      };

      const result = await t.mutation(api.listings.createListing, minimalData);

      expect(typeof result).toBe('string');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        // Missing name
        address: {
          line1: '123 Test St',
          city: 'Test City',
          region: 'TC',
          postalCode: '12345',
          country: 'US',
        },
        location: {
          lat: 40.7589,
          lng: -73.9851,
        },
        categoryIds: [categoryId],
      };

      await expect(
        t.mutation(api.listings.createListing, invalidData as any)
      ).rejects.toThrow();
    });

    it('should validate address structure', async () => {
      const invalidAddressData = {
        name: 'Test Restaurant',
        address: {
          line1: '123 Test St',
          city: 'Test City',
          // Missing region, postalCode, country
        },
        location: {
          lat: 40.7589,
          lng: -73.9851,
        },
        categoryIds: [categoryId],
      };

      await expect(
        t.mutation(api.listings.createListing, invalidAddressData as any)
      ).rejects.toThrow();
    });

    it('should validate location coordinates', async () => {
      const invalidLocationData = {
        name: 'Test Restaurant',
        address: {
          line1: '123 Test St',
          city: 'Test City',
          region: 'TC',
          postalCode: '12345',
          country: 'US',
        },
        location: {
          lat: 91.0, // Invalid latitude (> 90)
          lng: -73.9851,
        },
        categoryIds: [categoryId],
      };

      await expect(
        t.mutation(api.listings.createListing, invalidLocationData as any)
      ).rejects.toThrow();
    });
  });

  describe('updateListing', () => {
    let listingId: Id<'listings'>;

    beforeEach(async () => {
      listingId = await t.mutation(api.listings.createListing, {
        name: 'Original Restaurant',
        address: {
          line1: '123 Original St',
          city: 'Original City',
          region: 'OC',
          postalCode: '12345',
          country: 'US',
        },
        location: {
          lat: 40.7589,
          lng: -73.9851,
        },
        categoryIds: [categoryId],
      });
    });

    it('should accept partial updates and return listing ID or null', async () => {
      const updateData = {
        listingId,
        name: 'Updated Restaurant Name',
        description: 'Updated description',
      };

      const result = await t.mutation(api.listings.updateListing, updateData);

      // Should return listing ID on success or null on failure
      expect(result === null || typeof result === 'string').toBe(true);
    });

    it('should handle empty updates', async () => {
      const result = await t.mutation(api.listings.updateListing, {
        listingId,
      });

      expect(result === null || typeof result === 'string').toBe(true);
    });

    it('should validate listing ID exists', async () => {
      const result = await t.mutation(api.listings.updateListing, {
        listingId: 'invalid-id' as Id<'listings'>,
        name: 'Updated Name',
      });

      expect(result).toBeNull();
    });
  });

  describe('moderateListing', () => {
    let listingId: Id<'listings'>;

    beforeEach(async () => {
      listingId = await t.mutation(api.listings.createListing, {
        name: 'Pending Restaurant',
        address: {
          line1: '123 Pending St',
          city: 'Pending City',
          region: 'PC',
          postalCode: '12345',
          country: 'US',
        },
        location: {
          lat: 40.7589,
          lng: -73.9851,
        },
        categoryIds: [categoryId],
      });
    });

    it('should accept moderation action and return boolean', async () => {
      const result = await t.mutation(api.listings.moderateListing, {
        listingId,
        action: 'approve',
        notes: 'Listing approved after review',
      });

      expect(typeof result).toBe('boolean');
    });

    it('should validate action parameter', async () => {
      await expect(
        t.mutation(api.listings.moderateListing, {
          listingId,
          action: 'invalid-action' as any,
        })
      ).rejects.toThrow();
    });

    it('should handle optional notes parameter', async () => {
      const result = await t.mutation(api.listings.moderateListing, {
        listingId,
        action: 'reject',
      });

      expect(typeof result).toBe('boolean');
    });
  });

  describe('archiveListing', () => {
    let listingId: Id<'listings'>;

    beforeEach(async () => {
      listingId = await t.mutation(api.listings.createListing, {
        name: 'To Archive Restaurant',
        address: {
          line1: '123 Archive St',
          city: 'Archive City',
          region: 'AC',
          postalCode: '12345',
          country: 'US',
        },
        location: {
          lat: 40.7589,
          lng: -73.9851,
        },
        categoryIds: [categoryId],
      });
    });

    it('should accept listing ID and return boolean', async () => {
      const result = await t.mutation(api.listings.archiveListing, {
        listingId,
      });

      expect(typeof result).toBe('boolean');
    });
  });

  describe('trackInteraction', () => {
    let listingId: Id<'listings'>;

    beforeEach(async () => {
      listingId = await t.mutation(api.listings.createListing, {
        name: 'Interaction Restaurant',
        address: {
          line1: '123 Interaction St',
          city: 'Interaction City',
          region: 'IC',
          postalCode: '12345',
          country: 'US',
        },
        location: {
          lat: 40.7589,
          lng: -73.9851,
        },
        categoryIds: [categoryId],
      });
    });

    it('should accept interaction type and return null', async () => {
      const result = await t.mutation(api.listings.trackInteraction, {
        listingId,
        type: 'phone',
      });

      expect(result).toBeNull();
    });

    it('should validate interaction type', async () => {
      await expect(
        t.mutation(api.listings.trackInteraction, {
          listingId,
          type: 'invalid-type' as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('bulkImportListings', () => {
    it('should accept array of listings and return import results', async () => {
      const importData = {
        listings: [
          {
            name: 'Bulk Import Restaurant 1',
            address: {
              line1: '123 Bulk St',
              city: 'Bulk City',
              region: 'BC',
              postalCode: '12345',
              country: 'US',
            },
            location: {
              lat: 40.7589,
              lng: -73.9851,
            },
            categoryNames: ['Restaurants'],
          },
        ],
        dryRun: true,
      };

      const result = await t.mutation(api.listings.bulkImportListings, importData);

      expect(result).toHaveProperty('imported');
      expect(result).toHaveProperty('skipped');
      expect(result).toHaveProperty('errors');
      expect(typeof result.imported).toBe('number');
      expect(typeof result.skipped).toBe('number');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });
});
