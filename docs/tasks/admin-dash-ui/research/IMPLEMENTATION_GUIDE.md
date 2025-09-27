# Admin Dashboard UI Integration — Implementation Guide

## Objective
Translate the provided admin dashboard HTML into the Elite Next.js Business Directory Platform while satisfying project architecture, design-system rules, and data requirements.

## Prerequisites
- Review existing admin dashboards in `app/dashboard/admin/page.tsx` and supporting hooks in `hooks/useAdminAnalytics.ts`.
- Confirm design tokens from `app/globals.css` and component patterns in `components/ui/`.
- Ensure Convex queries (`api.listings.getModerationQueue`, `api.analytics.getAnalyticsSummary`, `api.moderationLogs.getRecentModerationActivity`) are available; extend only if new metrics are required.

## Step-by-Step Plan
1. **Audit Current Layout**
   - Document existing structure in `app/dashboard/admin/page.tsx`.
   - Identify reusable pieces (header, stat cards, tables) that overlap with the new UI requirements.

2. **Define Component Breakdown**
   - Stub the following components in `components/custom/admin/` (create directory if absent):
     - `AdminSidebar.tsx`
     - `AdminMetricCard.tsx`
     - `AdminAnalyticsPanel.tsx`
     - `AdminRevenuePanel.tsx`
   - Ensure each component exposes typed props and consumes design tokens via Tailwind utilities.

3. **Map Design Tokens**
   - Replace source HTML colors with semantic classes:
     - `text-[#111418]` → `text-foreground`
     - `bg-[#eaedf0]` → `bg-muted`
     - `border-[#d5dbe1]` → `border-border`
     - `text-[#5f7286]` → `text-muted-foreground`
     - Accent greens/reds should use `text-success`/`text-destructive` equivalents via existing utilities or extend `components/ui/badge.tsx` variants if needed.
   - Preserve spacing with Tailwind token-based utilities (`p-6`, `gap-4`, etc.) and avoid inline styles.

4. **Implement Sidebar**
   - Create `AdminSidebar` mirroring navigation links (`Dashboard`, `Listings`, `Reviews`, `Analytics`, `Settings`).
   - Use `components/ui/button` or navigation list patterns. Utilize Lucide icons (e.g., `Home`, `List`, `Star`, `LineChart`, `Settings`).
   - Provide keyboard navigation via semantic markup (`nav`, `aria-label`). Ensure active route highlight using `usePathname()`.

5. **Integrate Layout Structure**
   - Convert top-level layout into a two-column grid within `app/dashboard/admin/page.tsx`.
   - Compose `AdminSidebar` and main content with responsive behavior: collapse/toggle sidebar on smaller screens using `Sheet`/`Drawer` from `components/ui`.
   - Ensure wrapper respects existing `AdminProtection` guard.

6. **Build Metric Cards**
   - Implement `AdminMetricCard` wrapping `Card` components. Accept title, value, description, and icon props. Use `LucideIcon` type typing.
   - Render metrics using data from `useAdminAnalytics`. Provide skeleton states via `Skeleton` components while loading.

7. **Analytics & Revenue Panels**
   - `AdminAnalyticsPanel`: display overview heading, summary values, and chart placeholder.
     - For initial integration, reuse existing data (e.g., `analyticsSummary.totalViews`). For charts, render tabular data or integrate with an existing chart component (check `components/custom` for existing analytics charts before adding new dependencies).
   - `AdminRevenuePanel`: show revenue trends; if Convex lacks revenue data, create placeholder with descriptive copy and mark TODO to wire actual data.

8. **Data Binding & Real-time Updates**
   - Keep `useAdminAnalytics` as single source of truth. If new metrics are required, extend the hook and corresponding Convex query returns.
   - Update computed values to feed new components. Maintain notification logic (`recentUpdates`, `AdminNotifications`).

9. **Accessibility & Responsiveness**
   - Verify focus states (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`).
   - Provide `aria-live` regions for real-time update badges if necessary.
   - Test layout down to 320px width; ensure cards stack and sidebar collapses.

10. **Testing & Documentation**
    - Add/extend integration tests in `__tests__/integration/admin-moderation.test.ts` covering navigation visibility and metric rendering.
    - Update documentation if analytics behavior changes (`docs/core/ARCHITECTURE.md` or a feature doc).
    - Log manual QA steps in `docs/SESSION_LOG.md`.

## Exit Criteria
- Dashboard renders new UI in both light and dark modes with design tokens only.
- Metrics and moderation data remain functional and real-time.
- Automated tests pass (`pnpm lint`, `pnpm typecheck`, relevant Jest suites).
- Documentation and session logs updated.
