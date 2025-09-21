# Convex Function Contracts (Spec)

Note: Contracts describe function names, args, and returns with validators. Implementation is out of scope.

## Queries

### listings.search
Args:
```
{ query?: string; categorySlug?: string; geohashPrefixes?: string[]; openNow?: boolean; page?: number; pageSize?: number }
```
Returns:
```
{ items: Listing[]; total: number; page: number; pageSize: number }
```

### listings.bySlug
Args: `{ slug: string }`
Returns: `Listing | null`

### categories.list
Args: `{}`
Returns: `Category[]`

### analytics.topEvents
Args: `{ since?: number; type?: string }`
Returns: `{ events: AnalyticsEvent[] }`

## Mutations

### owners.createListing
Args:
```
{ name: string; description?: string; categories: string[]; address?: Address; location?: { lat: number; lng: number }; phone?: string; website?: string; hours?: HourRange[]; images?: string[] }
```
Returns: `{ id: Id<"listings">, status: "pending" }`

### owners.updateListing
Args: `{ id: Id<"listings">, updates: Partial<ListingUpdatable> }`
Returns: `{ ok: true }`

### admins.approveListing
Args: `{ id: Id<"listings"> }`
Returns: `{ status: "approved" }`

### admins.rejectListing
Args: `{ id: Id<"listings">, reason: string }`
Returns: `{ status: "rejected" }`

### imports.uploadCsv
Args: `{ fileUrl: string }`
Returns: `{ imported: number, duplicatesFlagged: number }`

### reviews.add (deferred phase)
Args: `{ listingId: Id<"listings">, rating: 1|2|3|4|5, text?: string }`
Returns: `{ id: Id<"reviews"> }`

## Types (informal)
```
type Address = { line1: string; city: string; region: string; postalCode: string; country: string };
type HourRange = { day: string; open: string; close: string };
```


