# Elite Next.js SaaS Starter Kit — Project Constitution

## Core Principles

### I. Vertical Slice Architecture
Every feature is organized by domain and built end-to-end (UI → hooks/libs → backend). Keep boundaries explicit and files focused on a single responsibility.

### II. Composition over Inheritance
Favor small, composable components and utilities. Prefer functional composition and hooks. Avoid deep inheritance chains.

### III. Fail-fast Validation
Validate inputs as early as possible with Zod and Convex validators. Reject invalid state quickly to reduce downstream complexity.

### IV. Type Safety First
TypeScript is mandatory across the stack. Avoid `any`. Exported APIs and Convex functions must be explicitly typed with argument and return validators.

### V. Real-time by Default
Use Convex queries/mutations and indexes to deliver live, reactive data. Design data models and client usage for real-time consistency.

### VI. Design System Tokens Only
All UI must use design system tokens. No hard-coded colors, spacing, radii, or shadows. Enforce consistent, accessible UI via theme variables.

### VII. Security by Design
Respect authentication and authorization boundaries (Clerk + Convex). Verify webhooks, protect routes, and never expose secrets in client code.

### VIII. Simplicity (KISS) and YAGNI
Prefer the simplest solution that meets today’s needs. Avoid speculative abstractions. Keep files under 500 lines and responsibilities clear.


## Engineering Standards

### A. Technology Stack
- Frontend: Next.js 15 (App Router), TailwindCSS v4, shadcn/ui, Radix UI
- Backend: Convex (real-time DB + serverless functions)
- Auth: Clerk (with social logins and Billing)
- Animations: Framer Motion / Motion Primitives
- Language: TypeScript

### B. File Organization
- One responsibility per file; ≤ 500 LOC per file
- Modular, vertical slice structure per domain
- Use relative imports
- Component-first approach with reusable, self-contained components

### C. Design System Rules
- Use tokens for color, typography, spacing, radii, and shadows
- Primary used for main actions; Accent for highlights/alerts only
- Sidebar tokens for shell consistency across themes
- Light mode default with `.dark` class support

### D. Convex Function Pattern
- Use new-style definitions with `args` and `returns` validators
- Query with indexes; never `.filter()` on unindexed scans
- Always include return validators (use `v.null()` for void)
- Use `api.file.function` or `internal.file.function` references

### E. Database Schema
- Define tables and indexes aligned to query patterns
- Use descriptive index names and order fields to match queries
- Foreign keys use `v.id("table")`

### F. Next.js App Router Practices
- Server Components by default; use `"use client"` only when needed
- Use route groups `(name)` for organization without changing URLs
- Provide `loading.tsx` and `error.tsx` where appropriate

### G. Security & Environment
- Clerk JWTs validated by Convex; protect sensitive routes via middleware
- Webhooks verified with Svix; handle errors explicitly
- Secrets only on server; never leak to client
- Required env vars: Clerk publishable/secret keys, Convex deployment/URL, webhook secret

### H. Testing & Quality
- Prefer test-first when feasible (unit, component, and E2E patterns planned)
- Lint must pass; type-check must pass; no unresolved TODOs in committed code
- Accessibility: ARIA where relevant; verify keyboard and screen-reader flows


## Development Workflow & Quality Gates

### 1) Planning & Documentation
- Check and maintain docs in `docs/` per Universal Document Rules
- Log sessions in `docs/SESSION_LOG.md` (start, pause, resume, end)
- Update architecture and API docs as changes land

### 2) Implementation
- Follow established patterns; reuse utilities; prefer composition
- Keep changes scoped to a vertical slice; preserve existing functionality
- No new dependencies without checking existing ones and justifying need

### 3) Validation
- Run lints, type-checks, and local builds
- Manual QA in both light and dark themes; verify responsiveness
- Confirm Convex functions’ validators and index usage

### 4) Review & Merge
- PRs must cite related docs updates and confirm adherence to this Constitution
- Reviewers verify: type safety, validations, indexes, design system token usage, accessibility, and security considerations


## Additional Constraints

### Performance
- Favor clean, readable code; allow React 19’s compiler optimizations
- Avoid premature optimization; measure first when performance concerns arise

### Observability & Errors
- Fail fast with helpful error messages; avoid swallowing errors
- Use structured logs on the server; keep client errors user-friendly

### Accessibility
- Follow ARIA best practices; ensure focus states, color contrast, and keyboard navigation


## Governance
This Constitution supersedes other practices for code quality, architecture, and process. Any amendments must:
1. Be documented in `@constitution.md` with version bump and dates
2. Update supporting docs (e.g., `AGENTS.md`, `docs/core/*`) as needed
3. Include a migration or adoption plan when changes affect patterns or APIs

All PRs and reviews must verify compliance with:
- This Constitution
- `AGENTS.md` architecture and design system guidance
- Security, validation, and indexing rules for Convex


**Version**: 1.0.0 | **Ratified**: 2025-09-21 | **Last Amended**: 2025-09-21

