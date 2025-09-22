
# Implementation Plan: Local Business Directory MVP

**Branch**: `001-idea-md` | **Date**: 2025-09-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

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
**Primary Requirement**: Build a local business directory MVP where visitors can search/discover businesses via search + map interface, business owners can claim/manage listings through moderation workflow, and admins can onboard/approve/manage all listings.

**Technical Approach**: Implement using existing Next.js 15 + Convex + Clerk stack with Mapbox GL JS for mapping functionality. Leverage real-time Convex queries for live search results, Clerk authentication for owner/admin roles, and vertical slice architecture for feature organization.

## Technical Context
**Language/Version**: TypeScript 5.x, Next.js 15.3.5, React 19.0.0  
**Primary Dependencies**: Convex 1.25.2 (backend), Clerk 6.24.0 (auth), Mapbox GL JS (mapping), shadcn/ui + Radix UI (components), TailwindCSS v4 (styling)  
**Storage**: Convex (real-time database with serverless functions)  
**Testing**: Next.js built-in testing (planned), React Testing Library patterns  
**Target Platform**: Web application (responsive, mobile-first design)
**Project Type**: web (frontend + backend integrated via Convex)  
**Performance Goals**: P95 search latency ≤ 800ms, 60fps map interactions, real-time updates  
**Constraints**: Mobile-first responsive design, accessibility compliance (ARIA), rate limiting protection  
**Scale/Scope**: MVP targeting ~1000 listings, 100 concurrent users, 10k+ monthly searches

**User-provided context**: For mapping we will be using Mapbox GL JS

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**✅ Core Principles Compliance**:
- **Vertical Slice Architecture**: Feature will be organized by business directory domain with end-to-end slices (UI → services → Convex functions)
- **Composition over Inheritance**: Using React functional components with hooks, shadcn/ui composition patterns
- **Fail-fast Validation**: Zod schemas for form validation, Convex validators for all function args/returns
- **Type Safety First**: Full TypeScript coverage, no `any` types, explicit Convex function typing
- **Real-time by Default**: Convex queries for live search results, real-time listing updates
- **Design System Tokens Only**: All UI using existing design system tokens, no hard-coded styles
- **Security by Design**: Clerk authentication boundaries, Convex authorization, webhook verification

**✅ Engineering Standards Compliance**:
- **Technology Stack**: Using existing Next.js 15, Convex, Clerk, TailwindCSS v4 - only adding Mapbox GL JS
- **File Organization**: ≤500 LOC per file, vertical slice structure, relative imports, component-first
- **Convex Patterns**: New-style function definitions with validators, indexed queries, proper references
- **Next.js App Router**: Server components default, route groups for organization, proper loading/error states

**⚠️ Potential Considerations**:
- **New Dependency**: Adding Mapbox GL JS - justified for core mapping functionality requirement
- **External API**: Mapbox services integration - requires API key management and error handling

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Using existing Next.js project structure (web application). Feature will integrate into current `app/` directory with new routes for directory functionality, `components/` for UI components, and `convex/` for backend functions.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType cursor`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Database schema tasks: Create Convex schema with all entities and indexes
- Backend function tasks: Implement all Convex queries/mutations per contract
- Frontend component tasks: Map interface, search UI, listing forms, admin panels
- Integration tasks: Mapbox setup, Clerk role management, image processing
- Testing tasks: Contract tests, integration tests, mobile responsiveness

**Ordering Strategy**:
1. **Foundation** (can be parallel): Schema, environment setup, dependencies
2. **Backend Core** (sequential): Database functions, authentication, validation
3. **Frontend Core** (parallel after backend): Components, pages, hooks
4. **Integration** (sequential): Mapbox integration, real-time updates, analytics
5. **Polish** (parallel): Styling, accessibility, performance optimization
6. **Validation** (sequential): Testing, deployment, monitoring

**Task Categories**:
- **[P]** Parallel execution (independent files/features)
- **[S]** Sequential (depends on previous tasks)
- **[T]** Testing (can be parallel with implementation)

**Estimated Output**: 35-40 numbered, ordered tasks covering:
- 8 database/schema tasks
- 12 backend function tasks  
- 10 frontend component tasks
- 6 integration/setup tasks
- 4 testing/validation tasks

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning approach described (/plan command)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] No complexity deviations required

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
