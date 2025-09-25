/**
 * Convex Functions: Business Directory Homepage API
 *
 * Specialized functions for the LocalBiz homepage including featured businesses,
 * popular categories, and search functionality.
 *
 * Currently using mock data for demonstration purposes.
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

// Validators (updated for mock data compatibility)
const businessCardValidator = v.object({
  _id: v.string(), // Changed from v.id("listings") to v.string() for mock data
  name: v.string(),
  description: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  categories: v.array(v.string()), // Changed from v.array(v.id("categories")) to v.array(v.string())
  location: v.object({
    lat: v.number(),
    lng: v.number(),
  }),
  address: v.object({
    line1: v.string(),
    city: v.string(),
    region: v.string(),
    postalCode: v.string(),
    country: v.string(),
  }),
  views: v.number(),
});

const categoryCardValidator = v.object({
  _id: v.string(), // Changed from v.id("categories") to v.string() for mock data
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  listingCount: v.number(),
  imageUrl: v.optional(v.string()),
});

/**
 * Get featured businesses for homepage
 * Returns top-rated or most viewed businesses
 * Currently using mock data for demonstration
 */
export const getFeaturedBusinesses = query({
  args: {
    limit: v.optional(v.number()),
    categoryId: v.optional(v.string())
  },
  returns: v.array(businessCardValidator),
  handler: async (_ctx, args) => {
    const limit = args.limit || 8;

    // Mock data for featured businesses
    const mockBusinesses = [
      {
        _id: "business-1",
        name: "The Cozy Corner Cafe",
        description: "A charming cafe with a warm atmosphere, serving artisanal coffee and fresh pastries daily.",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDanNGuzgepwuU-SRHcBo33f8hX6SQEehZLh87Tze7izia_TCsJ5Tdrb7G4w_WKzxksDVtqxTXDCUcnqO8hvxSOxja-kWFn6vmZz-wbf-nZlCHQ-TBehUqhzY6JOuZSwA5v7k0L3_ERg3dKSoa1L8eSM2araJtXdjsoZOdIYeXUFkU_NkcFMDpsUkrX9EfxYUgnkWgVbExAYtz-GrpdLKdUX0-NCe9D1gTaX_mqSrDSD6SGTlrFpPJJC5lAMJWivYpFQedbiFQllzdL",
        categories: ["restaurants"],
        location: { lat: 40.7128, lng: -74.0060 },
        address: {
          line1: "123 Main Street",
          city: "New York",
          region: "NY",
          postalCode: "10001",
          country: "USA"
        },
        views: 1250,
      },
      {
        _id: "business-2",
        name: "AutoFix Mechanics",
        description: "Expert auto repair services for all makes and models. Certified technicians with 20+ years experience.",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB25r3GgIzGp5iWeBBDpX5lgPVfTiqABcz0BOx38jm66EWzJxOIJJCL64eYPyTZ15X8Xmb8GKwWbV8Zqz0BVWu9mXbKNDXXcqV6kyZmrTSeo_yx4mnX10j8zatWbFbulh4Om7VOsmOAMhsR-zCYfdu1q-5H7fbmxFRsN-QKJHH_5McmeVZVOsu98zuCn-15VvgDDJTfy6UbG36exIifYuvVICeoC1Yon0Kip0183piGYMQDaaCo_BjCzxwwGwQajekiDKXICubMsFyV",
        categories: ["automotive"],
        location: { lat: 40.7589, lng: -73.9851 },
        address: {
          line1: "456 Garage Ave",
          city: "New York",
          region: "NY",
          postalCode: "10002",
          country: "USA"
        },
        views: 890,
      },
      {
        _id: "business-3",
        name: "Glamour Hair Studio",
        description: "Modern salon offering the latest hair and beauty treatments. Expert stylists and premium products.",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBaQxLwimoQDAnpgdfT3kKnzVe_t86Vin4Deab4mtfGrjThSy818wiK5zl5Zq-k3Bv6Fa45EdCHaTDLYE9b1Q8qhaaBUSAzZwjQUnyb_GETV4Se_RY263Rw9HlCwk6IzMtOjpW85N4RyIwrgyFpwsAi4IOqegegXz6BDmAFQM2UU6wJYjN8jQgOSmcq4W9kYcJLnO41yk2g-QnhKiEtQUEx1XSC6d0hwJzz1dMtBBAmEm_LYUNrBAhirwG824uvGrjqxcRVXlOV1uYn",
        categories: ["beauty-spas"],
        location: { lat: 40.7505, lng: -73.9934 },
        address: {
          line1: "789 Beauty Blvd",
          city: "New York",
          region: "NY",
          postalCode: "10003",
          country: "USA"
        },
        views: 1450,
      },
      {
        _id: "business-4",
        name: "Sweet Delights Bakery",
        description: "Artisan bakery with fresh, daily baked goods. Specializing in custom cakes and European pastries.",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD16viCbT97AZzVB_yKDUVmm-M9wqf9oZwPHDZGFQ3cpepLJT6qFIue0_sk1YHqBf57tbyV18jACkSWOiB6-zVWm7gt0wtm-jXzgV3KUj3h67lVlYA1eJEDh4YQ4y0YkGHqKC1wGSS7H5YUVKYNunRdLoWwkWzVZNA1Rrq4DKoiftTLkhPPX_Hcly2I-wRLrsh8KfbbYbV_4fIPioxnIDhDAR-H32ZR7znUd9QJwY5Chos5ScO8T-wKbZIZOPEXmRuriJxLRVIIu_2R",
        categories: ["restaurants"],
        location: { lat: 40.7282, lng: -74.0776 },
        address: {
          line1: "321 Pastry Lane",
          city: "New York",
          region: "NY",
          postalCode: "10004",
          country: "USA"
        },
        views: 2100,
      },
      {
        _id: "business-5",
        name: "TechFix Solutions",
        description: "Professional computer and smartphone repair services. Quick turnaround and warranty on all repairs.",
        imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop",
        categories: ["professional-services"],
        location: { lat: 40.7614, lng: -73.9776 },
        address: {
          line1: "567 Tech Street",
          city: "New York",
          region: "NY",
          postalCode: "10005",
          country: "USA"
        },
        views: 750,
      },
      {
        _id: "business-6",
        name: "Green Thumb Landscaping",
        description: "Complete landscaping and garden maintenance services. Transform your outdoor space with our experts.",
        imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
        categories: ["home-services"],
        location: { lat: 40.7831, lng: -73.9712 },
        address: {
          line1: "890 Garden Way",
          city: "New York",
          region: "NY",
          postalCode: "10006",
          country: "USA"
        },
        views: 680,
      },
      {
        _id: "business-7",
        name: "Downtown Dental Care",
        description: "Modern dental practice offering comprehensive oral health services. Gentle care with latest technology.",
        imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=300&fit=crop",
        categories: ["health-medical"],
        location: { lat: 40.7484, lng: -73.9857 },
        address: {
          line1: "234 Dental Drive",
          city: "New York",
          region: "NY",
          postalCode: "10007",
          country: "USA"
        },
        views: 920,
      },
      {
        _id: "business-8",
        name: "Fitness First Gym",
        description: "State-of-the-art fitness facility with personal trainers, group classes, and modern equipment.",
        imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop",
        categories: ["health-medical"],
        location: { lat: 40.7549, lng: -73.9840 },
        address: {
          line1: "345 Fitness Blvd",
          city: "New York",
          region: "NY",
          postalCode: "10008",
          country: "USA"
        },
        views: 1340,
      }
    ];

    // Filter by category if specified
    let filteredBusinesses = mockBusinesses;
    if (args.categoryId) {
      filteredBusinesses = mockBusinesses.filter(business =>
        business.categories.includes(args.categoryId!)
      );
    }

    // Sort by views (most popular first) and take the top results
    return filteredBusinesses
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  },
});

/**
 * Get popular categories for homepage
 * Returns categories with the most listings
 * Currently using mock data for demonstration
 */
export const getPopularCategories = query({
  args: {
    limit: v.optional(v.number()),
    parentOnly: v.optional(v.boolean())
  },
  returns: v.array(categoryCardValidator),
  handler: async (_ctx, args) => {
    const limit = args.limit || 6;

    // Mock data for popular categories
    const mockCategories = [
      {
        _id: "category-1",
        name: "Restaurants",
        slug: "restaurants",
        description: "Dining establishments, cafes, and food services",
        listingCount: 1247,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmyPWFdYKKBXX3_ioMw4F7A6TVw7pI8ArMZfsieIEBXRRb_TRnV-H6c1uLebemK9hEpBIi8ZHeH0o0dQe6cGwGyAe6X9-KRWdHF9thegpfN_kUSX63wg9Vr_KQ_s_7IYUsCX1TnWK5ES-A2GUD0jWz0jX6HnHANwEnIGEeNDo9AO_4VpQJAGfQacmblLPY-pw4EbMYhGktYIlXY0-CYe6iXnzdfanO_eiaKLLVNxSzzGUhVIYckinXsaA4t4ojTU4p4TbDlufNI9ZS"
      },
      {
        _id: "category-2",
        name: "Home Services",
        slug: "home-services",
        description: "Contractors, repairs, and home improvement services",
        listingCount: 892,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5mmF6rsg010ZMovdwGxRG2GA2AXlQjcq2ZPwTCTV6sCVS-mW6K0s63TGhkzed-Lvihqin5gcUE8q835FaCwYhmIzbQk2tAfmabOto7x-qMEPfsTlw22CFz_JA-43X1mN6rVXawWc5Y_25SJpDjXF_20B0s1azkZT4xm7O-MBHWCH2-2Fps2Nh6x5c2M8adPUL21G46PpNpC3CwIvKryknHVvQZBsHlUHp0P7425YFFCrxKjrtjMXcQFM8ccNx3uPNXR43Q_UyKaHV"
      },
      {
        _id: "category-3",
        name: "Beauty & Spas",
        slug: "beauty-spas",
        description: "Salons, spas, and personal care services",
        listingCount: 634,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvWDXPsppfC1z4o7bv_2B2AlcSOS7rYcvVobpvpDgE_B96-sHIv_kYrTASxZl3cb-1enuP74c7aGUB4i3boF5IcgV5aWm0R1kKfIPBWS7FjvQ6s_O0UPms3uziesufReV22N2fCUIzqY7wjDqP235l1xWwJCIiLae_AfsZG8Gr6GEpMKMFLJAXnVIwiPGoZ9HGWR4aUiW8PYGlrc416oOCNGDT--aXYm87EO_7qTXopYcMpBxTPOa29qxg_y0UydA0FRhKsaQdiz6t"
      },
      {
        _id: "category-4",
        name: "Automotive",
        slug: "automotive",
        description: "Auto repair, dealerships, and automotive services",
        listingCount: 456,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAU5QAHA4PE9eNNvs0yjO3mS1mzs6p_3Nyxjmr9gTxV5pYBfQJs0DcBVcIBvv43JK5yj1PFWXK3fOr8_6y0qd3QxFo6jpTgAs2Tw0ylT60leU2rnHpEGz4vGY-Hg4EKmlwEeVhSv4iV3tcD18fl1SD9LhKGCP7K5T2B1ndC8QbU485guVytxswE_wObZi7U_l1lu-FEDrrnKVhZmhjoxNl-dF8bA0ytj9UYgdrhB9n5U-jqQVxF9QFXtnldTyTStEkFXa0yLGi7QZix"
      },
      {
        _id: "category-5",
        name: "Health & Medical",
        slug: "health-medical",
        description: "Healthcare providers, medical services, and wellness",
        listingCount: 723,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwlpvjAKwURjPR_afAmTcCkiSXHFDH2tVbMXiHKBkIouJDqeitmo_6C9eU2HzXsSZIEYD1BbLzE3iilbvicDbrthDEqtSeVIR8iRWn6LPEh5myXdlngtnQJAOaDD3NtWlcptmXi1g9rudD29krsC9NZFMxMCVCiEQ-snrwl0FmUTXD8Ncu3XJ7K3Jw76SqkEwbE0WT4ZEl-R8KPTiYNidFrETPh2dgDQopXY_z8zBYgQI8O_gmVfNZcEnwmk3hzOA9bnGIbiI4QYtq"
      },
      {
        _id: "category-6",
        name: "Professional Services",
        slug: "professional-services",
        description: "Legal, financial, consulting, and business services",
        listingCount: 589,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAVNP6D6aKGejyRsrRRRK-PqHO1LfphtxCT7R7wugAYBTLi5tFoeBeQxmkxB2UpsqSEw61S3OPzlxOKmyhpsO7txR71r1Aq0GR2_UhGztxeYzxw7dD84Cz3hVslJBbAE6Jp4bmw8CclIcrje0s_Na2hOhVaFjQ_9hrLJBK92YMGm4S6y_ZEhUbAP5qgrLL4-qdnqfuewzKuG2eRsIrniKUmL6pAodRezF62WEOtxnlVYTZCZ3pvVvRs6qH8yXVh1aVyJVI6c5T2ShvB"
      }
    ];

    // Sort by listing count (most popular first) and take the top results
    return mockCategories
      .sort((a, b) => b.listingCount - a.listingCount)
      .slice(0, limit);
  },
});

/**
 * Search businesses for homepage search functionality
 * Currently using mock data for demonstration
 */
export const searchBusinesses = query({
  args: {
    query: v.string(),
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
      radius: v.optional(v.number()), // in kilometers
    })),
    categoryId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(businessCardValidator),
  handler: async (_ctx, args) => {
    const limit = args.limit || 20;
    const searchTerm = args.query.toLowerCase().trim();

    if (!searchTerm) {
      return [];
    }

    // Mock businesses data (same as in getFeaturedBusinesses)
    const mockBusinesses = [
      {
        _id: "business-1",
        name: "The Cozy Corner Cafe",
        description: "A charming cafe with a warm atmosphere, serving artisanal coffee and fresh pastries daily.",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDanNGuzgepwuU-SRHcBo33f8hX6SQEehZLh87Tze7izia_TCsJ5Tdrb7G4w_WKzxksDVtqxTXDCUcnqO8hvxSOxja-kWFn6vmZz-wbf-nZlCHQ-TBehUqhzY6JOuZSwA5v7k0L3_ERg3dKSoa1L8eSM2araJtXdjsoZOdIYeXUFkU_NkcFMDpsUkrX9EfxYUgnkWgVbExAYtz-GrpdLKdUX0-NCe9D1gTaX_mqSrDSD6SGTlrFpPJJC5lAMJWivYpFQedbiFQllzdL",
        categories: ["restaurants"],
        location: { lat: 40.7128, lng: -74.0060 },
        address: {
          line1: "123 Main Street",
          city: "New York",
          region: "NY",
          postalCode: "10001",
          country: "USA"
        },
        views: 1250,
      },
      {
        _id: "business-2",
        name: "AutoFix Mechanics",
        description: "Expert auto repair services for all makes and models. Certified technicians with 20+ years experience.",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB25r3GgIzGp5iWeBBDpX5lgPVfTiqABcz0BOx38jm66EWzJxOIJJCL64eYPyTZ15X8Xmb8GKwWbV8Zqz0BVWu9mXbKNDXXcqV6kyZmrTSeo_yx4mnX10j8zatWbFbulh4Om7VOsmOAMhsR-zCYfdu1q-5H7fbmxFRsN-QKJHH_5McmeVZVOsu98zuCn-15VvgDDJTfy6UbG36exIifYuvVICeoC1Yon0Kip0183piGYMQDaaCo_BjCzxwwGwQajekiDKXICubMsFyV",
        categories: ["automotive"],
        location: { lat: 40.7589, lng: -73.9851 },
        address: {
          line1: "456 Garage Ave",
          city: "New York",
          region: "NY",
          postalCode: "10002",
          country: "USA"
        },
        views: 890,
      },
      {
        _id: "business-3",
        name: "Glamour Hair Studio",
        description: "Modern salon offering the latest hair and beauty treatments. Expert stylists and premium products.",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBaQxLwimoQDAnpgdfT3kKnzVe_t86Vin4Deab4mtfGrjThSy818wiK5zl5Zq-k3Bv6Fa45EdCHaTDLYE9b1Q8qhaaBUSAzZwjQUnyb_GETV4Se_RY263Rw9HlCwk6IzMtOjpW85N4RyIwrgyFpwsAi4IOqegegXz6BDmAFQM2UU6wJYjN8jQgOSmcq4W9kYcJLnO41yk2g-QnhKiEtQUEx1XSC6d0hwJzz1dMtBBAmEm_LYUNrBAhirwG824uvGrjqxcRVXlOV1uYn",
        categories: ["beauty-spas"],
        location: { lat: 40.7505, lng: -73.9934 },
        address: {
          line1: "789 Beauty Blvd",
          city: "New York",
          region: "NY",
          postalCode: "10003",
          country: "USA"
        },
        views: 1450,
      },
      {
        _id: "business-4",
        name: "Sweet Delights Bakery",
        description: "Artisan bakery with fresh, daily baked goods. Specializing in custom cakes and European pastries.",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD16viCbT97AZzVB_yKDUVmm-M9wqf9oZwPHDZGFQ3cpepLJT6qFIue0_sk1YHqBf57tbyV18jACkSWOiB6-zVWm7gt0wtm-jXzgV3KUj3h67lVlYA1eJEDh4YQ4y0YkGHqKC1wGSS7H5YUVKYNunRdLoWwkWzVZNA1Rrq4DKoiftTLkhPPX_Hcly2I-wRLrsh8KfbbYbV_4fIPioxnIDhDAR-H32ZR7znUd9QJwY5Chos5ScO8T-wKbZIZOPEXmRuriJxLRVIIu_2R",
        categories: ["restaurants"],
        location: { lat: 40.7282, lng: -74.0776 },
        address: {
          line1: "321 Pastry Lane",
          city: "New York",
          region: "NY",
          postalCode: "10004",
          country: "USA"
        },
        views: 2100,
      },
      {
        _id: "business-5",
        name: "TechFix Solutions",
        description: "Professional computer and smartphone repair services. Quick turnaround and warranty on all repairs.",
        imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop",
        categories: ["professional-services"],
        location: { lat: 40.7614, lng: -73.9776 },
        address: {
          line1: "567 Tech Street",
          city: "New York",
          region: "NY",
          postalCode: "10005",
          country: "USA"
        },
        views: 750,
      }
    ];

    // Apply text search filter
    let filteredBusinesses = mockBusinesses.filter(business =>
      business.name.toLowerCase().includes(searchTerm) ||
      business.description.toLowerCase().includes(searchTerm) ||
      business.address.city.toLowerCase().includes(searchTerm) ||
      business.address.region.toLowerCase().includes(searchTerm)
    );

    // Apply category filter
    if (args.categoryId) {
      filteredBusinesses = filteredBusinesses.filter(business =>
        business.categories.includes(args.categoryId!)
      );
    }

    // Sort by relevance (views) and take the top results
    return filteredBusinesses
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  },
});

/**
 * Get businesses near a location for map display
 */
export const getBusinessesNearLocation = query({
  args: {
    lat: v.number(),
    lng: v.number(),
    radius: v.optional(v.number()), // in kilometers
    categoryId: v.optional(v.id("categories")),
    limit: v.optional(v.number()),
  },
  returns: v.array(businessCardValidator),
  handler: async (ctx, args) => {
    const radius = args.radius || 5; // Default 5km radius
    const limit = args.limit || 50;
    
    // Get approved listings
    let listings = await ctx.db.query("listings")
      .withIndex("byStatus", (q) => q.eq("status", "approved"))
      .collect();
    
    // Apply category filter
    if (args.categoryId) {
      listings = listings.filter(listing =>
        listing.categories.includes(args.categoryId!)
      );
    }
    
    // Filter by location radius
    listings = listings.filter(listing => {
      const distance = calculateDistance(
        args.lat,
        args.lng,
        listing.location.lat,
        listing.location.lng
      );
      return distance <= radius;
    });
    
    // Sort by distance
    listings.sort((a, b) => {
      const distanceA = calculateDistance(args.lat, args.lng, a.location.lat, a.location.lng);
      const distanceB = calculateDistance(args.lat, args.lng, b.location.lat, b.location.lng);
      return distanceA - distanceB;
    });
    
    // Take the closest results
    const results = listings.slice(0, limit);
    
    // Transform to business card format
    return results.map(listing => ({
      _id: listing._id,
      name: listing.name,
      description: listing.description,
      imageUrl: listing.images.length > 0 ? `/api/image/${listing.images[0]}` : undefined,
      categories: listing.categories,
      location: listing.location,
      address: listing.address,
      views: listing.views,
    }));
  },
});

// Utility function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
