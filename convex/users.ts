import { internalMutation, mutation, query, QueryCtx } from "./_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";
import { clerkClient } from "@clerk/backend";

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const userAttributes = {
      name: `${data.first_name} ${data.last_name}`,
      externalId: data.id,
      email: data.email_addresses?.[0]?.email_address,
    };

    const user = await userByExternalId(ctx, data.id);
    if (user === null) {
      // New user - assign default role based on signup context
      const role = determineUserRole(data);
      const newUserAttributes = {
        ...userAttributes,
        role,
        lastLoginAt: Date.now(),
        verificationStatus: (role === 'admin' ? 'verified' : 'pending') as "pending" | "verified" | "rejected",
      };

      await ctx.db.insert("users", newUserAttributes);

      // Sync role to Clerk's publicMetadata for middleware access
      // Only sync if role is different from what's already in Clerk
      if (data.public_metadata?.role !== role) {
        try {
          await clerkClient.users.updateUserMetadata(data.id, {
            publicMetadata: {
              ...data.public_metadata,
              role: role,
            }
          });
        } catch (error) {
          console.error('Failed to sync initial role to Clerk:', error);
          // Don't fail user creation if Clerk sync fails
        }
      }
    } else {
      // Existing user - update basic info but preserve role and other data
      const updateAttributes = {
        name: userAttributes.name,
        email: userAttributes.email,
        lastLoginAt: Date.now(),
      };

      await ctx.db.patch(user._id, updateAttributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
      );
    }
  },
});



export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByExternalId(ctx, identity.subject);
}

/**
 * Role assignment and management functions
 */

// Determine user role based on signup context and metadata
function determineUserRole(userData: UserJSON): "visitor" | "owner" | "admin" {
  // SECURITY: Admin roles can ONLY be assigned manually via Clerk dashboard
  // Never allow self-assignment of admin role through signup flow
  if (userData.public_metadata?.role === 'admin') {
    return 'admin';
  }

  // Check signup context from public metadata
  const signupContext = userData.public_metadata?.signupContext as string;

  // Business owner signup flow
  if (signupContext === 'business-owner' ||
      signupContext === 'claim-listing' ||
      userData.public_metadata?.businessOwner === true) {
    return 'owner';
  }

  // Default to visitor for general signups
  // Note: Admin role is NEVER assigned here - must be set manually
  return 'visitor';
}

// Update user role (admin only)
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    newRole: v.union(v.literal("visitor"), v.literal("owner"), v.literal("admin")),
    reason: v.optional(v.string())
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string()
  }),
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);

    // Only admins can change roles
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: "Unauthorized: Admin access required" };
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      return { success: false, message: "User not found" };
    }

    // Prevent removing the last admin
    if (targetUser.role === 'admin' && args.newRole !== 'admin') {
      const adminCount = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("role"), "admin"))
        .collect();

      if (adminCount.length <= 1) {
        return { success: false, message: "Cannot remove the last admin user" };
      }
    }

    await ctx.db.patch(args.userId, {
      role: args.newRole,
      verificationStatus: args.newRole === 'admin' ? 'verified' : targetUser.verificationStatus
    });

    // Sync role back to Clerk's publicMetadata for middleware access
    try {
      await clerkClient.users.updateUserMetadata(targetUser.externalId, {
        publicMetadata: {
          role: args.newRole,
        }
      });
    } catch (error) {
      console.error('Failed to sync role to Clerk:', error);
      // Don't fail the operation if Clerk sync fails
    }

    return { success: true, message: `Role updated to ${args.newRole}` };
  },
});

// Complete user onboarding
export const completeOnboarding = mutation({
  args: {
    businessName: v.optional(v.string()),
    businessType: v.optional(v.string()),
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
      address: v.string(),
    })),
    phone: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string()
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const updateData: any = {};

    // Business owner onboarding
    if (user.role === 'owner') {
      if (args.businessName) updateData.businessName = args.businessName;
      if (args.location) updateData.defaultLocation = args.location;
      if (args.phone) updateData.phone = args.phone;
      updateData.verificationStatus = 'pending'; // Will be verified by admin
    }

    // Mark onboarding as complete
    updateData.onboardingCompleted = true;
    updateData.onboardingCompletedAt = Date.now();

    await ctx.db.patch(user._id, updateData);

    return { success: true, message: "Onboarding completed successfully" };
  },
});

// Get user by role (admin only)
export const getUsersByRole = query({
  args: { role: v.union(v.literal("visitor"), v.literal("owner"), v.literal("admin")) },
  returns: v.array(v.object({
    _id: v.id("users"),
    name: v.string(),
    email: v.optional(v.string()),
    role: v.optional(v.union(v.literal("visitor"), v.literal("owner"), v.literal("admin"))),
    verificationStatus: v.optional(v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected"))),
    businessName: v.optional(v.string()),
    lastLoginAt: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);

    // Only admins can view users by role
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), args.role))
      .collect();
  },
});

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();
}