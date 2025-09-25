# AGENTS.md - Elite Next.js Business Directory Platform

Welcome to the Elite Next.js Business Directory Platform! This guide helps AI coding agents work effectively with this comprehensive, production-ready business listing and discovery platform.

## 🚀 Project Overview

**Elite Next.js Business Directory Platform** is a complete business listing and discovery solution that provides geospatial search, real-time data synchronization, content moderation, analytics tracking, and beautiful UI components working seamlessly together.

### Core Value Proposition
"The complete business directory solution." This platform provides everything needed to build, manage, and scale a business directory with advanced search, mapping, analytics, and moderation capabilities.

### Key Technologies
- **Frontend**: Next.js 15 (App Router), TailwindCSS v4, shadcn/ui, Radix UI
- **Backend**: Convex (real-time database + serverless functions)
- **Authentication**: Clerk (with role-based access control)
- **Payments**: Clerk Billing (subscription management for premium features)
- **Mapping**: Mapbox GL JS (interactive maps with clustering)
- **Geospatial**: Advanced location-based search and filtering
- **Analytics**: Real-time event tracking and business intelligence
- **Moderation**: Content approval workflows and quality control
- **Animations**: Framer Motion, Motion Primitives
- **Development**: TypeScript, Turbopack, Vercel deployment

## 🏗️ Architecture Principles

### Design Patterns
- **Vertical Slice Architecture** - Features organized by domain
- **Composition over Inheritance** - Flexible component patterns  
- **Fail-fast Validation** - Early error detection with Zod schemas
- **Type Safety First** - TypeScript throughout the entire stack
- **Real-time by Default** - Live data synchronization with Convex

### File Organization Rules
- **One responsibility per file** - Maximum 500 lines per file
- **Modular design enforced** - Clear separation of concerns
- **Use relative imports** - Maintain clean import paths
- **Component-first approach** - Reusable, composable, self-contained components

## 📁 Project Structure

```
elite-next-business-directory/
├── app/                    # Next.js App Router
│   ├── (landing)/         # Landing page components (grouped route)
│   ├── dashboard/         # Protected dashboard with admin/owner views
│   │   ├── admin/         # Admin-only moderation and analytics
│   │   └── owner/         # Business owner management interface
│   ├── directory/         # Public business directory interface
│   │   ├── page.tsx       # Main search and map interface
│   │   ├── category/      # Category-based browsing
│   │   ├── listing/       # Individual business pages
│   │   └── search/        # Advanced search interface
│   ├── globals.css        # Global styles with design system
│   ├── layout.tsx         # Root layout with providers
│   └── not-found.tsx      # Custom 404 page
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── custom/           # Business directory components
│   │   ├── SearchInterface.tsx     # Advanced search with filters
│   │   ├── MapboxMap.tsx          # Interactive map component
│   │   ├── SearchResults.tsx      # Business listing results
│   │   ├── FilterPanel.tsx        # Category and location filters
│   │   ├── BusinessCard.tsx       # Individual business display
│   │   └── AnalyticsDashboard.tsx # Admin analytics interface
│   ├── kokonutui/        # Enhanced UI components
│   ├── magicui/          # Animation components
│   ├── motion-primitives/ # Advanced animations
│   └── react-bits/       # Custom animation components
├── convex/               # Backend functions and schema
│   ├── schema.ts         # Comprehensive database schema
│   ├── users.ts          # User management with roles
│   ├── listings.ts       # Business listing CRUD operations
│   ├── categories.ts     # Category management system
│   ├── images.ts         # Image upload and processing
│   ├── analytics.ts      # Event tracking and reporting
│   ├── moderationLogs.ts # Content moderation system
│   ├── paymentAttempts.ts # Payment tracking
│   ├── http.ts           # Webhook handlers
│   └── auth.config.ts    # Authentication configuration
├── hooks/                # Custom React hooks
│   ├── useBusinessSearch.ts      # Advanced search functionality
│   ├── useGeolocation.ts         # Location services
│   ├── useAnalytics.ts           # Event tracking
│   ├── useModerationStatus.ts    # Content moderation
│   └── useMapbox.ts              # Map interactions
├── lib/                  # Utility functions
│   ├── geocoding.ts      # Location services
│   ├── role-utils.ts     # User role management
│   └── auth-utils.ts     # Authentication helpers
├── docs/                 # Project documentation
│   ├── design-system/    # Design system tokens and guidelines
│   └── core/            # Core project documentation
└── middleware.ts         # Route protection middleware
```

## 🛠️ Build and Development Commands

### Prerequisites
- Node.js 18+ (LTS recommended)
- Package manager: npm, pnpm, yarn, or bun
- Clerk account for authentication and billing
- Convex account for database

### Setup Commands
```bash
# Install dependencies
npm install  # or pnpm/yarn/bun install

# Copy environment template
cp .env.example .env.local

# Initialize Convex database
npx convex dev

# Start development server with Turbopack
npm run dev
```

### Development Commands
```bash
# Development (with Turbopack for ultra-fast builds)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Convex development (run in separate terminal)
npx convex dev
```

## 🎨 Code Style Guidelines

### Component Development
```typescript
// Use forwardRef pattern for UI components
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary";
}

const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "base-styles",
          variant === "secondary" && "secondary-styles",
          className
        )}
        {...props}
      />
    );
  }
);

Component.displayName = "Component";
export { Component };
```

### Convex Function Pattern
```typescript
// Always use new function syntax with args and returns validators
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUser = query({
  args: { userId: v.id("users") },
  returns: v.union(v.object({
    _id: v.id("users"),
    name: v.string(),
    externalId: v.string(),
  }), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const createUser = mutation({
  args: { 
    name: v.string(),
    externalId: v.string() 
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", args);
  },
});
```

### Naming Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Hooks**: camelCase starting with 'use' (`useUserData.ts`)
- **Files**: kebab-case for non-components (`user-profile-utils.ts`)

## 🧪 Testing Guidelines

### Component Testing Pattern (Planned)
```typescript
// Use React Testing Library
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### E2E Testing Pattern (Planned)
```typescript
// Use Playwright for E2E tests
import { test, expect } from '@playwright/test';

test('user authentication flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Sign In');
  // Test complete auth flow
});
```

## 🔒 Security Considerations

### Authentication Security
- **JWT Validation**: Convex validates Clerk JWTs automatically
- **Route Protection**: Use middleware for protected routes
- **Environment Variables**: Never expose secrets in client code
- **Webhook Verification**: Use Svix for webhook signature validation

### Input Validation
- **Zod Schemas**: Validate all inputs with Zod
- **Convex Validators**: Use `v.*` validators for all function arguments
- **XSS Protection**: React's built-in XSS prevention + proper sanitization

### Environment Variables
```env
# Required for .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=...
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=...

# Required for Convex Dashboard
CLERK_WEBHOOK_SECRET=whsec_...
```

## 🗄️ Database Schema Guidelines

### Current Schema
```typescript
// convex/schema.ts
export default defineSchema({
  users: defineTable({
    name: v.string(),
    externalId: v.string(), // Clerk ID
  }).index("byExternalId", ["externalId"]),
  
  paymentAttempts: defineTable(paymentAttemptSchemaValidator)
    .index("byPaymentId", ["payment_id"])
    .index("byUserId", ["userId"])
    .index("byPayerUserId", ["payer.user_id"]),
});
```

### Schema Best Practices
- **Always define indexes** for query patterns
- **Use descriptive index names** including all fields
- **System fields** `_id` and `_creationTime` are automatic
- **Foreign keys** use `v.id("tableName")` type
- **Index order matters** - query fields in same order as defined

## 🎨 Design System & UI Development Guidelines

### Design System Overview
Our design system provides a comprehensive foundation for consistent, accessible, and beautiful UI components. **CRITICAL: Always use design system tokens - no hard-coded styles allowed.**

### 🎨 Design System Tokens

**CRITICAL: Always use design system tokens - no hard-coded styles allowed.**

#### Core Colors
- **Primary**: #4f46e5 (light) / #818cf8 (dark) - Brand actions
- **Secondary**: #14b8a6 (light) / #2dd4bf (dark) - Supporting elements
- **Accent**: #f59e0b (light) / #fcd34d (dark) - Highlights and alerts

#### Typography
- **Font Sans**: "Allerta Stencil", ui-sans-serif, system-ui
- **Font Serif**: "Amiri Quran", ui-serif
- **Font Mono**: "Anonymous Pro", ui-monospace

#### Spacing & Layout
- **Base Unit**: 4px (0.25rem)
- **Container**: 1280px max-width
- **Border Radius**: 1rem base with calculated variants

### 🌑 Design System Usage Rules

#### Color Usage Guidelines
1. **Light mode default** with dark mode via `.dark` class toggle
2. **Primary** (#4f46e5 / #818cf8) is brand-defining → use only for main actions
3. **Accent** (#f59e0b / #fcd34d) reserved for highlights and alerts, not base UI
4. **Sidebar tokens** keep shell navigation consistent across modes
5. **Never use hard-coded colors** - always reference design tokens

#### Component Development with Design System
```typescript
// CORRECT: Using design system tokens
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "accent" | "destructive";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles using design tokens
          "inline-flex items-center justify-center rounded-lg font-semibold transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          // Variant styles using design tokens
          {
            "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
            "bg-accent text-accent-foreground hover:bg-accent/80": variant === "accent",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
          },
          // Size variants using spacing tokens
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4": size === "md",
            "h-12 px-6 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
```

### Animation Guidelines
```typescript
// Use Framer Motion for complex animations with design system values
import { motion } from "framer-motion";

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.div
  variants={variants}
  initial="hidden"
  animate="visible"
  transition={{ duration: 0.3 }}
  className="bg-card text-card-foreground p-6 rounded-lg shadow-md"
>
  Content using design tokens
</motion.div>
```

### Design System Installation
To install the complete design system theme:
```bash
npx shadcn@latest add https://tweakcn.com/r/themes/cmfok4nnx000d04l7552dciz9
```

### Base Components
- **shadcn/ui**: Accessible, customizable base components
- **Custom Components**: Build on top of base components using design tokens
- **Theme System**: CSS custom properties for seamless light/dark mode switching
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## 🔗 Integration Patterns

### Webhook Integration
```typescript
// convex/http.ts - Webhook handler pattern
export const POST = httpAction(async (ctx, request) => {
  const svix = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  const payload = await svix.verify(body, headers);
  
  // Process webhook event
  await ctx.runMutation(internal.users.upsertFromClerk, {
    data: payload.data
  });
  
  return new Response("OK");
});
```

### Real-time Data Pattern
```typescript
// Client-side real-time queries
const messages = useQuery(api.messages.list, { channelId });
const sendMessage = useMutation(api.messages.send);

// Automatic real-time updates - no additional code needed
```

## 🚀 Deployment Guidelines

### Vercel Deployment (Recommended)
1. **Repository Connection**: Link GitHub repo to Vercel
2. **Environment Variables**: Set all production env vars in Vercel dashboard
3. **Domain Setup**: Configure custom domain and DNS
4. **Automatic Deployments**: Main branch deploys automatically

### Build Optimization
- **Turbopack**: Ultra-fast development builds
- **Code Splitting**: Automatic route-based splitting  
- **Image Optimization**: Next.js automatic optimization
- **Edge Functions**: Planned for API routes



## 🐛 Common Gotchas

### Convex-Specific
- **Don't use filter() in queries** - Use indexes with `withIndex()` instead
- **Always include return validators** - Use `v.null()` for void functions
- **Function references** - Use `api.file.function` or `internal.file.function`
- **HTTP endpoints** - Defined in `convex/http.ts` with `httpAction`

### Next.js App Router
- **Server Components** - Default in App Router, use 'use client' when needed
- **Route Groups** - Use `(name)` for organization without affecting URL
- **Loading States** - Use `loading.tsx` files for route-level loading
- **Error Boundaries** - Use `error.tsx` files for error handling

### Clerk Integration
- **JWT Template** - Must create "convex" template in Clerk dashboard
- **Webhook URLs** - Point to your deployed app, not localhost
- **Environment Sync** - Keep Clerk and Convex env vars in sync

## 🎯 Development Best Practices

### Before Starting Work
1. **Read existing documentation** in `docs/` folder
2. **Check current session logs** for context
3. **Review recent changes** in git history
4. **Verify environment setup** is complete

### During Development  
1. **Follow established patterns** in existing code
2. **Write TypeScript strictly** - no `any` types
3. **Test in both themes** - light and dark mode
4. **Verify responsive design** on different screen sizes
5. **Update documentation** as you make changes

### Code Quality Checklist
- [ ] TypeScript types properly defined
- [ ] Components are accessible (ARIA attributes)
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Mobile responsiveness verified
- [ ] Documentation updated

## 📞 Support and Resources

### Official Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

### Project-Specific Resources
- `docs/core/` - Detailed project documentation
- `docs/SESSION_LOG.md` - Development session history
- `convex/README.md` - Backend function examples
- Component examples in `components/` folders

**Last Updated**: September 24, 2025
**Version**: 2.0.0
**Maintained by**: Elite Next.js Business Directory Platform Team
