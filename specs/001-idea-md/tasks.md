# Tasks: Local Business Directory MVP

**Input**: Design documents from `/specs/001-idea-md/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Summary
Build a local business directory MVP with Mapbox GL JS integration, real-time search, owner/admin roles, and moderation workflow using the existing Next.js 15 + Convex + Clerk stack.

**Key Technologies**: TypeScript 5.x, Next.js 15.3.5, React 19.0.0, Convex 1.25.2, Clerk 6.24.0, Mapbox GL JS, shadcn/ui, TailwindCSS v4

**Project Structure**: Web application using existing Next.js structure with integration into `app/`, `components/`, and `convex/` directories.

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Setup & Dependencies

- [ ] T001 Install Mapbox dependencies: `npm install mapbox-gl @types/mapbox-gl supercluster @types/supercluster`
- [ ] T002 [P] Add Mapbox environment variable to `.env.local`: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- [ ] T003 [P] Update TypeScript config for Mapbox types in `tsconfig.json`
- [ ] T004 [P] Configure ESLint rules for new dependencies in `.eslintrc.json`

## Phase 3.2: Database Schema & Tests (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Schema Definition
- [ ] T005 Create comprehensive Convex schema in `convex/schema.ts` with all entities: listings, categories, users (extended), imageAssets, analyticsEvents, moderationLogs

### Contract Tests (Parallel - Different Files)
- [ ] T006 [P] Contract test for listings queries in `__tests__/contracts/listings.test.ts`
- [ ] T007 [P] Contract test for listings mutations in `__tests__/contracts/listings-mutations.test.ts`
- [ ] T008 [P] Contract test for categories API in `__tests__/contracts/categories.test.ts`
- [ ] T009 [P] Contract test for images API in `__tests__/contracts/images.test.ts`
- [ ] T010 [P] Contract test for analytics API in `__tests__/contracts/analytics.test.ts`

### Integration Tests (Parallel - Different Files)
- [ ] T011 [P] Integration test: Visitor discovery flow in `__tests__/integration/visitor-discovery.test.ts`
- [ ] T012 [P] Integration test: Owner registration & listing creation in `__tests__/integration/owner-listing.test.ts`
- [ ] T013 [P] Integration test: Admin moderation workflow in `__tests__/integration/admin-moderation.test.ts`
- [ ] T014 [P] Integration test: Real-time search & map interaction in `__tests__/integration/realtime-search.test.ts`
- [ ] T015 [P] Integration test: Mobile responsive experience in `__tests__/integration/mobile-responsive.test.ts`

## Phase 3.3: Core Backend Implementation (ONLY after tests are failing)

### Convex Functions - Listings (Sequential - Same Domain)
- [ ] T016 Implement listings queries in `convex/listings.ts`: searchListings, getListing, getListingBySlug, getMyListings, getModerationQueue
- [ ] T017 Implement listings mutations in `convex/listings.ts`: createListing, updateListing, moderateListing, archiveListing, trackInteraction
- [ ] T018 Implement listings utilities in `convex/listings.ts`: generateSlug, checkDuplicates, incrementCounter, bulkImportListings

### Convex Functions - Categories (Parallel - Different File)
- [ ] T019 [P] Implement categories API in `convex/categories.ts`: getCategories, createCategory, updateCategory, deleteCategory, reorderCategories, mergeCategories

### Convex Functions - Images (Parallel - Different File)
- [ ] T020 [P] Implement images API in `convex/images.ts`: getImage, createImageAsset, moderateImage, processUploadedImage, cleanupOrphanedImages

### Convex Functions - Analytics (Parallel - Different File)
- [ ] T021 [P] Implement analytics API in `convex/analytics.ts`: trackEvent, getListingAnalytics, getOwnerAnalytics, getSystemAnalytics, cleanupExpiredEvents

### User Management Extensions (Sequential - Modifies Existing)
- [ ] T022 Extend existing users table schema in `convex/schema.ts` with business directory fields
- [ ] T023 Update existing user functions in `convex/users.ts` to support owner/admin roles

## Phase 3.4: Frontend Core Components

### Mapbox Integration (Sequential - Shared Dependencies)
- [ ] T024 Create Mapbox hook in `hooks/useMapbox.ts` for map instance management
- [ ] T025 Create geolocation hook in `hooks/useGeolocation.ts` for user positioning
- [ ] T026 Create MapboxMap component in `components/custom/MapboxMap.tsx` with clustering support

### Search & Filtering (Sequential - Shared State)
- [ ] T027 Create search hook in `hooks/useBusinessSearch.ts` for Convex queries integration
- [ ] T028 Create SearchInterface component in `components/custom/SearchInterface.tsx`
- [ ] T029 Create FilterPanel component in `components/custom/FilterPanel.tsx`
- [ ] T030 Create SearchResults component in `components/custom/SearchResults.tsx` with list/map sync

### Listing Management (Parallel - Different Components)
- [ ] T031 [P] Create ListingCard component in `components/custom/ListingCard.tsx`
- [ ] T032 [P] Create ListingDetail component in `components/custom/ListingDetail.tsx`
- [ ] T033 [P] Create ListingForm component in `components/custom/ListingForm.tsx` with Zod validation
- [ ] T034 [P] Create ImageUpload component in `components/custom/ImageUpload.tsx` with client-side resizing

### Owner Dashboard (Parallel - Different Pages)
- [ ] T035 [P] Create owner dashboard page in `app/dashboard/owner/page.tsx`
- [ ] T036 [P] Create owner listings page in `app/dashboard/owner/listings/page.tsx`
- [ ] T037 [P] Create listing creation page in `app/dashboard/owner/create/page.tsx`
- [ ] T038 [P] Create listing edit page in `app/dashboard/owner/edit/[id]/page.tsx`

### Admin Panel (Parallel - Different Pages)
- [ ] T039 [P] Create admin dashboard page in `app/dashboard/admin/page.tsx`
- [ ] T040 [P] Create moderation queue page in `app/dashboard/admin/moderation/page.tsx`
- [ ] T041 [P] Create category management page in `app/dashboard/admin/categories/page.tsx`
- [ ] T042 [P] Create analytics dashboard page in `app/dashboard/admin/analytics/page.tsx`

## Phase 3.5: Public Pages & Routes

### Public Directory Pages (Parallel - Different Routes)
- [ ] T043 [P] Create directory homepage in `app/directory/page.tsx` with search and map
- [ ] T044 [P] Create listing detail page in `app/directory/listing/[slug]/page.tsx`
- [ ] T045 [P] Create category browse page in `app/directory/category/[slug]/page.tsx`
- [ ] T046 [P] Create search results page in `app/directory/search/page.tsx`

### Navigation & Layout (Sequential - Shared Components)
- [ ] T047 Update main navigation in existing layout components to include directory links
- [ ] T048 Create directory-specific navigation in `components/custom/DirectoryNav.tsx`
- [ ] T049 Update middleware in `middleware.ts` for role-based route protection

## Phase 3.6: Authentication & Authorization

### Clerk Integration Extensions (Sequential - Shared Auth)
- [ ] T050 Extend Clerk configuration in `convex/auth.config.ts` for custom roles
- [ ] T051 Create role management utilities in `lib/auth-utils.ts`
- [ ] T052 Update user onboarding flow to assign roles based on signup context

### Route Protection (Sequential - Shared Middleware)
- [ ] T053 Implement owner route protection for dashboard pages
- [ ] T054 Implement admin route protection for admin pages
- [ ] T055 Create role-based component rendering utilities in `lib/role-utils.ts`

## Phase 3.7: Real-time & Performance

### Real-time Updates (Sequential - Shared State)
- [ ] T056 Implement real-time search results using Convex live queries
- [ ] T057 Implement real-time moderation status updates for owners
- [ ] T058 Implement real-time analytics updates for admin dashboard

### Performance Optimizations (Parallel - Different Concerns)
- [ ] T059 [P] Implement viewport-based map data loading in MapboxMap component
- [ ] T060 [P] Add debounced search with 300ms delay in search components
- [ ] T061 [P] Implement image lazy loading and progressive enhancement
- [ ] T062 [P] Add request caching for Mapbox geocoding API calls

## Phase 3.8: Mobile & Accessibility

### Mobile Optimizations (Parallel - Different Components)
- [ ] T063 [P] Optimize MapboxMap component for touch gestures and mobile performance
- [ ] T064 [P] Create mobile-specific search interface in SearchInterface component
- [ ] T065 [P] Optimize listing forms for mobile keyboard and input patterns

### Accessibility (Parallel - Different Components)
- [ ] T066 [P] Add ARIA labels and keyboard navigation to MapboxMap component
- [ ] T067 [P] Implement focus management for modal dialogs and forms
- [ ] T068 [P] Add screen reader support for search results and listing details
- [ ] T069 [P] Ensure color contrast compliance across all new components

## Phase 3.9: Analytics & Monitoring

### Event Tracking Implementation (Parallel - Different Events)
- [ ] T070 [P] Implement search analytics tracking in search components
- [ ] T071 [P] Implement listing interaction tracking (views, clicks, directions)
- [ ] T072 [P] Implement map interaction analytics (zoom, pan, cluster clicks)
- [ ] T073 [P] Implement conversion tracking for contact actions

### Rate Limiting & Security (Sequential - Shared Infrastructure)
- [ ] T074 Implement rate limiting for search endpoints using Convex
- [ ] T075 Add input validation and sanitization for all forms
- [ ] T076 Implement image upload security (type, size, content validation)

## Phase 3.10: Polish & Validation

### Error Handling (Parallel - Different Components)
- [ ] T077 [P] Add comprehensive error boundaries for map and search components
- [ ] T078 [P] Implement user-friendly error messages for API failures
- [ ] T079 [P] Add offline state handling for mobile users
- [ ] T080 [P] Implement retry mechanisms for failed image uploads

### Performance Testing (Parallel - Different Metrics)
- [ ] T081 [P] Validate search latency P95 < 800ms using performance tests
- [ ] T082 [P] Validate map interaction performance 60fps using browser tools
- [ ] T083 [P] Validate mobile performance using Lighthouse CI
- [ ] T084 [P] Validate bundle size impact < 500KB for Mapbox additions

### Final Integration (Sequential - End-to-End)
- [ ] T085 Run comprehensive integration tests from quickstart.md scenarios
- [ ] T086 Perform cross-browser testing (Chrome, Firefox, Safari, Mobile)
- [ ] T087 Execute accessibility audit using axe-core and manual testing
- [ ] T088 Validate all contract tests pass with implemented functions
- [ ] T089 Update documentation and deployment configuration

## Phase 3.11: Privacy & Legal Compliance

### Privacy Implementation (Sequential - Legal Requirements)
- [ ] T090 Create privacy policy page in `app/privacy/page.tsx` with comprehensive data handling disclosure
- [ ] T091 Create terms of service page in `app/terms/page.tsx` with usage guidelines and liability
- [ ] T092 Implement cookie consent banner in `components/custom/CookieConsent.tsx` with granular controls
- [ ] T093 Add privacy/terms links to footer in existing layout components
- [ ] T094 [P] Create data export functionality in owner dashboard for GDPR compliance
- [ ] T095 [P] Create account deletion functionality with data purge in user settings

## Dependencies

### Critical Path
- **Setup** (T001-T004) → **Schema** (T005) → **Tests** (T006-T015) → **Backend** (T016-T023) → **Frontend** (T024-T048)
- **Tests MUST fail** before any implementation begins
- **Backend functions** must be complete before frontend integration

### Blocking Dependencies
- T005 blocks T006-T015 (tests need schema)
- T006-T015 block T016-T023 (TDD approach)
- T016-T023 block T024-T048 (frontend needs backend)
- T024-T026 block T027-T030 (search needs map integration)
- T050-T052 block T053-T055 (auth setup before protection)
- T016-T021 block T056-T058 (backend before real-time)
- T090-T093 can run parallel with other frontend tasks (T043-T046)

### Parallel Execution Groups
```bash
# Group 1: Setup (can run together)
T001 & T002 & T003 & T004

# Group 2: Contract Tests (after T005)
T006 & T007 & T008 & T009 & T010

# Group 3: Integration Tests (after T005)
T011 & T012 & T013 & T014 & T015

# Group 4: Backend Functions (after tests fail)
T019 & T020 & T021  # (T016-T018 sequential, same file)

# Group 5: Frontend Components (after backend)
T031 & T032 & T033 & T034
T035 & T036 & T037 & T038
T039 & T040 & T041 & T042
T043 & T044 & T045 & T046

# Group 6: Performance & Accessibility (after core features)
T059 & T060 & T061 & T062
T063 & T064 & T065
T066 & T067 & T068 & T069
T070 & T071 & T072 & T073
T077 & T078 & T079 & T080
T081 & T082 & T083 & T084
```

## Validation Checklist
*GATE: Verify before marking complete*

- [x] All contract files have corresponding test tasks
- [x] All entities from data-model.md have implementation tasks  
- [x] All integration scenarios from quickstart.md have test tasks
- [x] Tests come before implementation (TDD enforced)
- [x] Parallel tasks are truly independent (different files/components)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Dependencies clearly documented
- [x] Performance and accessibility requirements included
- [x] Mobile-specific considerations addressed

## Success Criteria

### MVP Complete When:
1. **All 95 tasks completed** with passing tests (updated from 89)
2. **5 core user flows working** end-to-end (from quickstart.md)
3. **Performance benchmarks met**: <800ms search, 60fps map interactions
4. **Security validated**: Authentication, authorization, input validation
5. **Mobile optimized**: Touch gestures, responsive design, performance
6. **Accessibility compliant**: ARIA labels, keyboard navigation, screen readers
7. **Legal compliance**: Privacy policy, terms of service, cookie consent implemented

### Key Metrics to Achieve:
- Search success rate > 95% (non-zero results)
- Map interaction responsiveness 60fps
- Mobile Lighthouse performance score > 90
- Contact conversion rate tracking functional
- Admin moderation workflow < 2 minutes per listing
- Real-time updates < 100ms latency
