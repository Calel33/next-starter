# 🎯 **UI Extraction & Integration Prompt Template**

Here's a comprehensive prompt you can use to extract and integrate any UI design into your project:

---

## 📋 **Universal UI Integration Prompt Template**

```
I want to integrate a custom UI design into our [PROJECT_NAME] project. Please extract and adapt this interface to work with our [TECH_STACK] stack.

**CURRENT PROJECT CONTEXT:**
- Framework: [FRAMEWORK] (e.g., Next.js 15 + React 19)
- Styling: [STYLING_SYSTEM] (e.g., Tailwind CSS + shadcn/ui)
- Backend: [BACKEND_TYPE] (e.g., MCP integration, REST API, GraphQL)
- Language: [LANGUAGE] (e.g., TypeScript, JavaScript)
- Current file: [TARGET_FILE_PATH] (e.g., src/app/chat/page.tsx)
- Existing functionality: [CURRENT_FEATURES] (e.g., Real-time chat, streaming responses, user authentication)

**UI TO INTEGRATE:**
[PASTE_YOUR_UI_CODE_OR_DESIGN_DESCRIPTION_HERE]

**INTEGRATION REQUIREMENTS:**
1. 🔄 **Preserve All Existing Functionality**
   - Maintain MCP backend integration
   - Keep streaming chat responses
   - Preserve real-time message updates
   - Maintain conversation state management

2. 🎨 **Adapt Design Elements**
   - Convert HTML/CSS to React components
   - Replace vanilla JS with React hooks and state
   - Convert CSS classes to Tailwind CSS
   - Ensure responsive design
   - Maintain accessibility standards

3. 🔧 **Technical Adaptations**
   - Convert to TypeScript interfaces
   - Use React refs for DOM manipulation
   - Implement proper event handlers
   - Add proper error boundaries
   - Optimize for Next.js

4. 📱 **Feature Integration**
   - Auto-scroll behavior for new messages
   - Keyboard shortcuts (Enter/Shift+Enter)
   - Loading states and animations
   - Message formatting and display
   - Input validation and handling

5. 🎯 **Specific Adaptations Needed**
   - Replace any external font imports with Next.js font optimization
   - Convert animations to Tailwind CSS or CSS-in-JS
   - Adapt color schemes to work with dark/light modes
   - Ensure compatibility with existing MCP status indicators
   - Maintain conversation history functionality

**MULTIAGENT COORDINATION:**
Please use appropriate agent coordination:
- @agents-agument/core/ui-configurator-agent for design analysis
- @agents-agument/universal/frontend-developer for implementation
- Maintain context across agent handoffs
- Document all changes and decisions

**DELIVERABLES:**
1. ✅ Complete React component replacement
2. ✅ Updated TypeScript interfaces
3. ✅ Tailwind CSS styling
4. ✅ Preserved MCP functionality
5. ✅ Working animations and interactions
6. ✅ Responsive design
7. ✅ Documentation of changes made

**TESTING REQUIREMENTS:**
- Ensure the interface loads without errors
- Verify all interactive elements work
- Test message sending and receiving
- Confirm MCP status indicators function
- Validate responsive behavior
- Check accessibility compliance

Please analyze the provided UI design and implement it step-by-step, maintaining our existing MCP Multi-Agent functionality while delivering the exact visual design requested.
```

---

## 🔧 **Alternative Shorter Version**

```
Extract and integrate this UI design into our MCP Multi-Agent Next.js project:

[PASTE UI CODE/DESIGN HERE]

Requirements:
- Convert to React + TypeScript + Tailwind CSS
- Preserve all existing MCP chat functionality
- Maintain streaming responses and real-time updates
- Use Next.js font optimization (no CSS @imports)
- Ensure responsive design and accessibility
- Keep conversation state management
- Use multiagent coordination for implementation

Current stack: Next.js 15, React 19, TypeScript, Tailwind CSS, MCP backend
Target file: mcp-agent-ui/src/app/chat/page.tsx

Please implement step-by-step with proper agent coordination.
```

---

## 🎨 **Specialized Prompts for Different UI Types**

### **For Dashboard/Admin Interfaces:**
```
Integrate this dashboard UI into our MCP project, adapting it for AI chat management:
[PASTE CODE]
Focus on: sidebar navigation, data visualization, responsive layout, dark theme compatibility
```

### **For Mobile-First Designs:**
```
Convert this mobile UI to work in our MCP chat application:
[PASTE CODE]
Focus on: touch interactions, responsive breakpoints, mobile-optimized animations, gesture support
```

### **For Complex Animations:**
```
Integrate this animated UI into our MCP project:
[PASTE CODE]
Focus on: converting animations to Tailwind/Framer Motion, performance optimization, React-compatible transitions
```

### **For Component Libraries:**
```
Extract these UI components and create a reusable component library for our MCP project:
[PASTE CODE]
Focus on: component modularity, TypeScript props, Storybook documentation, theme consistency
```

---

## 📝 **Usage Instructions**

1. **Copy the main prompt template**
2. **Replace `[PASTE YOUR HTML/CSS/JS CODE OR DESCRIBE THE DESIGN HERE]` with your actual UI code**
3. **Modify requirements based on your specific needs**
4. **Add any additional context about your design goals**
5. **Submit to me for implementation**

## 🎯 **What This Prompt Ensures**

✅ **Preserves existing functionality** - No loss of MCP features  
✅ **Proper tech stack integration** - Next.js, React, TypeScript, Tailwind  
✅ **Multiagent coordination** - Structured approach with appropriate agents  
✅ **Quality standards** - Accessibility, responsiveness, performance  
✅ **Documentation** - Complete change tracking and handoffs  
✅ **Testing coverage** - Verification of all functionality  

This prompt template will help you integrate any UI design while maintaining the robust MCP Multi-Agent functionality we've built together! 🚀
