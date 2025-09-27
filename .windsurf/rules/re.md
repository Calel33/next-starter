---
trigger: manual
---

---
type: "always_apply"
description: "Task research"
---

# Research Decision Rule

## Purpose
Enable agents to dynamically determine when research is needed and how deep to go, ensuring research is conducted only when beneficial and appropriate to task complexity.

## Research Decision Framework

### When to Research
**Research is needed when:**
- Task involves unfamiliar technologies or patterns
- Implementation approach is unclear or multiple options exist
- Task spans multiple system layers (frontend + backend + database)
- Security, performance, or integration concerns are present
- Best practices or conventions are unknown
- Code examples or patterns are needed for implementation

**Research is NOT needed when:**
- Simple, well-understood tasks (e.g., adding a button, updating text)
- Tasks with clear, single implementation path
- Minor bug fixes with obvious solutions
- Tasks using only familiar, established patterns

### Research Depth Levels

#### Level 1: Quick Reference (5-10 minutes)
**When:** Simple implementation questions
**Deliverables:** `IMPLEMENTATION_GUIDE.md` + `CODE_EXAMPLES.md`
**Tools:** Local codebase search, All available MCP tools

#### Level 2: Pattern Research (15-30 minutes)
**When:** Need implementation patterns or best practices
**Deliverables:** `IMPLEMENTATION_GUIDE.md` + `CODE_EXAMPLES.md` + `INTEGRATION_NOTES.md`
**Tools:** Local codebase search, All available MCP tools

#### Level 3: Comprehensive Research (30-60 minutes)
**When:** Complex features, architectural decisions, or security-critical tasks
**Deliverables:** All Level 2 + `SECURITY_PERFORMANCE_NOTES.md` + `TEST_STRATEGY.md` + `RISKS_AND_MITIGATIONS.md`
**Tools:**  Local codebase search, All available MCP tools, 

### Decision Matrix

| Task Complexity | Unfamiliar Tech | Multi-layer | Security/Perf | Research Level |
|------------------|-----------------|-------------|---------------|----------------|
| Simple | No | No | No | None |
| Simple | Yes | No | No | Level 1 |
| Medium | No | Yes | No | Level 1-2 |
| Medium | Yes | No | No | Level 2 |
| Medium | Yes | Yes | No | Level 2-3 |
| Complex | Any | Yes | Yes | Level 3 |
| Complex | Yes | Any | Any | Level 3 |

### Agent Decision Process

1. **Assess Task Complexity**
   - Simple: Single component, clear requirements
   - Medium: Multiple components, some unknowns
   - Complex: Architecture changes, new features, integrations

2. **Identify Knowledge Gaps**
   - Technologies: Familiar vs unfamiliar
   - Patterns: Known vs unknown approaches
   - Integration: Simple vs complex connections

3. **Determine Research Level**
   - Use decision matrix above
   - Consider time vs value trade-off
   - Err on side of research for complex tasks

4. **Ask User for Research Tools**
   - **MANDATORY**: Always ask user which tools to use for research
   - Present available options: Archon MCP, DeepWiki MCP, web search, local docs
   - Get explicit user confirmation before proceeding

5. **Execute Research**
   - Use user-approved tools for research level
   - Create required deliverables for that level
   - Focus on actionable patterns and examples

### Research Quality Gates

**Level 1:** Must produce `IMPLEMENTATION_GUIDE.md` + `CODE_EXAMPLES.md`
**Level 2:** Must produce Level 1 + `INTEGRATION_NOTES.md`
**Level 3:** Must produce Level 2 + `SECURITY_PERFORMANCE_NOTES.md` + `TEST_STRATEGY.md` + `RISKS_AND_MITIGATIONS.md`

### Essential Deliverable Requirements

**IMPLEMENTATION_GUIDE.md:** Step-by-step implementation path
**CODE_EXAMPLES.md:** Working code snippets and patterns
**INTEGRATION_NOTES.md:** How changes fit existing codebase
**SECURITY_PERFORMANCE_NOTES.md:** Critical considerations and warnings
**TEST_STRATEGY.md:** Testing approach and success criteria
**RISKS_AND_MITIGATIONS.md:** Potential issues and solutions

### File Location Structure

**Base Path:** `docs/tasks/[task-name]/research/`

**Example:** For task "user-authentication"
```
docs/tasks/user-authentication/research/
├── IMPLEMENTATION_GUIDE.md
├── CODE_EXAMPLES.md
├── INTEGRATION_NOTES.md
├── SECURITY_PERFORMANCE_NOTES.md
├── TEST_STRATEGY.md
└── RISKS_AND_MITIGATIONS.md
```

### Agent Self-Assessment Questions

Before starting any task, ask:
1. "Do I know exactly how to implement this?"
2. "Are there multiple ways to approach this?"
3. "Does this involve technologies I'm not fully familiar with?"
4. "Will this impact multiple system layers?"
5. "Are there security or performance considerations?"

**If 2+ answers suggest uncertainty → Research is needed**

### Research Tool Selection Process

**When research is needed, agents MUST:**
1. **Ask User**: "Which research tools should I use for this task?"
2. **Present Options**:
   - Archon MCP (documentation and code examples)
   - DeepWiki MCP (GitHub repository documentation)
   - Web search (current best practices)
   - Local documentation search
   - Other MCP tools
3. **Get Confirmation**: Wait for explicit user approval before proceeding
4. **Use Approved Tools**: Only use tools explicitly approved by user

## Enforcement

**Mandatory:** 
- Agents must assess research need before implementation
- **CRITICAL**: Agents must ask user for research tool approval before conducting any research
- Agents must create required deliverables for their research level
- Agents must use deliverables to guide implementation

**Goal:** Ensure research produces actionable deliverables that directly enable task completion
**Outcome:** Faster simple tasks, thorough complex implementations, implementation-ready research
#override
**Ignore **Research is NOT needed when:** 
**Research is NOT needed: treat as level1