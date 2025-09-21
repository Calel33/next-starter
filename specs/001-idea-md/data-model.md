# Data Model – Local Business Directory

## Entities

### Listing
- id (Convex id("listings"))
- ownerId (id("users"))
- name (string)
- slug (string)
- description (string)
- categories (string[] or relation via ListingCategory)
- address: line1, city, region, postalCode, country (strings)
- location: lat (number), lng (number)
- phone (string | null)
- website (string | null)
- hours: [{ day: "mon"|... , open: "HH:mm", close: "HH:mm" }]
- images: string[] (references to storage)
- status: "pending" | "approved" | "rejected" | "archived"
- createdAt (number|ISO string)
- updatedAt (number|ISO string)
- views (number)
- clicks: { phone: number; website: number }

Indexes (Convex):
- bySlug(slug)
- byOwner(ownerId)
- byStatus(status)
- byGeohash(geohashPrefix) – for map search buckets

### Category
- id (id("categories"))
- name (string)
- slug (string)

Indexes:
- bySlug(slug)

### ListingCategory (join)
- id
- listingId (id("listings"))
- categoryId (id("categories"))

Indexes:
- byListing(listingId)
- byCategory(categoryId)

### Owner (extends existing users)
- id (id("users"))
- email (string)
- name (string)
- verificationStatus: "unverified" | "verified" | "pending"

### AnalyticsEvent
- id
- type: "listing_view" | "search_query" | "contact_click" | "directions_click"
- listingId (optional for search_query)
- metadata (object)
- createdAt (number)

Indexes:
- byType(type)
- byListing(listingId)
- byCreatedAt(createdAt)

## Validation Rules (from spec)
- Listing requires: name AND (phone OR website) AND (address OR lat/lng).
- Hours entries validated for format and non-overlap.
- Images: size/count limits; sanitize text fields.

## State Transitions
- Listing: pending → approved | rejected | archived
- Owner verification: unverified → verified (via email domain link) | pending (manual)


