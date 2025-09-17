# Cursor Agent Mode Protocol

This protocol defines how to activate and orchestrate our `agents-cursor` agents inside Cursor. It mirrors the original Agent Mode Protocol but maps phases and examples to our Core and Universal agents and uses Cursor’s built-in tools (including `todo_write`).

---

## Agent Activation

There are three ways to activate agents depending on task complexity.

### 1) Simple Tasks – Automatic Selection
- Use `/agent` to run a single agent suited to a straightforward task.
- Example: `/agent @agents-cursor/core/prompt-assistant.md`

### 2) Custom Workflows – Multi‑Agent Mode
- Use `/multiagent` to chain multiple agents for a custom flow.
- Example: `/multiagent Use @agents-cursor/core/prompt-assistant.md, then @agents-cursor/universal/backend-developer.md to implement.`

### 3) Complex Features – Deep Task Mode
- Use `/deeptask` for multi‑phase coordination across agents.
- Example: `/deeptask Build real-time notifications end‑to‑end`

---

## Deep Task Workflow (Cursor edition)

When you initiate `/deeptask`, coordinate these phases using our agents:

**Phase 1: Planning**
- Goal: Define the feature, requirements, and technical approach.
- Primary Agent: `@agents-cursor/core/project-researcher-agent.md`

**Phase 2: Data Layer Implementation**
- Goal: Implement necessary schemas/models/data access logic.
- Primary Agent: `@agents-cursor/universal/backend-developer.md`

**Phase 3: Parallel Development**
- Goal: Build backend and frontend simultaneously.
- Agents:
  - Backend: `@agents-cursor/universal/backend-developer.md`
  - Frontend: `@agents-cursor/universal/frontend-developer.md`

**Phase 4: Phased Code Review**
- Goal: Review backend and frontend separately for quality and security.
- Primary Agent: `@agents-cursor/core/code-reviewer.md`

**Phase 5: Integration & Final Review**
- Goal: Integrate backend + frontend; final review.
- Agents: `@agents-cursor/universal/backend-developer.md`, `@agents-cursor/universal/frontend-developer.md`, `@agents-cursor/core/code-reviewer.md`

---

## Our Agents (paths)

### Core (`agents-cursor/core/`)
- `prompt-assistant.md` – Generates implementation-ready prompts
- `code-reviewer.md` – Security-aware, rigorous code reviews
- `documentation-specialist.md` – Project docs, API specs, architecture guides
- `performance-optimizer.md` – Performance, cost, and scalability tuning
- `project-researcher-agent.md` – Planning, research, and architecture scoping
- `ui-configurator-agent.md` – Interactive UI configuration
- `context-agent.md`, `context-agent-v2.md`, `pav2.md`, `ui-element-diagnostic-agent.md` – Context/intake, advanced prompting, and UI diagnostics

### Universal (`agents-cursor/universal/`)
- `backend-developer.md` – Server-side implementation across stacks
- `frontend-developer.md` – Framework-agnostic UI implementation
- `api-architect.md` – API contracts (REST/GraphQL)
- `tailwind-css-expert.md` – Tailwind CSS specialist

---

## Tooling expectations

Our agents’ `tools:` fields have been standardized to Cursor’s built-ins and MCP tools. Highlights:
- Core built-ins used across agents: `read_file`, `write`, `search_replace`, `MultiEdit`, `delete_file`, `list_dir`, `glob_file_search`, `grep`, `codebase_search`, `read_lints`, `run_terminal_cmd`, `edit_notebook`, `create_diagram`, `update_memory`, `web_search`, `fetch_pull_request`, `todo_write`.
- MCP names only where applicable (e.g., `mcp_octocode_githubSearchPullRequests`, `mcp_code-index_search_code_advanced`).

No extra setup is required; agents are ready to run inside Cursor with these tools.

---

## Usage patterns

### Simple Task Examples
- Generate a PRD: `/agent @agents-cursor/core/prd-generator.md`
- Draft a prompt for a feature: `/agent @agents-cursor/core/prompt-assistant.md`
- Create/update docs: `/agent @agents-cursor/core/documentation-specialist.md`

### Multi‑Agent Chain Examples
- “Prompt → Implement (backend) → Review”
  - `/multiagent Use @agents-cursor/core/prompt-assistant.md, then @agents-cursor/universal/backend-developer.md, then @agents-cursor/core/code-reviewer.md`

### Deep Task Examples
- “Plan → Backend + Frontend → Review → Integrate”
  1) `/deeptask` to initiate.
  2) Phase agents as listed in Deep Task Workflow (this can be coordinated manually or by a controlling agent).

---

## Task tracking and memory

- Use `todo_write` to maintain a live task checklist during sessions.
- For persistent project context, continue to use the `memory-docs/` structure (e.g., update `progress.md`, `features.md`, or add entries to `open-issues/` where appropriate).

---

## Output conventions

- Each agent adheres to its own “Required Output Format” sections (where defined).
- Prefer small, incremental edits with clear diffs and final “Implementation Report” or “Action Checklist” depending on the agent.

---

## Notes

- Paths in this protocol point to `agents-cursor/` agents, not `project-folder/agents-agument/`.
- All tools referenced are already declared in agents’ frontmatter and are usable as-is in Cursor.


