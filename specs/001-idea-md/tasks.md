# Tasks – Local Business Directory MVP (001-idea-md)

Legend: [P] = can run in parallel (different files)

## TDD, Dependencies, and Order
- Setup → Contract tests → Entity models → Query/mutation stubs → UI vertical slice → Integration → Polish

## Tasks

T001. Create contracts test scaffolding [P]
- Path: specs/001-idea-md/contracts/
- Action: For each contract in `convex-contracts.md`, create a failing test file under `tests/contract/` (naming `convex.listings.search.test.ts`, etc.) asserting request/response shapes.
- Notes: Use TypeScript; no implementation; import types/interfaces locally within tests.

T002. Create integration test outline for primary user story [P]
- Path: tests/integration/search-map-listing.e2e.ts
- Action: Capture steps from spec acceptance scenario #1; stub with TODO expects.
- Notes: Use Playwright pattern; do not implement selector details yet.

T003. Define Convex schema additions for listings/categories/joins/analytics
- Path: convex/schema.ts
- Action: Add tables and indexes per `data-model.md` (bySlug, byOwner, byStatus, byGeohash, category tables, join table, analytics events).
- Notes: Follow Convex validators; keep file <500 LOC.

T004. Implement Convex queries: listings.search, listings.bySlug, categories.list
- Path: convex/listings.ts (new), convex/categories.ts (new)
- Action: Implement query skeletons with args/returns validators; use indexes; return mock/empty data to satisfy contract tests initially.
- Depends on: T003, T001

T005. Implement Convex mutations: owners.createListing, owners.updateListing
- Path: convex/owners.ts (new)
- Action: Implement with validators and status=\"pending\" default; enforce required fields.
- Depends on: T003, T001

T006. Implement Convex admin mutations: admins.approveListing, admins.rejectListing
- Path: convex/admins.ts (new)
- Action: Implement transitions and reason capture; ensure role checks (Clerk claims).
- Depends on: T003, T001

T007. Implement imports.uploadCsv (stub)
- Path: convex/imports.ts (new)
- Action: Accept fileUrl; return counters; leave parsing for later phase.
- Depends on: T003, T001

T008. Add analytics logging helpers [P]
- Path: convex/analytics.ts (new)
- Action: Insert events for listing_view, search_query, contact_click, directions_click with validators.
- Depends on: T003

T009. UI: Map shell and search form (Mapbox GL JS) – visitor flow
- Path: app/(landing)/page.tsx (or new route for search), components/custom/map/Map.tsx (new), components/custom/search/SearchBar.tsx (new)
- Action: Add Mapbox GL JS map component using `NEXT_PUBLIC_MAPBOX_TOKEN`, list panel, and search input; respect design tokens; no hard-coded colors.
- Depends on: T004

T010. UI: Results list + card component
- Path: components/custom/listing/ListingCard.tsx (new), app/(landing)/results-list.tsx (new)
- Action: Render search results; card shows name, category, distance, CTA.
- Depends on: T009

T011. UI: Listing detail page
- Path: app/listing/[slug]/page.tsx
- Action: Fetch by slug; show description, hours, images, contact buttons, directions link.
- Depends on: T004

T012. UI: Owner dashboard – create/edit listing form
- Path: app/dashboard/owner/listings/(create+edit)/page.tsx
- Action: Form with validation; map pin drop; submit to owners.createListing / updateListing.
- Depends on: T005

T013. UI: Admin queue – approve/reject
- Path: app/dashboard/admin/pending/page.tsx
- Action: List pending; approve/reject with optional reason; optimistic updates.
- Depends on: T006

T014. Wire analytics events from UI [P]
- Path: relevant UI components
- Action: Fire analytics mutations on view/clicks and searches.
- Depends on: T008

T015. Tests: Make contract tests pass (iterate queries/mutations)
- Path: convex/* and tests/contract/*
- Action: Flesh implementations to satisfy tests while keeping validators and indexes.
- Depends on: T004–T008

T016. E2E test: Validate primary user story
- Path: tests/integration/search-map-listing.e2e.ts
- Action: Implement steps; verify map renders and list opens details.
- Depends on: T009–T011

T017. Polish [P]
- Path: docs + UI
- Action: Update docs (README sections), add loading/error states, accessibility checks, light/dark verification.
- Depends on: T016

## Parallel Groups Examples
- Group A [P]: T001, T002, T008 (different files)
- Group B [P]: T009, T010 (after T004)
- Group C [P]: T014, T017 (after core flows)

## Notes
- Use design system tokens everywhere.
- Convex functions must use args/returns validators and indexes.
- Keep files under 500 LOC; prefer composition.
