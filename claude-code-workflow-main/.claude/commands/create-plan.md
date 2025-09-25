# Create plan for specific prompt

## Variables

RESEARCH_NOTES: $ARGUMENTS

## Execute

Analyze $RESEARCH_NOTES to understand the feature requirements, use cases, and researched knowledge.

For large features, create multiple plan files - each implementing a self-contained, testable component.
Within each plan, do not include any assumptions or speculations. Include only specific instructions and code snippets of what exactly needs to be implemented.

Each plan must include:
- Relevant resources (code snippets, links, research notes from $RESEARCH_NOTES)
- Specific implementation instructions without assumptions
- Exact code to be implemented
## Requirements Summary
- [Key requirement 1]
- [Key requirement 2]
- [Key requirement n]

## Research Findings
### Best Practices
- [Finding 1]
- [Finding n]

### Reference Implementations
- [Example 1 with link/location]
- [Example n with link/location]

### Technology Decisions
- [Technology choice 1 and rationale]
- [Technology choice n and rationale]

## Codebase Integration Points
### Files to Modify
- `path/to/file1.js` - [What changes needed]
- `path/to/filen.py` - [What changes needed]

### New Files to Create
- `path/to/newfile1.js` - [Purpose]
- `path/to/newfilen.py` - [Purpose]

### Existing Patterns to Follow
- [Pattern 1 from codebase]
- [Pattern n from codebase]

## Technical Design

### Architecture Diagram (if applicable)

**Goal:** Create comprehensive implementation plan with full system coverage

**Process:**
1. Identify which layers are impacted:
   - Frontend (components, forms, UI state)
   - Backend (services, controllers, business logic)
   - Database (schemas, migrations, seeds)
   - API (routes, contracts, clients)
   - Tests (unit, integration, E2E)
   - Documentation (API reference, guides, changelogs)

2. Create detailed implementation plan for each layer

3. Include **Full Implementation Checklist**

4. Plan integration points and dependencies

5. Identify potential risks and mitigation strategies

**Full Implementation Checklist:**
- [ ] Frontend changes (components, forms, UI state)
- [ ] Backend changes (services, controllers, logic)
- [ ] Database changes (schemas, migrations, seeds)
- [ ] API changes (routes, contracts, clients)
- [ ] Test updates (unit, integration, E2E)
- [ ] Documentation updates (API reference, guides, changelogs)
Before adding to the plan, verify functionality doesn't already exist in the codebase.

File organization:
1. Check existing specs for highest prefix number, increment by 10
2. Create folder: `./specs/XXX-<feature-name>/`
3. Name plans: `XXX-<feature-name>-<part-number>.md`
4. Part numbers indicate implementation order
