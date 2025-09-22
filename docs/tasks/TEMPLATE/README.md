# Task Template (Research Phase)

Use this folder as a starting point when kicking off any new task/feature. It scaffolds lean, high‑signal documents for Phase 4 (Research Execution) and prep for planning/implementation.

## Structure

```
docs/
  tasks/
    TEMPLATE/
      README.md
      research/
        RESEARCH_SUMMARY.md
        ADRs/
          ADR-0000-TEMPLATE.md
        PATTERNS_AND_EXAMPLES.md
        INTEGRATION_NOTES.md
        SECURITY_PERFORMANCE_NOTES.md
        TEST_STRATEGY.md
        RISKS_AND_MITIGATIONS.md
        OPEN_QUESTIONS.md
      validation/
        FULL_IMPLEMENTATION_CHECKLIST.md
```

## How to Use
1. Copy this `TEMPLATE` directory and rename it to your task slug, e.g. `docs/tasks/user-billing/`.
2. Fill out `research/RESEARCH_SUMMARY.md` first. Keep it to 1–2 pages.
3. Create ADRs for any irreversible/costly decisions in `research/ADRs/`.
4. Capture patterns, integration notes, security/perf, tests, risks, and open questions.
5. Use `validation/FULL_IMPLEMENTATION_CHECKLIST.md` before starting implementation.

## Tips
- Keep each file concise; link out to code, PRs, and external references.
- Prefer decisions in ADRs over burying them in prose.
- Update documents as the task evolves; supersede ADRs when decisions change.


