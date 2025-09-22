# Quickstart: Local Business Directory MVP

**Date**: 2025-09-22  
**Phase**: 1 - Design  
**Purpose**: Integration test scenarios and validation steps

## Prerequisites

### Environment Setup
```bash
# Install additional dependencies
npm install mapbox-gl @types/mapbox-gl supercluster @types/supercluster

# Add environment variable
echo "NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk_your_token_here" >> .env.local

# Restart Convex development
npx convex dev
```

### Database Schema Migration
```bash
# Apply new schema (convex/schema.ts)
# Convex will automatically migrate when schema changes are pushed
npx convex dev
```

## Core User Flows (Integration Tests)

### 1. Visitor Discovery Flow
**Scenario**: Anonymous visitor searches for nearby restaurants

```typescript
// Test Steps:
1. Visit homepage at "/"
2. Allow geolocation when prompted
3. Search for "restaurants" in search box
4. Verify map shows clustered pins
5. Verify list shows results sorted by distance
6. Click on a listing pin on map
7. Verify listing detail popup appears
8. Click "Get Directions" button
9. Verify external maps app opens
10. Click phone number
11. Verify phone app opens or number copies

// Expected Results:
- Map centers on user location
- Search returns relevant restaurants within 25km
- List view synchronizes with map viewport
- All contact actions work properly
- Analytics events are tracked
```

### 2. Owner Registration & Listing Creation
**Scenario**: Business owner creates new listing

```typescript
// Test Steps:
1. Visit "/dashboard" (redirects to Clerk sign-up)
2. Sign up with email/password
3. Complete Clerk onboarding
4. Redirected to owner dashboard
5. Click "Add New Listing" button
6. Fill out listing form:
   - Name: "Joe's Pizza"
   - Description: "Best pizza in town"
   - Phone: "+1-555-123-4567"
   - Address: "123 Main St, Anytown, ST 12345"
   - Category: "Restaurants > Pizza"
   - Hours: Mon-Fri 11am-10pm
   - Upload 2 images
7. Click "Submit for Review"
8. Verify listing appears in "My Listings" with "Pending" status
9. Verify confirmation message shown

// Expected Results:
- User role set to "owner" in database
- Listing created with status "pending"
- Images processed and variants created
- Owner receives submission confirmation
- Admin moderation queue updated
```

### 3. Admin Moderation Flow
**Scenario**: Admin reviews and approves pending listing

```typescript
// Test Steps:
1. Sign in as admin user
2. Visit "/admin/moderation"
3. Verify "Joe's Pizza" appears in pending queue
4. Click on listing to review details
5. Verify all information displays correctly
6. Verify images load properly
7. Click "Approve" button
8. Add approval note: "All information verified"
9. Confirm approval action
10. Verify listing disappears from pending queue
11. Search for "Joe's Pizza" as visitor
12. Verify listing appears in search results
13. Verify owner dashboard shows "Approved" status

// Expected Results:
- Listing status changed to "approved"
- Listing becomes publicly visible
- Owner receives approval notification
- Moderation log entry created
- Analytics tracking begins
```

### 4. Real-time Search & Map Interaction
**Scenario**: Interactive map search with live updates

```typescript
// Test Steps:
1. Visit homepage
2. Set location to "New York, NY"
3. Zoom map to street level
4. Pan map to different area
5. Verify list updates with new results
6. Use category filter "Restaurants"
7. Verify map pins and list filter accordingly
8. Toggle "Open Now" filter
9. Verify results update based on business hours
10. Search for "pizza"
11. Verify text search combines with map bounds
12. Click cluster on map
13. Verify cluster expands to individual pins

// Expected Results:
- List synchronizes with map viewport changes
- Filters apply to both map and list
- Search combines text, location, and filters
- Map clustering works smoothly
- Performance stays responsive (< 1 second updates)
```

### 5. Mobile Responsive Experience
**Scenario**: Full functionality on mobile device

```typescript
// Test Steps:
1. Open site on mobile device (or DevTools mobile view)
2. Verify map renders properly on small screen
3. Test touch gestures: pinch zoom, pan, tap
4. Verify list view scrolls smoothly
5. Test search interface on mobile
6. Verify listing detail modal fits screen
7. Test contact actions (call, directions)
8. Verify form inputs work with mobile keyboard
9. Test image upload from mobile camera
10. Verify navigation menu works on mobile

// Expected Results:
- All features work on mobile
- Touch gestures are responsive
- UI adapts to screen size
- Performance remains good
- No horizontal scrolling
```

## Validation Checklist

### Functional Validation
- [ ] **Search**: Text + location + filters work together
- [ ] **Map**: Clustering, panning, zooming, pin interactions
- [ ] **Authentication**: Clerk integration, role assignment
- [ ] **Moderation**: Admin approval/rejection workflow
- [ ] **Real-time**: Live updates via Convex queries
- [ ] **Analytics**: Event tracking for all interactions
- [ ] **Images**: Upload, processing, variants, display
- [ ] **Mobile**: Responsive design, touch interactions

### Performance Validation
- [ ] **Search Latency**: P95 < 800ms for search results
- [ ] **Map Rendering**: Smooth 60fps interactions
- [ ] **Image Loading**: Progressive loading with placeholders
- [ ] **Real-time Updates**: < 100ms for live data changes
- [ ] **Bundle Size**: Mapbox adds < 500KB to bundle
- [ ] **Mobile Performance**: Good Lighthouse scores

### Security Validation
- [ ] **Authentication**: Only owners can edit their listings
- [ ] **Authorization**: Only admins can moderate
- [ ] **Input Validation**: All forms validate with Zod
- [ ] **Rate Limiting**: Search endpoints protected
- [ ] **Image Upload**: File type and size validation
- [ ] **API Keys**: Mapbox token properly scoped

### Accessibility Validation
- [ ] **Keyboard Navigation**: All interactive elements accessible
- [ ] **Screen Readers**: ARIA labels on map and forms
- [ ] **Focus Management**: Visible focus indicators
- [ ] **Color Contrast**: Meets WCAG AA standards
- [ ] **Alt Text**: All images have descriptive alt text
- [ ] **Form Labels**: All inputs properly labeled

## Data Seeding (Development)

### Sample Categories
```typescript
const seedCategories = [
  { name: "Restaurants", subcategories: ["Pizza", "Chinese", "Italian", "Fast Food"] },
  { name: "Shopping", subcategories: ["Clothing", "Electronics", "Grocery", "Hardware"] },
  { name: "Services", subcategories: ["Hair Salon", "Auto Repair", "Cleaning", "Legal"] },
  { name: "Health", subcategories: ["Doctor", "Dentist", "Pharmacy", "Fitness"] },
  { name: "Entertainment", subcategories: ["Movie Theater", "Bar", "Museum", "Park"] }
];
```

### Sample Listings
```typescript
const seedListings = [
  {
    name: "Mario's Pizza Palace",
    description: "Authentic Italian pizza since 1985",
    phone: "+1-555-PIZZA-1",
    website: "https://mariospizza.com",
    address: "123 Main St, New York, NY 10001",
    location: { lat: 40.7589, lng: -73.9851 },
    categories: ["Restaurants", "Pizza"],
    hours: "Mon-Sun 11:00-23:00",
    status: "approved"
  },
  // Add 20-30 more sample listings across different categories and locations
];
```

## Performance Benchmarks

### Target Metrics
- **Search Response**: < 800ms P95
- **Map Interactions**: 60fps smooth
- **Page Load**: < 3s First Contentful Paint
- **Bundle Size**: < 2MB total JavaScript
- **Mobile Score**: > 90 Lighthouse Performance

### Monitoring Setup
```typescript
// Analytics events to track performance
const performanceEvents = [
  "search_start", "search_complete", "search_error",
  "map_load", "map_interaction", "map_cluster_expand",
  "listing_view", "contact_click", "image_load"
];
```

## Deployment Checklist

### Pre-deployment
- [ ] All tests pass
- [ ] Performance benchmarks met
- [ ] Security scan clean
- [ ] Accessibility audit passed
- [ ] Mobile testing complete
- [ ] Environment variables configured

### Post-deployment
- [ ] Health checks passing
- [ ] Analytics tracking working
- [ ] Real-time updates functioning
- [ ] Image uploads working
- [ ] Search performance acceptable
- [ ] Admin functions accessible

## Success Criteria

### MVP Launch Ready When:
1. **Core Flows Complete**: All 5 user flows work end-to-end
2. **Performance Acceptable**: All benchmarks met
3. **Security Validated**: No critical vulnerabilities
4. **Mobile Optimized**: Full functionality on mobile
5. **Admin Tools Working**: Moderation workflow functional
6. **Analytics Tracking**: All events captured properly

### Post-Launch Metrics to Monitor:
- Search success rate (non-zero results)
- Listing approval time (target < 48 hours)
- User engagement (views per session)
- Contact conversion rate (clicks per view)
- System performance (response times)
- Error rates (< 1% for core flows)
