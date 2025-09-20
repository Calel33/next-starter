# AGENTS.md - Elite Next.js SaaS Starter Kit


Welcome to the Elite Next.js SaaS Starter Kit! This guide helps AI coding agents work effectively with this modern, production-ready SaaS template.

## 🚀 Project Overview

**Elite Next.js SaaS Starter Kit** is a complete SaaS foundation that eliminates weeks of integration work by providing authentication, payments, real-time data, and beautiful UI components working seamlessly out of the box.

### Core Value Proposition
"Stop rebuilding the same foundation over and over." This starter provides the easiest setup and cleanest codebase for building SaaS applications with focus on developer experience and production readiness.

### Key Technologies
- **Frontend**: Next.js 15 (App Router), TailwindCSS v4, shadcn/ui, Radix UI
- **Backend**: Convex (real-time database + serverless functions)
- **Authentication**: Clerk (with social logins)
- **Payments**: Clerk Billing (integrated subscription management)
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
elite-next-starter/
├── app/                    # Next.js App Router
│   ├── (landing)/         # Landing page components (grouped route)
│   ├── dashboard/         # Protected dashboard area
│   ├── globals.css        # Global styles and CSS variables
│   ├── layout.tsx         # Root layout with providers
│   └── not-found.tsx      # Custom 404 page
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── custom/           # Business-specific components
│   ├── kokonutui/        # KokonutUI components
│   ├── magicui/          # MagicUI components
│   ├── motion-primitives/ # Animation components
│   └── react-bits/       # Custom animation components
├── convex/               # Backend functions and schema
│   ├── schema.ts         # Database schema definitions
│   ├── users.ts          # User management functions
│   ├── paymentAttempts.ts # Payment tracking functions
│   ├── http.ts           # Webhook handlers
│   └── auth.config.ts    # Authentication configuration
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── docs/                 # Project documentation
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

## 🎨 UI Development Guidelines

### Design System
- **Base Components**: shadcn/ui for accessible, customizable components
- **Custom Components**: Build on top of base components
- **Theme System**: CSS custom properties for light/dark themes
- **Responsive Design**: Mobile-first with Tailwind breakpoints

### Animation Guidelines
```typescript
// Use Framer Motion for complex animations
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
>
  Content
</motion.div>
```

### Theme Customization
```css
/* app/globals.css */
:root {
  --primary: 210 40% 98%;
  --secondary: 210 40% 96%;
  --accent: 210 40% 78%;
}

.dark {
  --primary: 222.2 84% 4.9%;
  --secondary: 217.2 32.6% 17.5%;
  --accent: 217.2 32.6% 17.5%;
}
```

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

## 📚 Documentation Standards

### File Documentation
- **README.md**: Project overview and quick start
- **API Documentation**: Document all Convex functions
- **Component Documentation**: JSDoc comments for complex components
- **Architecture Docs**: High-level system design

### Code Comments
```typescript
/**
 * Creates a new user in the system and syncs with Clerk
 * @param name - User's display name
 * @param externalId - Clerk user ID for authentication
 * @returns The created user's database ID
 */
export const createUser = mutation({
  args: { name: v.string(), externalId: v.string() },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    // Implementation
  },
});
```

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

## 🤝 Agent Collaboration Guidelines

### When to Delegate
- **Complex Architecture Changes** → `@project-researcher-agent`
- **Code Review Needed** → `@code-reviewer`
- **Performance Issues** → `@performance-optimizer` 
- **UI/UX Improvements** → `@ui-configurator-agent`
- **Documentation Updates** → `@documentation-specialist`

### Handoff Pattern
```markdown
## Context for Next Agent
- Current task: [description]
- Files modified: [list]
- Next steps: [recommendations]
- Blockers: [any issues]
```

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

---

**Last Updated**: September 20, 2025  
**Version**: 1.0.0  
**Maintained by**: Elite Next.js SaaS Starter Kit Team

*This AGENTS.md file is designed to help AI coding agents work effectively with this project. Keep it updated as the project evolves.*
