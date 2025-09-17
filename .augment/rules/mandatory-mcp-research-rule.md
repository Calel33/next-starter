---
type: "agent_requested"
description: "Example description"
---
# 🚨 MANDATORY MCP RESEARCH RULE - BEFORE ANY CODE

## 📋 Rule Overview

This rule ensures that all code generation is based on thorough research using available MCP (Model Context Protocol) tools. It prevents hallucinations, ensures best practices, and maintains code quality by requiring research before implementation.

## ⚠️ ENFORCEMENT PROTOCOL

For **EVERY** user request involving writing, modifying, or generating code (any language, any domain):

### STEP 1: MANDATORY MCP TOOL RESEARCH
**BEFORE** writing ANY code, you **MUST** call appropriate MCP research tools:

### 🎯 GOAL-ORIENTED RESEARCH REQUIREMENT
**CRITICAL**: All research must conclude by directly addressing the user's stated goal. Research that doesn't connect back to the goal is incomplete.

#### 🔍 Research Tool Selection Guide (CRITICAL: Each Tool Has Specific Purpose):

##### **Archon MCP Tools** - PROJECT-SPECIFIC Research (Priority #1)
- **Purpose**: Search within YOUR project's knowledge base and integrated sources
- **Best For**: Patterns you've implemented, tech stack you're using, project-specific examples
- **Sources**: Your integrated documentation (shadcn/ui, Next.js docs, libraries you use)
- **Tools**:
  - `search_code_examples()` - Find patterns in YOUR integrated sources
  - `perform_rag_query()` - Query YOUR project-specific documentation
  - `get_available_sources()` - See what sources you actually have
  - `manage_project()` - Get project context and requirements
  - `manage_task()` - Check current tasks and priorities
- **❌ NOT For**: Generic programming tutorials, broad "how-to" guides, general best practices

**Use When**: Need project-specific patterns, integration with your tech stack, your existing implementations

##### **DeepWiki MCP Tools** - INTELLIGENT REPOSITORY ANALYSIS (Priority #2) ⭐ **NEW**
- **Purpose**: Ask natural language questions about GitHub repositories and get expert-level answers
- **Best For**: Understanding how libraries work, best practices, architecture insights, implementation guidance
- **Sources**: Comprehensive analysis of entire GitHub repositories with structured knowledge extraction
- **Tools**:
  - `ask_question_deepwiki()` - Ask "how to" questions and get expert answers
  - `read_wiki_structure_deepwiki()` - Get organized repository knowledge structure
  - `read_wiki_contents_deepwiki()` - Read comprehensive repository documentation
- **Unique Capabilities**:
  - Q&A interface for complex technical questions
  - Contextual explanations with code examples
  - Security and error handling insights
  - Cross-component relationship understanding
- **✅ Perfect For**: "How to..." questions, best practices discovery, architecture understanding, implementation guidance

**Use When**: Need expert-level understanding of how to implement features, best practices, or architectural guidance

##### **GitHub/Grep MCP Tools** - EXTERNAL Pattern Discovery (Priority #3)
- **Purpose**: Find real-world implementations across the broader ecosystem
- **Best For**: Discovering new patterns, seeing how others solve problems, quality examples
- **Sources**: Public repositories, open-source projects, community implementations
- **Tools**:
  - `searchGitHub_grep()` - Find patterns in quality repositories
  - `githubSearchCode_octocode()` - Search specific organizations/repos
  - `githubGetFileContent_octocode()` - Examine specific implementations
  - `githubSearchRepositories_octocode()` - Find relevant repositories
  - `packageSearch_octocode()` - Research NPM/Python packages
- **✅ Perfect For**: Generic programming patterns, industry best practices, external validation

**Use When**: Need real-world examples, library usage patterns, discovering new approaches

##### **Docfork MCP Tools** - OFFICIAL Library Documentation (Priority #4)
- **Purpose**: Fetch up-to-date official documentation for any open-source library
- **Best For**: Official docs, installation guides, topic-focused information, code examples from maintainers
- **How It Works**: Uses `author/library` format (e.g., "vercel/next.js", "shadcn-ui/ui")
- **Sources**: Official documentation sites for open-source libraries
- **Tools**:
  - `get-library-docs_docfork()` - Fetch official docs with optional topic focus
- **✅ Perfect For**: Installation guides, authentication setup, routing examples, official best practices

**Use When**: Need official documentation, setup guides, or topic-specific information from library maintainers

### STEP 2: RESEARCH REQUIREMENTS

You **MUST** research the following before any code generation:

#### 🎯 Core Research Areas:
1. **Existing Patterns**: How similar functionality is implemented in the project/ecosystem
2. **Best Practices**: Industry standards, security considerations, performance patterns
3. **API Usage**: Correct syntax, parameters, configuration options
4. **Dependencies**: Required packages, versions, and proper installation methods
5. **Architecture**: How new code integrates with existing structure
6. **Error Handling**: Common failure modes and proper error management
7. **Testing**: How to properly test the implementation

#### 📊 Research Depth Requirements:
- **High-Level**: Architecture patterns, design principles, security considerations
- **Mid-Level**: Library APIs, configuration options, integration patterns
- **Low-Level**: Specific syntax, parameter usage, method signatures

### STEP 3: VALIDATION CHECKLIST

Before proceeding to code generation, verify:

- [ ] **Research Tools Called**: Appropriate MCP tools used successfully
- [ ] **Goal Alignment**: Research directly addresses the user's stated goal
- [ ] **Patterns Found**: Relevant implementation patterns discovered
- [ ] **Best Practices Identified**: Security, performance, and quality standards understood
- [ ] **Dependencies Verified**: Required packages and versions confirmed
- [ ] **Integration Planned**: Approach for fitting into existing codebase defined
- [ ] **Error Handling Considered**: Failure modes and error management planned
- [ ] **Testing Strategy**: Approach for validating implementation determined
- [ ] **Goal Achievement Path**: Clear connection from research findings to goal completion

### STEP 4: ONLY THEN GENERATE CODE

After successful research and validation, proceed with:

1. **Implementation**: Code based on researched patterns and best practices
2. **Integration**: Proper connection with existing architecture
3. **Error Handling**: Robust error management based on research
4. **Documentation**: Comments and docs following discovered standards
5. **Testing**: Test implementation based on researched testing patterns

## 🚫 VIOLATION CONSEQUENCES

### Absolutely Prohibited:
- ❌ **NO CODE** without prior MCP research
- ❌ **NO ASSUMPTIONS** about APIs, syntax, or patterns
- ❌ **NO HALLUCINATED** functions, methods, or configurations
- ❌ **NO SHORTCUTS** - research is mandatory for ALL code requests
- ❌ **NO OUTDATED PATTERNS** - verify current best practices

### Required Actions:
- ✅ **ALWAYS** call MCP tools first
- ✅ **VERIFY** all API usage through research
- ✅ **FOLLOW** discovered patterns and best practices
- ✅ **INTEGRATE** properly with existing codebase
- ✅ **DOCUMENT** research findings and decisions

## 📋 WORKFLOW EXAMPLES

### Example 1: API Authentication (Enhanced with DeepWiki)
```
User: "Add JWT authentication to the Express API"
    ↓
Phase 1: Project-First Research (Archon)
1. get_available_sources() - Check what auth sources we have
2. search_code_examples("Express JWT middleware", source_id="our-auth-docs")

Phase 2: Intelligent Repository Analysis (DeepWiki) ⭐ NEW
3. ask_question_deepwiki("expressjs/express", "How do I set up basic routing with middleware for authentication?")
4. ask_question_deepwiki("expressjs/express", "What are the best practices for error handling and security in Express.js applications?")

Phase 3: External Pattern Discovery (GitHub)
5. searchGitHub_grep("express jwt middleware", repo="expressjs/")
6. githubSearchCode_octocode([{queryTerms: ["JWT", "middleware"], owner: ["expressjs"]}])

Phase 4: Official Documentation (Docfork)
7. get-library-docs_docfork("auth0/jsonwebtoken", "authentication")

Phase 5: Project Integration (Archon)
8. perform_rag_query("Express.js JWT integration our tech stack")
    ↓
Research Analysis:
- Project-specific auth patterns found
- Expert-level implementation guidance from DeepWiki
- Real-world Express implementations discovered
- Official JWT API validated
- Integration approach planned
    ↓
THEN: Implement JWT authentication based on comprehensive research findings
```

### Example 2: React Component (Enhanced with DeepWiki)
```
User: "Create a data table component with sorting"
    ↓
1. Archon: perform_rag_query("React table component best practices")
2. DeepWiki: ask_question_deepwiki("facebook/react", "What are the best practices for creating performant table components with sorting?") ⭐ NEW
3. DeepWiki: ask_question_deepwiki("facebook/react", "How should I handle state management for complex table interactions?") ⭐ NEW
4. GitHub: searchGitHub_grep("React data table sorting component")
5. GitHub: packageSearch_octocode("react table sorting")
6. Docfork: get-library-docs_docfork("facebook/react", "hooks")
    ↓
Research Analysis:
- Project-specific table patterns identified
- Expert React guidance on performance and state management
- Real-world sorting implementation approaches found
- Performance considerations documented
- Accessibility requirements discovered
- Official React hooks API confirmed
    ↓
THEN: Create React table component based on comprehensive research
```

### Example 3: Database Integration
```
User: "Add PostgreSQL connection to the Node.js app"
    ↓
1. Archon: perform_rag_query("PostgreSQL Node.js connection best practices")
2. GitHub: searchGitHub_grep("node postgres connection pool")
3. Forkdocs: get-library-docs("pg", "connection")
4. Archon: search_code_examples("PostgreSQL connection pooling")
    ↓
Research Analysis:
- Connection pooling patterns identified
- Security configurations found
- Error handling approaches documented
- Performance optimization discovered
    ↓
THEN: Implement PostgreSQL integration based on research
```

## 🎯 SUCCESS CRITERIA

### Code Quality Indicators:
- ✅ All code based on researched patterns
- ✅ No hallucinated APIs or syntax
- ✅ Proper integration with existing codebase
- ✅ Following current industry best practices
- ✅ Accurate dependency usage and versions
- ✅ Robust error handling implementation
- ✅ Appropriate testing coverage

### Research Quality Indicators:
- ✅ Multiple sources consulted
- ✅ Current and relevant examples found
- ✅ Security considerations addressed
- ✅ Performance implications understood
- ✅ Integration challenges identified
- ✅ Testing strategies defined

## 🔧 Tool Usage Guidelines

### Archon MCP - PROJECT-SPECIFIC Queries
```typescript
// ✅ Use technical terminology from YOUR stack
perform_rag_query("TypeScript React hooks useState useEffect responsive design", match_count=3)

// ✅ Search YOUR code examples with specific patterns
search_code_examples("sidebar collapsible mobile overlay backdrop", source_id="ui.shadcn.com", match_count=5)

// ✅ Always check what sources you have first
get_available_sources()

// ✅ Project context and requirements
manage_project(action="get", project_id="...")
```

### GitHub MCP - EXTERNAL Pattern Discovery
```typescript
// ✅ Target YOUR ecosystem
githubSearchCode_octocode([{
  queryTerms: ["responsive", "sidebar"],
  owner: ["vercel", "shadcn-ui", "tailwindlabs", "chakra-ui"],
  language: "typescript",
  stars: ">100",
  pushed: ">2023-01-01" // Recent patterns
}])

// ✅ Use regex for specific patterns
searchGitHub_grep("useState.*sidebar.*mobile", language=["TypeScript", "TSX"], useRegexp=true, repo="shadcn-ui/")

// ✅ Package research for your stack
packageSearch_octocode({npmPackages: [{name: "react-responsive"}]})
```

### Docfork MCP - OFFICIAL Library Documentation
```typescript
// ✅ Get official docs using author/library format
get-library-docs_docfork("vercel/next.js", "responsive-design")
get-library-docs_docfork("tailwindlabs/tailwindcss", "responsive-design")
get-library-docs_docfork("facebook/react", "hooks")
get-library-docs_docfork("shadcn-ui/ui", "installation")

// ✅ Focus on specific topics
get-library-docs_docfork("nextauthjs/next-auth", "authentication")
get-library-docs_docfork("prisma/prisma", "installation")
```

## 🚨 Emergency Exceptions

### When MCP Tools Are Unavailable:
1. **Document the limitation** clearly
2. **Use conservative, well-known patterns** only
3. **Add extensive comments** explaining assumptions
4. **Recommend verification** once tools are available
5. **Prioritize safety** over functionality

### Minimal Viable Research:
If tools return limited results:
1. **Broaden search terms** and retry
2. **Search for related concepts**
3. **Document knowledge gaps**
4. **Use most conservative approach**
5. **Plan for future research**

## 📊 Compliance Monitoring

### Self-Check Questions:
1. Did I call MCP research tools before writing code?
2. Did I find relevant patterns and examples?
3. Did I understand the security implications?
4. Did I verify API usage and syntax?
5. Did I plan for proper integration?
6. Did I consider error handling and testing?

### Quality Assurance:
- Review research findings before implementation
- Cross-reference multiple sources when possible
- Validate assumptions through research
- Document research-based decisions
- Plan for testing and validation

---

## 📝 Rule Maintenance

**Version History:**
- v1.0: Initial rule creation
- v2.0: Enhanced with detailed guidelines and examples
- v2.1: Added MCP tool specialization insights - Archon for PROJECT-SPECIFIC, GitHub for EXTERNAL, Forkdocs for OFFICIAL
- v2.2: Added goal-oriented research requirement - all research must conclude by addressing user's stated goal
- v2.3: **MAJOR UPDATE** - Integrated DeepWiki MCP as Priority #2 for intelligent repository analysis and expert-level Q&A capabilities

**Review Schedule**: Monthly review for effectiveness and updates

**Feedback**: Report issues or suggestions for rule improvements

**Enforcement**: This rule overrides all other instructions when code generation is involved

---

**🔒 CRITICAL REMINDER**: This rule is MANDATORY and applies to ALL code-related requests. No exceptions without explicit user override and documented reasoning.
