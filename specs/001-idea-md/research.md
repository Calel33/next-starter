# Research: Local Business Directory MVP

**Date**: 2025-09-22  
**Phase**: 0 - Research & Technical Analysis  
**Status**: Complete

## Research Tasks Completed

### 1. Mapbox GL JS Integration with Next.js 15 + React 19

**Decision**: Use Mapbox GL JS v3.x with React wrapper components
**Rationale**: 
- Native WebGL performance for smooth map interactions
- Excellent mobile support and touch gestures
- Rich clustering and custom marker capabilities
- Strong TypeScript support
- Compatible with React 19 and Next.js 15 SSR

**Integration Approach**:
- Install `mapbox-gl` and `@types/mapbox-gl` packages
- Create custom React hook `useMapbox` for map instance management
- Implement dynamic import to avoid SSR issues
- Use environment variable for API key management

**Alternatives Considered**:
- Google Maps API: More expensive, less customization
- Leaflet: Less performant for large datasets, limited mobile experience
- React Map GL: Additional abstraction layer, potential React 19 compatibility issues

### 2. Geolocation and Address Handling

**Decision**: Combine browser geolocation with Mapbox Geocoding API
**Rationale**:
- Browser geolocation for initial user positioning
- Mapbox Geocoding for address search and reverse geocoding
- Consistent data source with mapping service
- Built-in address validation and normalization

**Implementation**:
- Custom hook `useGeolocation` with permission handling
- Geocoding service wrapper with caching
- Address validation using Mapbox place types
- Fallback to manual location entry

### 3. Search and Filtering Architecture

**Decision**: Convex queries with spatial indexing simulation
**Rationale**:
- Convex doesn't have native spatial indexes, but can simulate with bounding box queries
- Real-time updates automatically handled by Convex
- Combine text search with geographical bounds
- Client-side distance calculation for sorting

**Search Strategy**:
- Primary index: `byLocationBounds` on lat/lng ranges
- Secondary indexes: `byCategory`, `byStatus`, `byName`
- Client-side Haversine distance calculation
- Debounced search with 300ms delay

### 4. Image Upload and Management

**Decision**: Convex file storage with client-side resizing
**Rationale**:
- Convex provides built-in file storage
- Client-side resizing reduces bandwidth and storage costs
- Automatic CDN distribution
- Integrated with authentication system

**Implementation**:
- Browser-based image resizing using Canvas API
- Multiple size variants (thumbnail, medium, full)
- Upload progress indicators
- Image validation (type, size, dimensions)

### 5. Real-time Clustering and Performance

**Decision**: Client-side clustering with Mapbox Supercluster
**Rationale**:
- Mapbox native clustering for optimal performance
- Reduces API calls by clustering on client
- Smooth zoom transitions
- Configurable cluster radius and zoom levels

**Performance Optimizations**:
- Viewport-based data loading
- Debounced map move events
- Clustering with zoom-dependent radius
- Virtual scrolling for list view

### 6. Authentication and Authorization

**Decision**: Extend existing Clerk setup with custom roles
**Rationale**:
- Leverage existing Clerk authentication
- Add custom metadata for user roles (visitor, owner, admin)
- Convex authorization using Clerk JWT claims
- Role-based UI and API access control

**Role Structure**:
- `visitor`: Browse and search (no auth required)
- `owner`: Manage own listings (authenticated)
- `admin`: Approve listings, manage categories (custom role)

### 7. Moderation Workflow

**Decision**: Status-based workflow with Convex mutations
**Rationale**:
- Simple state machine: pending → approved/rejected
- Real-time status updates for owners
- Admin queue with filtering and bulk actions
- Audit trail for moderation decisions

**States**: `pending`, `approved`, `rejected`, `archived`
**Transitions**: Owner submit → pending, Admin approve/reject, Owner edit → pending (if previously approved)

## Technical Decisions Summary

| Component | Technology | Justification |
|-----------|------------|---------------|
| Mapping | Mapbox GL JS v3.x | Performance, mobile support, clustering |
| Geocoding | Mapbox Geocoding API | Consistency with mapping, address validation |
| Spatial Search | Convex + bounding box queries | Real-time updates, existing stack integration |
| Image Storage | Convex file storage | Built-in CDN, authentication integration |
| Clustering | Mapbox Supercluster | Native performance, smooth interactions |
| Authentication | Clerk + custom roles | Extends existing setup, role-based access |
| State Management | Convex queries/mutations | Real-time updates, consistent with stack |

## Dependencies to Add

```json
{
  "mapbox-gl": "^3.0.1",
  "@types/mapbox-gl": "^3.0.0",
  "supercluster": "^8.0.1",
  "@types/supercluster": "^7.1.3"
}
```

## Environment Variables Required

```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk_...
```

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Mapbox API costs | Medium | Implement request caching, optimize API calls |
| Large dataset performance | High | Viewport-based loading, clustering, pagination |
| Mobile map performance | Medium | Optimize touch handlers, reduce DOM updates |
| Geolocation privacy | Low | Clear permissions UI, manual fallback |

## Next Phase Requirements

All technical unknowns resolved. Ready for Phase 1 design phase with:
- Clear technology choices
- Performance strategy defined
- Integration approach established
- Risk mitigation planned
