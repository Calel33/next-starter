# AGENTS.md - Elite Next.js Business Directory Platform

A complete business listing and discovery solution with geospatial search, real-time data, content moderation, and analytics.

## Project Overview

**Core Technologies:**
- Frontend: Next.js 15 (App Router), TailwindCSS v4, shadcn/ui
- Backend: Convex (real-time database + serverless functions)
- Auth: Clerk (role-based access control)
- Payments: Clerk Billing
- Mapping: Mapbox GL JS
- Development: TypeScript, Turbopack

## Architecture Principles

- **Vertical Slice Architecture** - Features organized by domain
- **Type Safety First** - TypeScript throughout the entire stack
- **One responsibility per file** - Maximum 500 lines per file
- **Component-first approach** - Reusable, composable components

## Project Structure

```
app/                    # Next.js App Router
├── (landing)/         # Landing page
├── dashboard/         # Role-based dashboards
├── directory/         # Public business directory
components/            # React components
├── ui/               # shadcn/ui base components
├── custom/           # Business directory components
convex/               # Backend functions and schema
hooks/                # Custom React hooks
lib/                  # Utility functions
docs/                 # Project documentation
```

## Build and Development Commands

**Setup:**
```bash
npm install
cp .env.example .env.local
npx convex dev
npm run dev
```

**Development:**
```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Linting
npx convex dev       # Convex development (separate terminal)
```

## Code Style Guidelines

**Component Pattern:**
```typescript
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("base-styles", variant === "secondary" && "secondary-styles", className)}
        {...props}
      />
    );
  }
);
Component.displayName = "Component";
```

**Convex Functions:**
```typescript
export const getUser = query({
  args: { userId: v.id("users") },
  returns: v.union(v.object({ _id: v.id("users"), name: v.string() }), v.null()),
  handler: async (ctx, args) => await ctx.db.get(args.userId),
});
```

**Naming:**
- Components: PascalCase (`UserProfile.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Constants: SCREAMING_SNAKE_CASE (`API_ENDPOINTS.ts`)
- Hooks: camelCase with 'use' (`useUserData.ts`)

## Testing Guidelines

**Component Testing (React Testing Library):**
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

**E2E Testing (Playwright):**
```typescript
import { test, expect } from '@playwright/test';

test('user authentication flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Sign In');
});
```

## Security Considerations

**Authentication:**
- JWT Validation: Convex validates Clerk JWTs automatically
- Route Protection: Use middleware for protected routes
- Environment Variables: Never expose secrets in client code

**Input Validation:**
- Zod Schemas: Validate all inputs with Zod
- Convex Validators: Use `v.*` validators for all function arguments
- XSS Protection: React's built-in XSS prevention

**Required Environment Variables:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=...
CLERK_WEBHOOK_SECRET=whsec_...
```

## Database Schema Guidelines

**Schema Example:**
```typescript
export default defineSchema({
  users: defineTable({
    name: v.string(),
    externalId: v.string(), // Clerk ID
  }).index("byExternalId", ["externalId"]),
});
```

**Best Practices:**
- Always define indexes for query patterns
- Use descriptive index names
- System fields `_id` and `_creationTime` are automatic
- Foreign keys use `v.id("tableName")` type
- Index order matters - query fields in same order as defined

## Design System Guidelines

**CRITICAL: Always use design system tokens - no hard-coded styles allowed.**

**Core Tokens:**
- Primary: #4f46e5 (light) / #818cf8 (dark) - Brand actions
- Secondary: #14b8a6 (light) / #2dd4bf (dark) - Supporting elements
- Accent: #f59e0b (light) / #fcd34d (dark) - Highlights and alerts
- Base Unit: 4px (0.25rem)
- Container: 1280px max-width

**Component Pattern:**
```typescript
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold transition-colors",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
          },
          className
        )}
        {...props}
      />
    );
  }
);
```

**Installation:**
```bash
npx shadcn@latest add https://tweakcn.com/r/themes/cmfok4nnx000d04l7552dciz9
```

## Integration Patterns

**Webhook Handler:**
```typescript
export const POST = httpAction(async (ctx, request) => {
  const svix = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  const payload = await svix.verify(body, headers);
  await ctx.runMutation(internal.users.upsertFromClerk, { data: payload.data });
  return new Response("OK");
});
```

**Real-time Data:**
```typescript
const messages = useQuery(api.messages.list, { channelId });
const sendMessage = useMutation(api.messages.send);
// Automatic real-time updates
```

## Deployment Guidelines

**Vercel Deployment:**
1. Link GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Configure custom domain and DNS
4. Main branch deploys automatically

**Build Optimization:**
- Turbopack: Ultra-fast development builds
- Code Splitting: Automatic route-based splitting
- Image Optimization: Next.js automatic optimization



## Common Gotchas

**Convex:**
- Don't use filter() in queries - Use indexes with `withIndex()` instead
- Always include return validators - Use `v.null()` for void functions
- Function references - Use `api.file.function` or `internal.file.function`

**Next.js App Router:**
- Server Components - Default in App Router, use 'use client' when needed
- Route Groups - Use `(name)` for organization without affecting URL
- Loading States - Use `loading.tsx` files for route-level loading

**Clerk Integration:**
- JWT Template - Must create "convex" template in Clerk dashboard
- Webhook URLs - Point to your deployed app, not localhost
- Environment Sync - Keep Clerk and Convex env vars in sync

## Development Best Practices

**Before Starting Work:**
1. Read existing documentation in `docs/` folder
2. Check current session logs for context
3. Review recent changes in git history
4. Verify environment setup is complete

**During Development:**
1. Follow established patterns in existing code
2. Write TypeScript strictly - no `any` types
3. Test in both themes - light and dark mode
4. Verify responsive design on different screen sizes
5. Update documentation as you make changes

**Code Quality Checklist:**
- [ ] TypeScript types properly defined
- [ ] Components are accessible (ARIA attributes)
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Mobile responsiveness verified
- [ ] Documentation updated

## Resources

**Official Documentation:**
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

**Project Resources:**
- `docs/core/` - Detailed project documentation
- `docs/SESSION_LOG.md` - Development session history
- `convex/README.md` - Backend function examples
