/**
 * Contract Tests: Analytics API
 * 
 * These tests validate the Convex function signatures and return types
 * for analytics and event tracking operations. Tests MUST FAIL until implementation is complete.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ConvexTestingHelper } from 'convex/testing';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

describe('Analytics API Contracts', () => {
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

  describe('getListingAnalytics', () => {
    it('should return analytics summary for listing', async () => {
      const result = await t.query(api.analytics.getListingAnalytics, {
        listingId,
        dateRange: {
          start: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
          end: Date.now(),
        },
      });

      expect(result).toHaveProperty('views');
      expect(result).toHaveProperty('phoneClicks');
      expect(result).toHaveProperty('websiteClicks');
      expect(result).toHaveProperty('directionsClicks');
      expect(result).toHaveProperty('uniqueVisitors');
      expect(result).toHaveProperty('conversionRate');
      expect(result).toHaveProperty('dailyStats');

      expect(typeof result.views).toBe('number');
      expect(typeof result.phoneClicks).toBe('number');
      expect(typeof result.websiteClicks).toBe('number');
      expect(typeof result.directionsClicks).toBe('number');
      expect(typeof result.uniqueVisitors).toBe('number');
      expect(typeof result.conversionRate).toBe('number');
      expect(Array.isArray(result.dailyStats)).toBe(true);

      result.dailyStats.forEach(stat => {
        expect(stat).toHaveProperty('date');
        expect(stat).toHaveProperty('views');
        expect(stat).toHaveProperty('clicks');
        expect(typeof stat.date).toBe('string');
        expect(typeof stat.views).toBe('number');
        expect(typeof stat.clicks).toBe('number');
      });
    });

    it('should handle optional dateRange parameter', async () => {
      const result = await t.query(api.analytics.getListingAnalytics, {
        listingId,
      });

      expect(result).toHaveProperty('views');
      expect(result).toHaveProperty('dailyStats');
    });
  });

  describe('getOwnerAnalytics', () => {
    it('should return owner dashboard analytics', async () => {
      const result = await t.query(api.analytics.getOwnerAnalytics, {
        dateRange: {
          start: Date.now() - 30 * 24 * 60 * 60 * 1000,
          end: Date.now(),
        },
      });

      expect(result).toHaveProperty('totalViews');
      expect(result).toHaveProperty('totalClicks');
      expect(result).toHaveProperty('totalListings');
      expect(result).toHaveProperty('averageViewsPerListing');
      expect(result).toHaveProperty('topPerformingListings');
      expect(result).toHaveProperty('recentActivity');

      expect(typeof result.totalViews).toBe('number');
      expect(typeof result.totalClicks).toBe('number');
      expect(typeof result.totalListings).toBe('number');
      expect(typeof result.averageViewsPerListing).toBe('number');
      expect(Array.isArray(result.topPerformingListings)).toBe(true);
      expect(Array.isArray(result.recentActivity)).toBe(true);

      result.topPerformingListings.forEach(listing => {
        expect(listing).toHaveProperty('listingId');
        expect(listing).toHaveProperty('name');
        expect(listing).toHaveProperty('views');
        expect(listing).toHaveProperty('clicks');
      });
    });

    it('should handle optional dateRange parameter', async () => {
      const result = await t.query(api.analytics.getOwnerAnalytics, {});

      expect(result).toHaveProperty('totalViews');
      expect(result).toHaveProperty('topPerformingListings');
    });
  });

  describe('getSystemAnalytics', () => {
    it('should return system-wide analytics for admin', async () => {
      const result = await t.query(api.analytics.getSystemAnalytics, {
        dateRange: {
          start: Date.now() - 30 * 24 * 60 * 60 * 1000,
          end: Date.now(),
        },
      });

      expect(result).toHaveProperty('totalListings');
      expect(result).toHaveProperty('totalViews');
      expect(result).toHaveProperty('totalSearches');
      expect(result).toHaveProperty('uniqueVisitors');
      expect(result).toHaveProperty('topCategories');
      expect(result).toHaveProperty('topSearchTerms');
      expect(result).toHaveProperty('userGrowth');
      expect(result).toHaveProperty('geographicDistribution');

      expect(typeof result.totalListings).toBe('number');
      expect(typeof result.totalViews).toBe('number');
      expect(typeof result.totalSearches).toBe('number');
      expect(typeof result.uniqueVisitors).toBe('number');
      expect(Array.isArray(result.topCategories)).toBe(true);
      expect(Array.isArray(result.topSearchTerms)).toBe(true);
      expect(Array.isArray(result.userGrowth)).toBe(true);
      expect(Array.isArray(result.geographicDistribution)).toBe(true);
    });
  });

  describe('getSearchAnalytics', () => {
    it('should return search analytics', async () => {
      const result = await t.query(api.analytics.getSearchAnalytics, {
        dateRange: {
          start: Date.now() - 7 * 24 * 60 * 60 * 1000,
          end: Date.now(),
        },
        limit: 20,
      });

      expect(result).toHaveProperty('totalSearches');
      expect(result).toHaveProperty('averageResultsPerSearch');
      expect(result).toHaveProperty('noResultsRate');
      expect(result).toHaveProperty('topQueries');
      expect(result).toHaveProperty('topCategories');

      expect(typeof result.totalSearches).toBe('number');
      expect(typeof result.averageResultsPerSearch).toBe('number');
      expect(typeof result.noResultsRate).toBe('number');
      expect(Array.isArray(result.topQueries)).toBe(true);
      expect(Array.isArray(result.topCategories)).toBe(true);
    });

    it('should handle optional parameters', async () => {
      const result = await t.query(api.analytics.getSearchAnalytics, {});

      expect(result).toHaveProperty('totalSearches');
      expect(result).toHaveProperty('topQueries');
    });
  });

  describe('trackEvent', () => {
    it('should accept event data and return null', async () => {
      const eventData = {
        type: 'listing_view' as const,
        listingId,
        sessionId: 'test-session-123',
        metadata: {
          userAgent: 'Test Browser',
          referrer: 'https://example.com',
          viewport: {
            width: 1920,
            height: 1080,
          },
        },
        ipAddress: '192.168.1.1',
      };

      const result = await t.mutation(api.analytics.trackEvent, eventData);

      expect(result).toBeNull();
    });

    it('should validate event type', async () => {
      await expect(
        t.mutation(api.analytics.trackEvent, {
          type: 'invalid-event-type' as any,
          sessionId: 'test-session',
          metadata: {},
        })
      ).rejects.toThrow();
    });

    it('should handle search query event metadata', async () => {
      const result = await t.mutation(api.analytics.trackEvent, {
        type: 'search_query',
        sessionId: 'test-session-456',
        metadata: {
          query: 'pizza restaurants',
          category: 'restaurants',
          location: {
            lat: 40.7589,
            lng: -73.9851,
          },
          resultCount: 15,
        },
      });

      expect(result).toBeNull();
    });

    it('should handle contact click event metadata', async () => {
      const result = await t.mutation(api.analytics.trackEvent, {
        type: 'contact_click',
        listingId,
        sessionId: 'test-session-789',
        metadata: {
          contactType: 'phone',
        },
      });

      expect(result).toBeNull();
    });

    it('should handle map interaction event metadata', async () => {
      const result = await t.mutation(api.analytics.trackEvent, {
        type: 'map_interaction',
        sessionId: 'test-session-101',
        metadata: {
          action: 'zoom',
          zoomLevel: 12,
        },
      });

      expect(result).toBeNull();
    });
  });

  describe('trackEventsBatch', () => {
    it('should accept array of events and return batch results', async () => {
      const batchData = {
        events: [
          {
            type: 'listing_view' as const,
            listingId,
            sessionId: 'batch-session-1',
            metadata: {},
          },
          {
            type: 'search_query' as const,
            sessionId: 'batch-session-2',
            metadata: {
              query: 'coffee shops',
              resultCount: 8,
            },
          },
        ],
        ipAddress: '192.168.1.1',
      };

      const result = await t.mutation(api.analytics.trackEventsBatch, batchData);

      expect(result).toHaveProperty('processed');
      expect(result).toHaveProperty('errors');
      expect(typeof result.processed).toBe('number');
      expect(typeof result.errors).toBe('number');
    });

    it('should handle empty events array', async () => {
      const result = await t.mutation(api.analytics.trackEventsBatch, {
        events: [],
      });

      expect(result.processed).toBe(0);
      expect(result.errors).toBe(0);
    });
  });
});
