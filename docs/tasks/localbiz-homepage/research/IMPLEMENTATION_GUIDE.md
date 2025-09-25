# LocalBiz Homepage Implementation Guide

## Overview
Transform the LocalBiz UI from `ui/code.html` into a React-based homepage using the existing Elite Next.js SaaS Starter Kit design system and architecture.

## Current Project Analysis

### Design System Tokens (OKLCH-based)
- **Primary**: `oklch(0.5106 0.2301 276.9656)` (#4f46e5 purple)
- **Secondary**: `oklch(0.7038 0.1230 182.5025)` (#14b8a6 teal)  
- **Accent**: `oklch(0.7686 0.1647 70.0804)` (#f59e0b yellow)
- **Background**: `oklch(0.9789 0.0082 121.6272)` (#f7f9f3 light green)
- **Foreground**: `oklch(0 0 0)` (black)
- **Card**: `oklch(1.0000 0 0)` (white)
- **Muted**: `oklch(0.9551 0 0)` (#f0f0f0)
- **Border**: `oklch(0 0 0)` (black)

### Typography System
- **Font Sans**: Allerta Stencil (defined in CSS but Geist used in layout)
- **Font Serif**: Amiri Quran  
- **Font Mono**: Anonymous Pro
- **Tracking**: `--tracking-normal: 0.025em`
- **Spacing**: `--spacing: 0.25rem` (4px base unit)
- **Radius**: `--radius: 1rem` with variants

### Existing Components Available
- Button (variants: default, secondary, outline, ghost, destructive)
- Input (with design system integration)
- Card (with shadow system)
- Badge (for categories/tags)
- Avatar (for user profiles)

## LocalBiz UI Analysis

### Current HTML Structure
1. **Header**: Logo + Navigation + Search + "List Your Business" button + User avatar
2. **Hero Section**: Background image + title + subtitle + search bar
3. **Map Section**: Interactive map with location search + zoom controls
4. **Featured Businesses**: Horizontal scroll cards with images + descriptions
5. **Popular Categories**: Grid layout with category images + labels

### Color Mapping Strategy
| LocalBiz HTML | Design System Token | Usage |
|---------------|-------------------|--------|
| `#131416` (dark text) | `text-foreground` | Main text |
| `#6b7580` (muted text) | `text-muted-foreground` | Secondary text |
| `#f1f2f3` (light bg) | `bg-muted` | Input backgrounds |
| `#cbdbeb` (button bg) | `bg-secondary` | Secondary buttons |
| White backgrounds | `bg-card` | Card backgrounds |
| Borders | `border-border` | All borders |

## Implementation Strategy

### Phase 1: Setup and Structure
1. Create new homepage at `app/(landing)/page.tsx` (replace existing)
2. Create component directory structure:
   ```
   app/(landing)/
   ├── page.tsx (main LocalBiz homepage)
   ├── components/
   │   ├── LocalBizHeader.tsx
   │   ├── HeroSection.tsx  
   │   ├── MapSection.tsx
   │   ├── FeaturedBusinesses.tsx
   │   ├── PopularCategories.tsx
   │   └── BusinessCard.tsx
   ```

### Phase 2: Component Development
1. **LocalBizHeader**: Use existing Button, Input, Avatar components
2. **HeroSection**: Background image + search using Card, Input, Button
3. **MapSection**: Placeholder map with Input, Button controls
4. **FeaturedBusinesses**: Horizontal scroll using Card components
5. **PopularCategories**: Grid layout using Card components
6. **BusinessCard**: Reusable card for business listings

### Phase 3: Data Integration
1. Create Convex schema for businesses
2. Add business queries and mutations
3. Integrate real-time data fetching
4. Add search functionality

### Phase 4: Responsive & Accessibility
1. Implement responsive breakpoints
2. Add ARIA attributes
3. Test keyboard navigation
4. Verify screen reader compatibility

## Technical Requirements

### Font Configuration
- **Issue**: Documentation mentions Allerta Stencil but layout.tsx uses Geist
- **Solution**: Use existing Geist fonts for consistency, update if needed
- **Implementation**: Apply `font-sans` class throughout components

### Image Optimization
- Replace background image URLs with Next.js Image component where possible
- Use placeholder images for development
- Implement lazy loading for business images

### State Management
- Use React hooks for local state (search, filters)
- Convex queries for server state
- No additional state management needed

### Styling Approach
- **Strict Design Token Usage**: No hard-coded colors/spacing
- **Responsive Design**: Mobile-first with Tailwind breakpoints
- **Dark Mode**: Ensure compatibility with existing theme system
- **Component Composition**: Build on existing shadcn/ui components

## Next Steps
1. Update task status and begin component structure creation
2. Implement LocalBizHeader component first
3. Progressive enhancement of each section
4. Integration testing and optimization

## Success Criteria
- [ ] Exact visual match to LocalBiz design
- [ ] 100% design system token usage
- [ ] Responsive across all breakpoints  
- [ ] Accessibility compliance
- [ ] Real-time data integration
- [ ] Performance optimization
- [ ] Light/dark mode compatibility
