# 🛠️ DEVELOPMENT_GUIDE - Elite Next.js SaaS Starter Kit

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (LTS recommended)
- **Package Manager**: npm, pnpm, yarn, or bun
- **Clerk Account** for authentication and billing
- **Convex Account** for database

### Installation

1. **Clone and Setup**
```bash
# Clone the repository
git clone <repository-url>
cd elite-next-starter

# Install dependencies
npm install  # or pnpm/yarn/bun install
```

2. **Environment Configuration**
```bash
# Copy environment template
cp .env.example .env.local
```

3. **Configure Environment Variables**
```env
# Clerk Authentication & Billing
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://your-frontend-api.clerk.accounts.dev

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

4. **Initialize Convex**
```bash
# Start Convex development
npx convex dev
# This will prompt for login and create your database
```

5. **Start Development Server**
```bash
npm run dev
```

Your application will be available at `http://localhost:3000`.

## 🏗️ Project Structure

```
elite-next-starter/
├── app/                    # Next.js App Router
│   ├── (landing)/         # Landing page components
│   ├── dashboard/         # Protected dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── not-found.tsx      # Custom 404
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── custom/           # Custom components
│   └── providers/        # Context providers
├── convex/               # Backend functions
│   ├── schema.ts         # Database schema
│   ├── users.ts          # User functions
│   ├── paymentAttempts.ts # Payment functions
│   └── http.ts           # Webhook handlers
├── hooks/                # Custom React hooks
├── lib/                  # Utilities
├── public/               # Static assets
└── docs/                 # Documentation
```

## 🔧 Development Workflow

### Daily Development Routine

1. **Start Development Session**
```bash
# Terminal 1: Convex development
npx convex dev

# Terminal 2: Next.js development
npm run dev
```

2. **Check Current Status**
- Review any pending documentation updates
- Check for any breaking changes
- Verify environment variables are current

3. **Development Best Practices**
- Follow the established file structure
- Use TypeScript strictly
- Test changes in both light and dark themes
- Verify responsive design on different screen sizes

### Code Organization Principles

#### File Naming Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Hooks**: camelCase starting with 'use' (`useUserData.ts`)

#### Component Structure
```typescript
// components/ui/Button.tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps {
  // Props interface
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn("base-styles", className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
```

#### Convex Function Structure
```typescript
// convex/users.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: { 
    name: v.string(),
    email: v.string() 
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    // Function implementation
  },
});
```

## 🎨 UI Development

### Design System
The project uses a comprehensive design system built on:
- **shadcn/ui** for base components
- **Radix UI** for accessibility
- **TailwindCSS** for styling
- **CSS Custom Properties** for theming

### Component Development
```typescript
// Create new components in components/ui/
import { cn } from "@/lib/utils";

interface ComponentProps {
  className?: string;
  // Other props
}

export function Component({ className, ...props }: ComponentProps) {
  return (
    <div className={cn("default-styles", className)} {...props}>
      {/* Component content */}
    </div>
  );
}
```

### Theme Customization
```css
/* app/globals.css */
:root {
  --primary: 210 40% 98%;
  --secondary: 210 40% 96%;
  /* Custom properties */
}

.dark {
  --primary: 222.2 84% 4.9%;
  --secondary: 217.2 32.6% 17.5%;
  /* Dark theme overrides */
}
```

## 🗄️ Database Development

### Schema Design
```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    externalId: v.string(), // Clerk ID
  })
  .index("byEmail", ["email"])
  .index("byExternalId", ["externalId"]),
});
```

### Function Development
```typescript
// Query Pattern
export const getUser = query({
  args: { userId: v.id("users") },
  returns: v.union(v.object({
    _id: v.id("users"),
    name: v.string(),
    email: v.string(),
  }), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Mutation Pattern
export const updateUser = mutation({
  args: { 
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, updates);
    return null;
  },
});
```

## 🔐 Authentication Development

### Protected Routes
```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});
```

### User Context
```typescript
// Use Clerk hooks in components
import { useUser } from '@clerk/nextjs';

export function UserProfile() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return <div>Not signed in</div>;
  
  return <div>Hello, {user.firstName}!</div>;
}
```

## 💳 Payment Integration

### Webhook Handling
```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const svix = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
    const payload = await svix.verify(body, headers);
    
    // Process webhook
    await ctx.runMutation(internal.users.upsertFromClerk, {
      data: payload.data
    });
    
    return new Response("OK");
  }),
});

export default http;
```

## 🧪 Testing Strategy

### Unit Testing (Planned)
```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### E2E Testing (Planned)
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign in', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Sign In');
  // Test authentication flow
});
```

## 🚀 Deployment

### Vercel Deployment
1. **Connect Repository**
   - Link GitHub repository to Vercel
   - Configure build settings

2. **Environment Variables**
   - Add all production environment variables
   - Include Clerk and Convex production keys

3. **Domain Configuration**
   - Set up custom domain
   - Configure DNS settings

### Environment Management
```bash
# Development
npm run dev

# Production Build
npm run build
npm run start

# Linting
npm run lint
```

## 🔍 Debugging

### Common Issues

#### Clerk Authentication Issues
```bash
# Check environment variables
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
echo $CLERK_SECRET_KEY

# Verify JWT template configuration
# Check Clerk dashboard > JWT Templates
```

#### Convex Connection Issues
```bash
# Restart Convex development
npx convex dev --reset

# Check Convex dashboard for errors
# Verify environment variables match
```

#### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Development Tools
- **Next.js DevTools** - Built-in development tools
- **React DevTools** - Browser extension for React debugging
- **Convex Dashboard** - Real-time database monitoring
- **Clerk Dashboard** - User and authentication management

## 📝 Code Quality

### Linting Configuration
```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error"
  }
}
```

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## 🤝 Contributing Guidelines

### Before Contributing
1. Read the documentation thoroughly
2. Check existing issues and PRs
3. Follow the established code style
4. Write tests for new features

### Pull Request Process
1. Create feature branch from main
2. Make changes with clear commit messages
3. Update documentation if needed
4. Submit PR with detailed description

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] TypeScript types are properly defined
- [ ] Components are accessible
- [ ] Documentation is updated
- [ ] No console.log statements in production code

---

**Version**: 1.0.0  
**Last Updated**: September 17, 2025  
**Maintained by**: Elite Next.js SaaS Starter Kit Team
