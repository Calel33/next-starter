# LocalBiz Homepage Integration Notes

## Current Codebase Integration Points

### 1. File Structure Integration
The LocalBiz homepage will replace the existing landing page while maintaining the project's architectural patterns:

```
app/(landing)/
├── page.tsx (REPLACE with LocalBiz homepage)
├── components/ (NEW directory for LocalBiz components)
│   ├── LocalBizHeader.tsx
│   ├── HeroSection.tsx
│   ├── MapSection.tsx
│   ├── FeaturedBusinesses.tsx
│   ├── PopularCategories.tsx
│   └── BusinessCard.tsx
├── hero-section.tsx (KEEP as backup/reference)
├── header.tsx (REFERENCE for navigation patterns)
└── footer.tsx (REUSE for LocalBiz footer)
```

### 2. Design System Integration

#### Font Configuration Alignment
**Current Issue**: Documentation mentions Allerta Stencil but layout.tsx uses Geist fonts.

**Resolution Strategy**:
- **Option A**: Update layout.tsx to use documented fonts (Allerta Stencil, Amiri Quran, Anonymous Pro)
- **Option B**: Use existing Geist fonts and update documentation
- **Recommendation**: Use existing Geist fonts for consistency with current implementation

#### Color Token Mapping
All LocalBiz colors will map to existing OKLCH design tokens:
```typescript
// LocalBiz -> Design System Mapping
"#131416" -> "text-foreground"           // Dark text
"#6b7580" -> "text-muted-foreground"     // Muted text  
"#f1f2f3" -> "bg-muted"                  // Light backgrounds
"#cbdbeb" -> "bg-secondary"              // Button backgrounds
"white"   -> "bg-card"                   // Card backgrounds
"borders" -> "border-border"             // All borders
```

### 3. Component Library Integration

#### Existing Components to Reuse
- **Button**: Use for "List Your Business", search buttons, navigation
- **Input**: Use for all search fields and form inputs
- **Card**: Use for business listings and category cards
- **Avatar**: Use for user profile display
- **Badge**: Use for business tags/categories (if needed)

#### Component Composition Strategy
```typescript
// Build LocalBiz components on existing foundation
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

// Compose LocalBiz-specific components
export function LocalBizHeader() {
  return (
    <header className="...">
      <Input className="..." />      // Reuse existing Input
      <Button variant="secondary">   // Reuse existing Button
        List Your Business
      </Button>
    </header>
  );
}
```

### 4. State Management Integration

#### Convex Integration Points
- **Business Data**: Create new schema and queries for business listings
- **Search Functionality**: Implement real-time search with Convex queries
- **User Authentication**: Integrate with existing Clerk authentication

#### State Architecture
```typescript
// Local state for UI interactions
const [searchQuery, setSearchQuery] = useState("");
const [selectedCategory, setSelectedCategory] = useState("");

// Server state via Convex
const businesses = useQuery(api.businesses.getFeatured);
const searchResults = useQuery(api.businesses.search, { query: searchQuery });
```

### 5. Routing Integration

#### Navigation Structure
- **Homepage**: `/` (LocalBiz interface)
- **Categories**: `/categories` (existing or new)
- **Business Listings**: `/business/[id]` (new)
- **Dashboard**: `/dashboard` (existing, unchanged)

#### Header Navigation Integration
```typescript
// Integrate with existing navigation patterns
import { useUser } from "@clerk/nextjs";

export function LocalBizHeader() {
  const { user } = useUser();
  
  return (
    <header>
      {/* Navigation items */}
      {user ? (
        <Avatar>...</Avatar>
      ) : (
        <Button>Sign In</Button>
      )}
    </header>
  );
}
```

### 6. Theme System Integration

#### Dark Mode Compatibility
Ensure all LocalBiz components work with existing theme system:
```typescript
// All components must support dark mode via design tokens
className="bg-background text-foreground"  // Auto dark mode
className="bg-card text-card-foreground"   // Card theming
className="border-border"                  // Border theming
```

#### Theme Provider Integration
LocalBiz components will automatically inherit theme from existing ThemeProvider in layout.tsx.

### 7. Performance Integration

#### Image Optimization
- Replace background image URLs with Next.js Image component
- Implement lazy loading for business images
- Use placeholder images during development

#### Code Splitting
- LocalBiz components will be automatically code-split by Next.js App Router
- Consider dynamic imports for heavy components (map section)

### 8. SEO Integration

#### Metadata Integration
```typescript
// Update app/(landing)/page.tsx metadata
export const metadata: Metadata = {
  title: "LocalBiz - Explore Local Businesses Worldwide",
  description: "Discover top-rated services and businesses in any location...",
};
```

### 9. Accessibility Integration

#### Existing Accessibility Patterns
- Reuse existing focus management from shadcn/ui components
- Maintain keyboard navigation patterns
- Ensure screen reader compatibility

#### LocalBiz-Specific Accessibility
```typescript
// Add ARIA labels for LocalBiz-specific elements
<section aria-label="Featured Businesses">
<nav aria-label="Main navigation">
<button aria-label="Search for businesses">
```

### 10. Development Workflow Integration

#### Component Development Order
1. **LocalBizHeader** - Integrates with existing auth and navigation
2. **HeroSection** - Standalone component with search functionality  
3. **BusinessCard** - Reusable component for listings
4. **FeaturedBusinesses** - Uses BusinessCard + Convex data
5. **PopularCategories** - Grid layout with navigation
6. **MapSection** - Complex component, implement last

#### Testing Integration
- Use existing testing patterns from the project
- Test with existing theme system (light/dark mode)
- Verify responsive behavior across breakpoints

### 11. Deployment Integration

#### Build Process
- LocalBiz components will be included in existing Next.js build
- No additional build configuration needed
- Verify image optimization works with new assets

#### Environment Variables
- Reuse existing Convex and Clerk environment variables
- No additional environment setup required

## Migration Strategy

### Phase 1: Backup and Prepare
1. Backup existing `app/(landing)/page.tsx`
2. Create new component directory structure
3. Set up development environment

### Phase 2: Component Development
1. Develop components in isolation
2. Test with existing design system
3. Integrate with Convex data layer

### Phase 3: Integration and Testing
1. Replace landing page with LocalBiz homepage
2. Test all integrations (auth, theme, responsive)
3. Performance optimization and accessibility testing

### Phase 4: Deployment
1. Deploy to staging environment
2. User acceptance testing
3. Production deployment

## Potential Integration Challenges

### 1. Font Consistency
- **Challenge**: Documentation vs implementation mismatch
- **Solution**: Standardize on existing Geist fonts

### 2. Image Assets
- **Challenge**: LocalBiz uses external image URLs
- **Solution**: Replace with placeholder images, implement proper image management

### 3. Map Integration
- **Challenge**: Interactive map functionality
- **Solution**: Start with placeholder, implement with Mapbox or Google Maps later

### 4. Search Functionality
- **Challenge**: Real-time search implementation
- **Solution**: Use Convex real-time queries with proper indexing

## Success Metrics

### Integration Success Criteria
- [ ] All components use design system tokens (0 hard-coded values)
- [ ] Responsive design works across all breakpoints
- [ ] Dark/light mode compatibility maintained
- [ ] Existing authentication flow preserved
- [ ] Performance metrics maintained or improved
- [ ] Accessibility standards met
- [ ] SEO optimization maintained
