
# Implementation Plan: Local Business Directory MVP

**Branch**: `001-idea-md` | **Date**: 2025-09-21 | **Spec**: specs/001-idea-md/spec.md
**Input**: Feature specification from `/specs/001-idea-md/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Primary requirement: A local business directory enabling visitor discovery (search + map), owner listing management, and admin moderation. Technical approach: Next.js 15 UI using design tokens; Mapbox GL JS for interactive maps and clustering; Convex for real-time data with validated queries/mutations; Clerk for auth; simple ranking (relevance + distance), with clarified MVP rules for featured, reviews, and saved lists.

## Technical Context
**Language/Version**: TypeScript (Next.js 15), Convex functions (TS)
**Primary Dependencies**: Next.js App Router, TailwindCSS v4, shadcn/ui, Radix UI, Convex, Clerk, Mapbox GL JS
**Storage**: Convex (tables per `convex/schema.ts` with indexes)
**Testing**: Lint/type-check; testing planned (RTL/Playwright patterns)
**Target Platform**: Web app (Next.js + Convex)
**Project Type**: web (frontend + backend via Convex)
**Performance Goals**: Search P95 ≤ 800 ms; responsive UI; real-time updates where applicable
**Constraints**: Design tokens only; ≤500 LOC per file; Convex validators + indexes; no leaking secrets client-side
**Scale/Scope**: MVP scope per spec; categories, listings, owner/admin roles

## Constitution Check
- Vertical slices respected (UI components, hooks/libs, Convex functions).
- Composition-first: small reusable components; no inheritance.
- Fail-fast validation: Zod/client-side + Convex validators server-side.
- Type safety: TS across app; no `any` in exported APIs.
- Real-time by default: use Convex queries/mutations for live UI.
- Design tokens enforced: no hard-coded colors/spacing/radii/shadows.
- Security: Clerk auth, role checks in Convex, secrets server-only.
- KISS/YAGNI: MVP-first, clarified deferred features.

Gate: PASS (no violations). Complexity Tracking not required.

## Project Structure

### Documentation (this feature)
```
specs/001-idea-md/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Web application (Next.js + Convex in this repo)
app/
components/
convex/
hooks/
lib/
```

**Structure Decision**: Web application structure

## Phase 0: Outline & Research
1. Extract unknowns → resolved in `research.md` (Mapbox GL JS usage, geolocation fallback, ranking and latency targets, verification and featured rules). No remaining NEEDS CLARIFICATION.
2. Research agents → captured decisions in research.md.
3. Consolidate findings → done.

**Output**: research.md complete

## Phase 1: Design & Contracts
1. Entities extracted → `data-model.md`.
2. API contracts → `contracts/convex-contracts.md` (function names, args, returns).
3. Contract tests → planned (to be created during /tasks phase).
4. Quickstart → `quickstart.md` with env and verification steps.
5. Agent context update → planned via update-agent-context script during execution.

**Output**: data-model.md, contracts, quickstart.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models → services → UI
- Mark [P] for parallel execution

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

## Phase 3+: Future Implementation
(Out of /plan scope)

## Complexity Tracking
(none)

## Progress Tracking
**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
