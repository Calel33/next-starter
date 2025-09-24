import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { paymentAttemptSchemaValidator } from "./paymentAttemptTypes";

// Business Hours validator
const businessHoursValidator = v.array(v.object({
  day: v.union(v.literal(0), v.literal(1), v.literal(2), v.literal(3), v.literal(4), v.literal(5), v.literal(6)),
  open: v.string(),
  close: v.string(),
  closed: v.boolean(),
}));

// Address validator
const addressValidator = v.object({
  line1: v.string(),
  city: v.string(),
  region: v.string(),
  postalCode: v.string(),
  country: v.string(),
});

// Location validator
const locationValidator = v.object({
  lat: v.number(),
  lng: v.number(),
});

export default defineSchema({
    // Existing tables
    users: defineTable({
      name: v.string(),
      // this the Clerk ID, stored in the subject JWT field
      externalId: v.string(),
      // New fields for business directory
      role: v.optional(v.union(v.literal("visitor"), v.literal("owner"), v.literal("admin"))),
      email: v.optional(v.string()),
      businessName: v.optional(v.string()),
      verificationStatus: v.optional(v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected"))),
      verificationMethod: v.optional(v.union(v.literal("email"), v.literal("phone"), v.literal("manual"))),
      defaultLocation: v.optional(v.object({
        lat: v.number(),
        lng: v.number(),
        address: v.string(),
      })),
      lastLoginAt: v.optional(v.number()),
      listingCount: v.optional(v.number()),
    }).index("byExternalId", ["externalId"])
      .index("byRole", ["role"])
      .index("byVerificationStatus", ["verificationStatus"]),

    paymentAttempts: defineTable(paymentAttemptSchemaValidator)
      .index("byPaymentId", ["payment_id"])
      .index("byUserId", ["userId"])
      .index("byPayerUserId", ["payer.user_id"]),

    // New tables for business directory
    listings: defineTable({
      // Core Information
      name: v.string(),
      slug: v.string(),
      description: v.optional(v.string()),

      // Contact & Location
      phone: v.optional(v.string()),
      website: v.optional(v.string()),
      email: v.optional(v.string()),
      address: addressValidator,
      location: locationValidator,

      // Business Details
      categories: v.array(v.id("categories")),
      hours: v.optional(businessHoursValidator),
      images: v.array(v.id("imageAssets")),

      // Ownership & Status
      ownerId: v.optional(v.id("users")),
      status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("archived")),

      // Moderation
      moderationNotes: v.optional(v.string()),
      moderatedBy: v.optional(v.id("users")),
      moderatedAt: v.optional(v.number()),

      // Analytics
      views: v.number(),
      phoneClicks: v.number(),
      websiteClicks: v.number(),
      directionsClicks: v.number(),

      // Metadata
      lastUpdatedBy: v.optional(v.id("users")),
      updatedAt: v.number(),
    }).index("byStatus", ["status"])
      .index("byOwner", ["ownerId"])
      .index("byLocationBounds", ["location.lat", "location.lng"])
      .index("byCategory", ["categories"])
      .index("bySlug", ["slug"]),

    categories: defineTable({
      // Core Information
      name: v.string(),
      slug: v.string(),
      description: v.optional(v.string()),

      // Hierarchy
      parentId: v.optional(v.id("categories")),

      // Metadata
      isActive: v.boolean(),
      sortOrder: v.number(),
      listingCount: v.number(),

      // Management
      createdBy: v.id("users"),
      updatedAt: v.number(),
    }).index("byParent", ["parentId"])
      .index("byActive", ["isActive"])
      .index("bySortOrder", ["sortOrder"]),

    imageAssets: defineTable({
      // File Information
      storageId: v.id("_storage"),
      filename: v.string(),
      contentType: v.string(),
      size: v.number(),

      // Image Properties
      width: v.number(),
      height: v.number(),
      altText: v.optional(v.string()),

      // Variants (different sizes)
      variants: v.object({
        thumbnail: v.id("_storage"),
        medium: v.id("_storage"),
        full: v.id("_storage"),
      }),

      // Ownership
      uploadedBy: v.id("users"),
      listingId: v.optional(v.id("listings")),

      // Status
      isActive: v.boolean(),
      moderationStatus: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    }).index("byListing", ["listingId"])
      .index("byUploader", ["uploadedBy"])
      .index("byModerationStatus", ["moderationStatus"]),

    analyticsEvents: defineTable({
      // Event Information
      type: v.union(
        v.literal("listing_view"),
        v.literal("search_query"),
        v.literal("contact_click"),
        v.literal("directions_click"),
        v.literal("map_interaction")
      ),

      // Context
      listingId: v.optional(v.id("listings")),
      userId: v.optional(v.id("users")),
      sessionId: v.string(),

      // Event Data
      metadata: v.object({
        // For search_query
        query: v.optional(v.string()),
        category: v.optional(v.string()),
        location: v.optional(locationValidator),
        resultCount: v.optional(v.number()),

        // For contact_click
        contactType: v.optional(v.union(v.literal("phone"), v.literal("website"), v.literal("email"))),

        // For map_interaction
        action: v.optional(v.union(v.literal("zoom"), v.literal("pan"), v.literal("cluster_click"), v.literal("marker_click"))),
        zoomLevel: v.optional(v.number()),

        // General
        userAgent: v.optional(v.string()),
        referrer: v.optional(v.string()),
        viewport: v.optional(v.object({
          width: v.number(),
          height: v.number(),
        })),
      }),

      // Privacy
      ipHash: v.optional(v.string()),
      retentionDate: v.number(),
    }).index("byType", ["type"])
      .index("byListing", ["listingId"])
      .index("byRetentionDate", ["retentionDate"]),

    moderationLogs: defineTable({
      // Action Information
      action: v.union(v.literal("approve"), v.literal("reject"), v.literal("request_changes"), v.literal("archive"), v.literal("restore")),
      entityType: v.union(v.literal("listing"), v.literal("image"), v.literal("user")),
      entityId: v.string(),

      // Moderation Details
      moderatorId: v.id("users"),
      reason: v.optional(v.string()),
      notes: v.optional(v.string()),

      // Context
      previousStatus: v.optional(v.string()),
      newStatus: v.string(),

      // Metadata
      automated: v.boolean(),
      reviewTime: v.optional(v.number()),
    }).index("byEntity", ["entityType", "entityId"])
      .index("byModerator", ["moderatorId"]),
  });