# Research Command - Deep feature analysis and information gathering

## Purpose

This command is used to perform a deep analysis of a feature, including user interactions, use cases, and technical research. It outputs a comprehensive markdown file containing all research findings.

## Variables

- USER_PROMPT: $ARGUMENTS

## Execute

### 1. Feature Analysis

#### Feature Overview

Analyze the user prompt: USER_PROMPT and provide a comprehensive understanding of what is being requested (feature/bug/improvement).

#### User Interactions

List all possible user interactions with this feature. If UI is needed then describe what it will look like and how it will work. Do deep web search to find multiple examples and analyze them before ultra thinking and coming up with a UI design. All examples should be referenced in the output file.

#### Edge Cases & Constraints

Identify all edge cases and constraints if applicable:

- Error scenarios
- Boundary conditions
- Race conditions
- Security considerations
- Data validation requirements
- Platform/browser compatibility
- Resource limitations

### 2. Technical Research
1. Ask which tools to use for research:
   - Archon MCP (for documentation and code examples)
   - DeepWiki MCP (for GitHub repository documentation)
   - Other MCP tools
   - Web search (for current best practices)
   - Local documentation
   - Other relevant sources

### Knowledge Base Search (if instructed)
If Archon RAG is available and relevant:

Use mcp__archon__rag_get_available_sources() to see available documentation
Search for relevant patterns: mcp__archon__rag_search_knowledge_base(query="...")
Find code examples: mcp__archon__rag_search_code_examples(query="...")
Focus on implementation patterns, best practices, and similar features

#### Web Search Investigation

Search the web exahustively for relevant information about:

- Existing solutions using current technology stack
- Best practices for implementing this feature
- Common patterns and anti-patterns
- Performance optimization techniques
- Security considerations
- Accessibility guidelines

Reference format: [Topic] - URL

When searching on the web do breath first searches and then depth first search once you find relevant results.

#### Library & Framework Research

Investigate relevant libraries and frameworks:

- Existing solutions in npm/bun ecosystem
- Framework-specific implementations (Next.js, React, Electron)
- API documentation references
- Version compatibility notes

Reference format: Library Name - Documentation URL

#### Codebase Analysis

Examine the existing codebase for:

- Similar features or patterns already implemented
- Reusable components/utilities
- Current architectural patterns
- Existing data models and schemas
- API endpoints and services
- State management patterns

Reference format: file_path:line_number - Description

### 3. Research Output

Generate a comprehensive markdown file saved to `./research/` folder with naming convention: `XXX-<feature-name>-research.md` (increment XXX by 10 from highest existing file).

The output file should contain ALL research findings from the previous steps:

```markdown
# Research: [Feature Name]

## Executive Summary

- Feature/improvement description (from Step 1: Feature Overview)
- Scope and impact analysis
- Estimated complexity

## Feature Analysis

### User Interactions

[Include all findings from Step 1: User Interactions]

## Technical Research

### Web Search Findings

[Include all findings from Step 2: Web Search Investigation]

### Code Examples from Research

**CRITICAL: Include actual code examples and patterns discovered through MCP tools**

#### 1. [Pattern Name]
**Source**: `repository/file_path:line_number`

```[language]
[Actual code example from research]
```

**Pattern**: [Description of the pattern and its benefits]

#### 2. [Another Pattern Name]
**Source**: `repository/file_path:line_number`

```[language]
[Another actual code example]
```

**Pattern**: [Description and key insights]

[Continue with additional code examples as discovered]

### Codebase Analysis

[Include all findings from Step 2: Codebase Analysis]

**Existing Components to Leverage:**

#### 1. [Component/Pattern Name]
**Source**: `file_path:line_number`

```[language]
[Actual code from existing codebase]
```

**Pattern**: [How this existing pattern can be leveraged]

#### 2. [Another Component/Pattern]
**Source**: `file_path:line_number`

```[language]
[More existing code examples]
```

**Pattern**: [Integration approach and benefits]

**Required Modifications:**
- Extend `file_path:line_number` with [specific changes using existing patterns]
- Create new [component/hook/function] following [existing pattern reference]
- Build [new functionality] using existing [component/pattern] + [new technology]
- Add [specific feature] with same [existing pattern] pattern

**State Management Impacts:**
- [Specific impacts with code examples where relevant]

## Reference Index

- External documentation URLs
- Relevant code locations (file_path:line_number)
- Library/framework references
- Related issues or discussions
```
