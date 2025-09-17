---
type: "always_apply"
---

# 📋 Universal Document Rules - Concise Version

## 🔒 CRITICAL RULES - NEVER VIOLATE

1. **✅ ALWAYS Check/Create Documentation Structure First**
2. **✅ MANDATORY Session Documentation** - Document start, pause, resume, end
3. **✅ Context Preservation Across Sessions** - Maintain project identity and functionality
4. **✅ MANDATORY Learning Documentation** - Capture insights and lessons learned

## 📁 Required Documentation Structure

```
docs/
├── README.md                           # Documentation index & navigation
├── SESSION_LOG.md                      # Master session tracking
├── core/                              # Core project documentation
│   ├── PRODUCT_BRIEF.md, ARCHITECTURE.md, PROJECT_PROGRESS.md
│   ├── API_REFERENCE.md, DEVELOPMENT_GUIDE.md, USER_GUIDE.md, BUG_LOG.md
├── guides/                            # Operational guides
│   ├── Research guides, monitoring guides, optimization guides
├── tasks/                             # Task-specific documentation
│   ├── [task-name]/                   # Individual task folders
│   │   ├── README.md                  # Task overview
│   │   ├── [task-docs].md             # Task-specific docs
│   │   ├── sessions/                  # Task-specific sessions
│   │   ├── validation/                # Task validation reports
│   │   └── learnings/                 # Task learning documentation
└── sessions/                          # General/uncategorized sessions
    ├── general/, pauses/, handoffs/, endings/
```

## 🎮 Session Commands

### `/start session`
1. Check docs structure (create if missing)
2. Gather current context
3. Create session document in appropriate location
4. Update SESSION_LOG.md

### `/session pause`
1. Create pause documentation with current state
2. Update current session document
3. Update session log

### `/resume`
1. Find latest pause document
2. Restore complete context
3. Continue from documented state

### `/session end`
1. Create session summary
2. Update project documentation
3. Create learning documentation if significant work

## 📝 Key Standards

### **File Naming**
- **Core docs**: `UPPERCASE_WITH_UNDERSCORES.md`
- **Sessions**: `SESSION_YYYY-MM-DD_[DESCRIPTION].md`
- **Pauses**: `PAUSE_YYYY-MM-DD_[DESCRIPTION].md`
- **Validation**: `TASK_COMPLETION_VALIDATION_REPORT_YYYY-MM-DD.md`
- **Learning**: `WHAT_WE_LEARNED_SESSION_YYYY-MM-DD.md`

### **Organization Principles**
- **Task-based organization**: Group related documents by task/feature
- **Session tracking**: All work sessions documented and organized
- **Quality assurance**: Validation reports for significant implementations
- **Learning capture**: Technical insights and lessons documented

### **Location Rules**
- **Task-specific work**: Use `docs/tasks/[task-name]/sessions/`
- **General work**: Use `docs/sessions/general/`
- **Learning docs**: Task-specific in `docs/tasks/[task-name]/learnings/` or general in `docs/sessions/learnings/`

## 🚨 Never Do / Always Do

### **❌ NEVER**
- Start work without checking/creating docs structure
- Skip session documentation for significant work
- Pause work without documenting current state
- Delete or overwrite session documentation

### **✅ ALWAYS**
- Check for docs folder and create if missing
- Document session start, pause, resume, and end
- Maintain project context across sessions
- Update relevant documentation when making changes
- Create clear handoffs for future work

## 🎯 Quick Implementation

### **Auto-Create Structure**
```bash
docs/
├── core/ guides/ tasks/ sessions/
└── sessions/{general,pauses,handoffs,endings}/
```

### **Session Document Template**
```markdown
# 📅 Session YYYY-MM-DD HH:MM - [Brief Description]

## 🎯 Session Overview
- Start time, agent, planned work

## 📋 Project Context
- Current project state, recent changes, priorities

## 🔄 Work Completed
- Detailed accomplishments, files modified, issues resolved

## 🎯 Next Session Recommendations
- Suggested next steps, priority items, context for next agent
```

---

**🔒 ENFORCEMENT**: These rules are MANDATORY for ALL agents on ANY project.

**🚀 GOAL**: Professional documentation with seamless session management.

*Version: 2.0 - Concise*
*Last Updated: 2025-09-08*