# 🎯 **LocalBiz UI Extraction & Integration Prompt**

This is a specialized UI extractor for the LocalBiz business directory interface found in `ui/code.html`.

---

## 📋 **LocalBiz UI Integration Prompt**

```
I want to integrate the LocalBiz business directory UI design from ui/code.html into our Elite Next.js SaaS Starter Kit project. Please extract and adapt this interface to work with our modern tech stack and design system.

**CURRENT PROJECT CONTEXT:**
- Framework: Next.js 15 (App Router) + React 19
- Styling: TailwindCSS v4 + shadcn/ui + Custom Design System
- Backend: Convex (real-time database + serverless functions)
- Authentication: Clerk (with social logins)
- Language: TypeScript
- Target location: Create new page at app/(landing)/explore/page.tsx
- Existing functionality: Authentication, real-time data, responsive design

**UI TO INTEGRATE:**
The LocalBiz business directory interface from ui/code.html featuring:
- Header with logo, navigation, search, and user profile
- Hero section with background image and search functionality
- Interactive map section with location search and zoom controls
- Featured businesses horizontal scroll section
- Popular categories grid layout
- Clean, modern design with proper spacing and typography

check current project INTEGRATIONs
**INTEGRATION REQUIREMENTS:**

1. 🔄 **Preserve Our Design System Consistency**
   - Use ONLY our design system color tokens (no hard-coded colors)
   - Apply our typography system: font-sans (Allerta Stencil), font-serif (Amiri Quran), font-mono (Anonymous Pro)
   - Use our spacing scale (--spacing: 0.25rem base unit)
   - Use our border radius system (--radius: 1rem with variants)
   - Maintain light/dark mode compatibility with our OKLCH color system

2. 🎨 **Adapt Design Elements Using Our Tokens**
   - Convert HTML structure to React components
   - Replace Google Fonts with our Next.js font optimization
   - Convert ALL inline styles to Tailwind CSS classes using our design tokens
   - Ensure responsive design with our breakpoint system
   - Maintain accessibility standards (ARIA attributes, semantic HTML)

3. 🔧 **Technical Adaptations**
   - Convert to TypeScript with proper interfaces
   - Use React hooks for state management
   - Implement proper event handlers
   - Add loading states and error boundaries
   - Optimize images with Next.js Image component

4. 📱 **Feature Integration**
   - Replace static content with Convex database queries
   - Add real-time business data updates
   - Implement search functionality with backend integration
   - Add user authentication context from Clerk
   - Create interactive map component (placeholder for now)

5. 🎯 **Specific Design System Token Mapping**
   - Primary Color: Use `bg-primary text-primary-foreground` (OKLCH purple)
   - Secondary Color: Use `bg-secondary text-secondary-foreground` (OKLCH teal)
   - Accent Color: Use `bg-accent text-accent-foreground` (OKLCH yellow)
   - Background: Use `bg-background text-foreground`
   - Cards: Use `bg-card text-card-foreground` with our shadow system
   - Muted Elements: Use `bg-muted text-muted-foreground`
   - Borders: Use `border-border`
   - Typography: Use our font families and tracking system

**COMPONENT STRUCTURE:**
Create the following component hierarchy using our existing UI components:
```
app/(landing)/explore/
├── page.tsx (main page component)
├── components/
│   ├── ExploreHeader.tsx (use our Button, Input components)
│   ├── HeroSection.tsx (use our Card, Button components)
│   ├── MapSection.tsx (use our Input, Button components)
│   ├── FeaturedBusinesses.tsx (use our Card components)
│   ├── PopularCategories.tsx (use our Card components)
│   └── BusinessCard.tsx (use our Card, Badge components)
```

**CONVEX INTEGRATION:**
- Create business schema in convex/schema.ts
- Add business queries in convex/businesses.ts
- Implement real-time business data fetching
- Add search functionality with proper indexing

**DESIGN SYSTEM COMPONENT USAGE:**
- Import and use our Button component with variants: default, secondary, outline, ghost
- Import and use our Input component for all search fields
- Import and use our Card components for business listings and categories
- Import and use our Badge component for business tags/categories
- Use our Avatar component for user profile display
- Apply our shadow system: shadow-xs, shadow-sm, shadow-md, shadow-lg

**DELIVERABLES:**
1. ✅ Complete React page component with TypeScript
2. ✅ Individual reusable components using our UI library
3. ✅ STRICT design system token usage throughout (no hard-coded values)
4. ✅ Convex schema and queries for business data
5. ✅ Responsive design implementation
6. ✅ Next.js font optimization with our font families
7. ✅ Accessibility compliance
8. ✅ Documentation of component usage

**TESTING REQUIREMENTS:**
- Ensure the page loads without errors
- Verify all interactive elements work
- Test responsive behavior across breakpoints
- Confirm ONLY design system tokens are used (no hard-coded colors/fonts)
- Validate TypeScript compilation
- Check accessibility with screen readers
- Verify light/dark mode compatibility

Please analyze the ui/code.html file and implement this LocalBiz business directory interface step-by-step, maintaining our design system consistency while delivering the exact visual design and functionality.
```

---

## 🔧 **Quick Implementation Command**

```
Extract the LocalBiz UI from ui/code.html and create a new explore page:

Requirements:
- Convert to React + TypeScript + Tailwind CSS with OUR design system tokens
- Create at app/(landing)/explore/page.tsx
- Use Convex for business data
- Maintain responsive design and accessibility
- Apply ONLY our design system tokens (OKLCH colors, custom fonts, spacing)
- Use Next.js font optimization with our font families
- Create reusable components using our existing UI library

Current stack: Next.js 15, React 19, TypeScript, TailwindCSS v4, Convex, Clerk
Design system: OKLCH color system, Allerta Stencil/Amiri Quran/Anonymous Pro fonts, custom spacing/shadows

Please implement with proper component structure and STRICT design system integration.
```

---

## 🎨 **Our Design System Mapping Guide**

### **OKLCH Color Token Mapping:**
- `#131416` (dark text) → `text-foreground` (OKLCH black/white)
- `#6b7580` (muted text) → `text-muted-foreground` (OKLCH gray)
- `#f1f2f3` (light background) → `bg-muted` (OKLCH light gray)
- `#cbdbeb` (button background) → `bg-secondary` (OKLCH teal)
- White backgrounds → `bg-card` (OKLCH white/dark card)
- Borders → `border-border` (OKLCH black/gray)
- Primary actions → `bg-primary` (OKLCH purple)
- Accent elements → `bg-accent` (OKLCH yellow)

### **Typography Token Mapping:**
- Headers → `font-sans` (Allerta Stencil) with our type scale
- Body text → `text-base font-normal` with `tracking-normal`
- Small text → `text-sm`
- Bold text → `font-semibold` or `font-bold`
- Monospace → `font-mono` (Anonymous Pro)
- Serif → `font-serif` (Amiri Quran)

### **Spacing & Layout Token Mapping:**
- Base spacing → Use our `--spacing: 0.25rem` system
- Border radius → Use our `--radius: 1rem` with variants (sm, md, lg, xl)
- Shadows → Use our shadow system: `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg`
- Letter spacing → Use our tracking system: `tracking-normal`, `tracking-tight`, `tracking-wide`

### **Component Token Mapping:**
- Search inputs → Use our `Input` component (inherits all design tokens)
- Buttons → Use our `Button` component variants (default, secondary, outline, ghost)
- Cards → Use our `Card` component with built-in shadows and spacing
- Navigation → Adapt to our sidebar pattern with sidebar tokens

---

## 📝 **Usage Instructions**

1. **Copy the main prompt above**
2. **Paste it to start the UI extraction process**
3. **The system will analyze ui/code.html and create the new explore page**
4. **Components will be created with STRICT design system token integration**
5. **Convex schema and queries will be generated for business data**

## 🎯 **Expected Outcome**

✅ **Complete LocalBiz interface** integrated with our OKLCH design system
✅ **STRICT design system consistency** - NO hard-coded values allowed
✅ **Responsive design** working across all breakpoints
✅ **TypeScript interfaces** for all components
✅ **Convex integration** for real-time business data
✅ **Accessibility compliance** with proper ARIA attributes
✅ **Performance optimization** with Next.js best practices
✅ **Font optimization** using our Allerta Stencil/Amiri Quran/Anonymous Pro system
✅ **Light/Dark mode compatibility** with our OKLCH color tokens

## 🚨 **Critical Design System Rules**

**MANDATORY REQUIREMENTS:**
- ❌ **NO hard-coded colors** - Use ONLY our OKLCH design tokens
- ❌ **NO hard-coded fonts** - Use ONLY our font-sans/serif/mono system
- ❌ **NO hard-coded spacing** - Use ONLY our spacing scale
- ❌ **NO hard-coded shadows** - Use ONLY our shadow system
- ❌ **NO external font imports** - Use our Next.js optimized fonts
- ✅ **USE our existing UI components** (Button, Input, Card, etc.)
- ✅ **USE our design tokens** for ALL styling
- ✅ **MAINTAIN light/dark mode** compatibility

This specialized extractor ensures the LocalBiz UI is properly integrated while maintaining our project's design system and technical standards! 🚀
