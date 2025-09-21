# Research – Local Business Directory MVP

## Decisions

- Mapping Library: Mapbox GL JS (client-side) for interactive map, clustering, and pins.
  - Rationale: Modern vector maps, strong ecosystem, aligns with project requirement.
  - Alternatives: Google Maps, Leaflet + MapLibre (not selected to keep scope aligned).

- Geolocation Behavior: Ask for browser geolocation; fallback to manual location input.
  - Rationale: Faster time-to-first-result; graceful fallback.

- Search & Ranking: Relevance + distance with "open now" boost, P95 ≤ 800 ms.
  - Rationale: Simple, predictable; matches spec FR-020 performance target.

- Data Model: Listings, Categories (many-to-many), Owners, AnalyticsEvent.
  - Rationale: Matches user stories (visitor discovery, owner manage, admin approve).

- Moderation Workflow: Pending → Approved/Rejected with reasons; owner notified.
  - Rationale: Ensures quality and trust.

- Featured Listings: Monthly per-listing plan; top-of-list pin; max 2/page; rotation.
  - Rationale: Simple MVP monetization; capped to avoid overwhelming organic results.

- Reviews & Ratings: 1–5 stars; logged-in reviewers; post-moderation + report abuse; owner replies.
  - Rationale: Familiar UX, manageable moderation.

- Saved Lists/Accounts: Magic-link auth; Favorites only; cross-device; 24m purge.
  - Rationale: Minimal friction, simple scope.

- Analytics: listing_view, search_query, contact_click, directions_click; 12m aggregate retention.
  - Rationale: Tracks success signals while minimizing data retention.

- Data Retention: Archived listings/images 24m; DSR 30 days; backups/logs 90 days.
  - Rationale: Clear policies; operationally simple.

## Unknowns resolved (from spec)
- Claim verification method: Email link to business-domain; 48h manual fallback SLA.
- Featured pricing model & placement: Monthly per listing; top-of-list; cap 2/page.
- Reviews policy: 1–5 stars; logged-in; report abuse; owner replies; sort recent.
- Saved data scope: Favorites only.
- Ranking & latency: Relevance + distance + open-now boost; P95 ≤ 800 ms.
- Analytics KPIs: time-to-first-result, contact CTR, approvals/day.
- Retention/SLA: As above.

## Open considerations (tracked for design)
- Geospatial queries in Convex: Use geohash (or grid) prefix fields to index approximate location buckets for bounding-box searches; fetch small candidate set and refine client-side.
- Mapbox Token Security: Restrict public token by domain; consider server-proxy for heavy geocoding later.

## Summary
All NEEDS CLARIFICATION items resolved; decisions align with Constitution (KISS, vertical slices, tokens, TS, Convex validators) and project stack.


