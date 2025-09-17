# 🔌 API_REFERENCE - Elite Next.js SaaS Starter Kit

## 📋 API Overview

The Elite Next.js SaaS Starter Kit provides a comprehensive API through Convex functions and Next.js API routes. All APIs are type-safe and real-time enabled.

## 🏗️ API Architecture

### Convex Functions
- **Queries** - Read operations with real-time subscriptions
- **Mutations** - Write operations with optimistic updates
- **Actions** - Server-side operations with external API calls
- **HTTP Actions** - Webhook and external HTTP endpoints

### Next.js API Routes
- **Middleware** - Authentication and route protection
- **Static Generation** - Build-time data fetching

## 🔐 Authentication

All protected APIs require valid Clerk authentication tokens.

### Authentication Headers
```typescript
// Automatic with Convex client
const user = useQuery(api.users.getCurrentUser);

// Manual JWT token (if needed)
const token = await getToken();
```

## 👤 User Management API

### Get Current User
**Type**: Query  
**Function**: `api.users.getCurrentUser`

```typescript
// Usage
const user = useQuery(api.users.getCurrentUser);

// Returns
type User = {
  _id: Id<"users">;
  _creationTime: number;
  name: string;
  externalId: string; // Clerk ID
} | null;
```

### Create User
**Type**: Mutation  
**Function**: `api.users.create`

```typescript
// Usage
const createUser = useMutation(api.users.create);
await createUser({ 
  name: "John Doe",
  externalId: "clerk_user_id" 
});

// Arguments
type CreateUserArgs = {
  name: string;
  externalId: string;
};

// Returns
type CreateUserReturn = Id<"users">;
```

### Update User
**Type**: Mutation  
**Function**: `api.users.update`

```typescript
// Usage
const updateUser = useMutation(api.users.update);
await updateUser({ 
  userId: "user_id",
  name: "Jane Doe" 
});

// Arguments
type UpdateUserArgs = {
  userId: Id<"users">;
  name?: string;
};

// Returns
type UpdateUserReturn = null;
```

### Upsert User from Clerk
**Type**: Internal Mutation  
**Function**: `internal.users.upsertFromClerk`

```typescript
// Internal use only (webhooks)
await ctx.runMutation(internal.users.upsertFromClerk, {
  clerkUserId: "clerk_user_id",
  name: "User Name",
  email: "user@example.com"
});

// Arguments
type UpsertFromClerkArgs = {
  clerkUserId: string;
  name: string;
  email: string;
};
```

## 💳 Payment Management API

### Get Payment Attempts
**Type**: Query  
**Function**: `api.paymentAttempts.getByUser`

```typescript
// Usage
const payments = useQuery(api.paymentAttempts.getByUser, {
  userId: "user_id"
});

// Arguments
type GetPaymentAttemptsArgs = {
  userId: Id<"users">;
};

// Returns
type PaymentAttempt = {
  _id: Id<"paymentAttempts">;
  _creationTime: number;
  payment_id: string;
  userId: Id<"users">;
  payer: {
    user_id: string;
  };
  status: "pending" | "completed" | "failed";
  amount: number;
  currency: string;
};
```

### Create Payment Attempt
**Type**: Mutation  
**Function**: `api.paymentAttempts.create`

```typescript
// Usage
const createPayment = useMutation(api.paymentAttempts.create);
await createPayment({
  payment_id: "payment_123",
  userId: "user_id",
  amount: 2999, // in cents
  currency: "usd"
});

// Arguments
type CreatePaymentAttemptArgs = {
  payment_id: string;
  userId: Id<"users">;
  amount: number;
  currency: string;
  status?: "pending" | "completed" | "failed";
};
```

### Update Payment Status
**Type**: Internal Mutation  
**Function**: `internal.paymentAttempts.updateStatus`

```typescript
// Internal use only (webhooks)
await ctx.runMutation(internal.paymentAttempts.updateStatus, {
  payment_id: "payment_123",
  status: "completed"
});

// Arguments
type UpdatePaymentStatusArgs = {
  payment_id: string;
  status: "pending" | "completed" | "failed";
};
```

## 🌐 HTTP Endpoints

### Clerk User Webhook
**Method**: POST  
**Path**: `/clerk-users-webhook`  
**Type**: HTTP Action

Handles Clerk user events for synchronization.

```typescript
// Webhook Events Handled
type ClerkWebhookEvents = 
  | "user.created"
  | "user.updated" 
  | "user.deleted"
  | "paymentAttempt.updated";

// Request Body
type WebhookPayload = {
  type: ClerkWebhookEvents;
  data: {
    id: string;
    // Event-specific data
  };
};

// Response
// 200 OK - Success
// 400 Bad Request - Invalid payload
// 401 Unauthorized - Invalid signature
```

### Example Webhook Usage
```bash
# Test webhook locally
curl -X POST http://localhost:3000/clerk-users-webhook \
  -H "Content-Type: application/json" \
  -H "svix-id: msg_example" \
  -H "svix-timestamp: 1234567890" \
  -H "svix-signature: v1,signature_here" \
  -d '{"type":"user.created","data":{"id":"user_123"}}'
```

## 🔍 Query Patterns

### Real-time Subscriptions
```typescript
// Automatic real-time updates
const users = useQuery(api.users.list);
// Component re-renders when data changes

// Conditional queries
const user = useQuery(
  userId ? api.users.getById : "skip",
  userId ? { userId } : undefined
);
```

### Optimistic Updates
```typescript
// Mutations with optimistic updates
const updateUser = useMutation(api.users.update);

// Optimistic update pattern
const handleUpdate = async (newName: string) => {
  // UI updates immediately
  await updateUser({ userId, name: newName });
  // Reverts if mutation fails
};
```

### Pagination
```typescript
// Paginated queries
const { results, status, loadMore } = usePaginatedQuery(
  api.users.listPaginated,
  {},
  { initialNumItems: 10 }
);

// Load more data
const handleLoadMore = () => {
  loadMore(10);
};
```

## 🔒 Security Considerations

### Input Validation
All API functions use Zod validators for input validation:

```typescript
// Function with validation
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // args are automatically validated
  },
});
```

### Authentication Checks
```typescript
// Authenticated function
export const getPrivateData = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    // Function logic
  },
});
```

### Rate Limiting
```typescript
// Planned: Rate limiting implementation
export const rateLimitedFunction = mutation({
  args: { /* args */ },
  handler: async (ctx, args) => {
    // Rate limiting logic (to be implemented)
  },
});
```

## 🚨 Error Handling

### Error Types
```typescript
// Common error patterns
type APIError = 
  | { type: "UNAUTHORIZED"; message: string }
  | { type: "VALIDATION_ERROR"; field: string; message: string }
  | { type: "NOT_FOUND"; resource: string }
  | { type: "INTERNAL_ERROR"; message: string };
```

### Error Handling Patterns
```typescript
// In components
const MyComponent = () => {
  const user = useQuery(api.users.getCurrentUser);
  
  if (user === undefined) return <div>Loading...</div>;
  if (user === null) return <div>User not found</div>;
  
  return <div>Hello, {user.name}!</div>;
};

// With error boundaries
const createUser = useMutation(api.users.create);

const handleCreate = async (userData: CreateUserArgs) => {
  try {
    await createUser(userData);
  } catch (error) {
    console.error("Failed to create user:", error);
    // Handle error appropriately
  }
};
```

## 📊 Performance Considerations

### Query Optimization
```typescript
// Efficient queries with indexes
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Uses index for fast lookup
    return await ctx.db
      .query("users")
      .withIndex("byEmail", (q) => q.eq("email", args.email))
      .unique();
  },
});
```

### Batch Operations
```typescript
// Batch mutations for efficiency
export const batchUpdateUsers = mutation({
  args: { 
    updates: v.array(v.object({
      userId: v.id("users"),
      name: v.string(),
    }))
  },
  handler: async (ctx, args) => {
    // Process multiple updates in single transaction
    for (const update of args.updates) {
      await ctx.db.patch(update.userId, { name: update.name });
    }
  },
});
```

## 🔄 Migration Patterns

### Schema Evolution
```typescript
// Backward-compatible schema changes
export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()), // New optional field
    // Existing fields remain unchanged
  }),
});
```

### Data Migration
```typescript
// Migration function example
export const migrateUserData = internalMutation({
  args: {},
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    
    for (const user of users) {
      if (!user.email) {
        await ctx.db.patch(user._id, {
          email: `${user.name.toLowerCase()}@example.com`
        });
      }
    }
  },
});
```

## 📈 Monitoring & Analytics

### Performance Monitoring
```typescript
// Function with performance tracking
export const monitoredFunction = query({
  args: {},
  handler: async (ctx, args) => {
    const startTime = Date.now();
    
    try {
      // Function logic
      const result = await someOperation();
      return result;
    } finally {
      const duration = Date.now() - startTime;
      console.log(`Function took ${duration}ms`);
    }
  },
});
```

### Usage Analytics
```typescript
// Track API usage (planned)
export const trackableFunction = mutation({
  args: { /* args */ },
  handler: async (ctx, args) => {
    // Track usage
    await ctx.runMutation(internal.analytics.trackUsage, {
      function: "trackableFunction",
      userId: ctx.auth.getUserIdentity()?.subject,
    });
    
    // Function logic
  },
});
```

---

**Version**: 1.0.0  
**Last Updated**: September 17, 2025  
**API Status**: Production Ready

## 📚 Additional Resources

- [Convex Documentation](https://docs.convex.dev/)
- [Clerk API Reference](https://clerk.com/docs/reference)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
