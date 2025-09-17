# 🎯 **Universal UI Integration Prompt Template**

## 📋 **Fill-in-the-Blanks Template**

Copy this template and replace all `[PLACEHOLDER]` values with your specific information:

---

```
I want to integrate a custom UI design into our [PROJECT_NAME] project. Please extract and adapt this interface to work with our [TECH_STACK] stack.

**CURRENT PROJECT CONTEXT:**
- Framework: [FRAMEWORK] 
  Examples: Next.js 15 + React 19, Vue 3 + Nuxt, Angular 17, Svelte + SvelteKit
- Styling: [STYLING_SYSTEM] 
  Examples: Tailwind CSS + shadcn/ui, CSS Modules, Styled Components, Material-UI
- Backend: [BACKEND_TYPE] 
  Examples: MCP integration, REST API, GraphQL, Firebase, Supabase
- Language: [LANGUAGE] 
  Examples: TypeScript, JavaScript, Python (FastAPI), Go
- Current file: [TARGET_FILE_PATH] 
  Examples: src/app/chat/page.tsx, components/Dashboard.vue, app/main.py
- Existing functionality: [CURRENT_FEATURES] 
  Examples: Real-time chat, user authentication, data visualization, file uploads

**UI TO INTEGRATE:**
[PASTE_YOUR_UI_CODE_OR_DESIGN_DESCRIPTION_HERE]

**INTEGRATION REQUIREMENTS:**
1. 🔄 **Preserve All Existing Functionality**
   - Maintain [BACKEND_TYPE] integration
   - Keep [SPECIFIC_FEATURE_1] (e.g., streaming responses, real-time updates)
   - Preserve [SPECIFIC_FEATURE_2] (e.g., user state, data persistence)
   - Maintain [SPECIFIC_FEATURE_3] (e.g., routing, navigation)

2. 🎨 **Adapt Design Elements**
   - Convert HTML/CSS to [FRAMEWORK] components
   - Replace vanilla JS with [FRAMEWORK] patterns
   - Convert CSS classes to [STYLING_SYSTEM]
   - Ensure responsive design for [TARGET_DEVICES]
   - Maintain accessibility standards

3. 🔧 **Technical Adaptations**
   - Convert to [LANGUAGE] interfaces/types
   - Use [FRAMEWORK] best practices (hooks, composables, etc.)
   - Implement proper event handlers
   - Add error boundaries/handling
   - Optimize for [FRAMEWORK] performance

4. 📱 **Feature Integration**
   - [SPECIFIC_INTERACTION_1] (e.g., Auto-scroll behavior)
   - [SPECIFIC_INTERACTION_2] (e.g., Keyboard shortcuts)
   - [SPECIFIC_INTERACTION_3] (e.g., Loading states)
   - [SPECIFIC_INTERACTION_4] (e.g., Form validation)
   - [SPECIFIC_INTERACTION_5] (e.g., Animation triggers)

5. 🎯 **Specific Adaptations Needed**
   - Replace external imports with [FRAMEWORK] optimization
   - Convert animations to [ANIMATION_LIBRARY] (e.g., Framer Motion, CSS transitions)
   - Adapt color schemes for [THEME_REQUIREMENTS] (e.g., dark/light modes)
   - Ensure compatibility with [EXISTING_COMPONENTS]
   - Maintain [SPECIFIC_FUNCTIONALITY] (e.g., state management, routing)

**MULTIAGENT COORDINATION:**
Please use appropriate agent coordination:
- @agents-agument/core/ui-configurator-agent for design analysis
- @agents-agument/universal/[AGENT_TYPE]-developer for implementation
- Maintain context across agent handoffs
- Document all changes and decisions

**DELIVERABLES:**
1. ✅ Complete [FRAMEWORK] component replacement
2. ✅ Updated [LANGUAGE] interfaces/types
3. ✅ [STYLING_SYSTEM] styling implementation
4. ✅ Preserved [BACKEND_TYPE] functionality
5. ✅ Working animations and interactions
6. ✅ Responsive design for [TARGET_DEVICES]
7. ✅ Documentation of changes made

**TESTING REQUIREMENTS:**
- Ensure the interface loads without errors
- Verify all interactive elements work
- Test [CORE_FUNCTIONALITY_1] (e.g., data submission)
- Confirm [CORE_FUNCTIONALITY_2] (e.g., real-time updates)
- Validate responsive behavior on [TARGET_DEVICES]
- Check accessibility compliance
- Test [SPECIFIC_FEATURE] integration

Please analyze the provided UI design and implement it step-by-step, maintaining our existing [PROJECT_TYPE] functionality while delivering the exact visual design requested.
```

---

## 🔧 **Quick Fill Examples**

### **Example 1: Chat Application**
```
[PROJECT_NAME] = "MCP Multi-Agent Chat"
[TECH_STACK] = "Next.js + TypeScript + Tailwind CSS + MCP backend"
[FRAMEWORK] = "Next.js 15 + React 19"
[STYLING_SYSTEM] = "Tailwind CSS + shadcn/ui"
[BACKEND_TYPE] = "MCP (Model Context Protocol) integration"
[LANGUAGE] = "TypeScript"
[TARGET_FILE_PATH] = "mcp-agent-ui/src/app/chat/page.tsx"
[CURRENT_FEATURES] = "Real-time chat with AI, streaming responses, MCP server integration"
```

### **Example 2: Dashboard Application**
```
[PROJECT_NAME] = "Analytics Dashboard"
[TECH_STACK] = "Vue 3 + TypeScript + Vuetify + REST API"
[FRAMEWORK] = "Vue 3 + Nuxt 3"
[STYLING_SYSTEM] = "Vuetify + Custom CSS"
[BACKEND_TYPE] = "REST API with Express.js"
[LANGUAGE] = "TypeScript"
[TARGET_FILE_PATH] = "pages/dashboard.vue"
[CURRENT_FEATURES] = "Data visualization, user authentication, real-time charts"
```

### **Example 3: E-commerce Site**
```
[PROJECT_NAME] = "Online Store"
[TECH_STACK] = "React + JavaScript + Styled Components + GraphQL"
[FRAMEWORK] = "React 18 + Vite"
[STYLING_SYSTEM] = "Styled Components + CSS Grid"
[BACKEND_TYPE] = "GraphQL with Apollo"
[LANGUAGE] = "JavaScript"
[TARGET_FILE_PATH] = "src/components/ProductPage.jsx"
[CURRENT_FEATURES] = "Product catalog, shopping cart, payment processing, user accounts"
```

---

## 📝 **How to Use This Template**

1. **Copy the template** from the code block above
2. **Replace ALL `[PLACEHOLDER]` values** with your specific project details
3. **Paste your UI code** in the `[PASTE_YOUR_UI_CODE_OR_DESIGN_DESCRIPTION_HERE]` section
4. **Customize requirements** based on your specific needs
5. **Submit the completed prompt** for implementation

## 🎯 **Template Benefits**

✅ **Reusable** - Works for any project type  
✅ **Comprehensive** - Covers all technical aspects  
✅ **Flexible** - Adapts to different tech stacks  
✅ **Structured** - Ensures nothing is missed  
✅ **Professional** - Maintains quality standards  

This template ensures consistent, high-quality UI integrations across any project! 🚀
