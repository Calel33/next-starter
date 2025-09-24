/**
 * Convex Functions: Moderation Logs API
 * 
 * Functions for tracking moderation actions and maintaining audit trails
 * for admin workflow management.
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

// Validators
const moderationLogValidator = v.object({
  _id: v.id("moderationLogs"),
  _creationTime: v.number(),
  action: v.union(v.literal("approve"), v.literal("reject"), v.literal("request_changes"), v.literal("archive"), v.literal("restore")),
  entityType: v.union(v.literal("listing"), v.literal("image"), v.literal("user")),
  entityId: v.string(),
  moderatorId: v.id("users"),
  reason: v.optional(v.string()),
  notes: v.optional(v.string()),
  previousStatus: v.optional(v.string()),
  newStatus: v.string(),
  automated: v.boolean(),
  reviewTime: v.optional(v.number()),
});

// Queries

/**
 * Get moderation logs for a specific entity
 */
export const getEntityModerationLogs = query({
  args: {
    entityType: v.union(v.literal("listing"), v.literal("image"), v.literal("user")),
    entityId: v.string(),
  },
  returns: v.array(moderationLogValidator),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    
    const logs = await ctx.db
      .query("moderationLogs")
      .withIndex("byEntity", (q) => q.eq("entityType", args.entityType).eq("entityId", args.entityId))
      .collect();
    
    // Sort by creation time (newest first)
    logs.sort((a, b) => b._creationTime - a._creationTime);
    
    return logs;
  },
});

/**
 * Get moderation logs by moderator
 */
export const getModeratorLogs = query({
  args: {
    moderatorId: v.optional(v.id("users")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.array(moderationLogValidator),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    
    let logs: any[] = [];
    
    if (args.moderatorId) {
      logs = await ctx.db
        .query("moderationLogs")
        .withIndex("byModerator", (q) => q.eq("moderatorId", args.moderatorId!))
        .collect();
    } else {
      logs = await ctx.db.query("moderationLogs").collect();
    }
    
    // Filter by date range
    if (args.startDate) {
      logs = logs.filter(log => log._creationTime >= args.startDate!);
    }
    if (args.endDate) {
      logs = logs.filter(log => log._creationTime <= args.endDate!);
    }
    
    // Sort by creation time (newest first)
    logs.sort((a, b) => b._creationTime - a._creationTime);
    
    // Apply limit
    if (args.limit) {
      logs = logs.slice(0, args.limit);
    }
    
    return logs;
  },
});

/**
 * Get recent moderation activity (admin dashboard)
 */
export const getRecentModerationActivity = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(moderationLogValidator),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    
    const limit = args.limit || 50;
    
    const logs = await ctx.db
      .query("moderationLogs")
      .order("desc")
      .take(limit);
    
    return logs;
  },
});

/**
 * Get moderation statistics
 */
export const getModerationStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  returns: v.object({
    totalActions: v.number(),
    actionsByType: v.record(v.string(), v.number()),
    actionsByEntity: v.record(v.string(), v.number()),
    actionsByModerator: v.array(v.object({
      moderatorId: v.id("users"),
      moderatorName: v.string(),
      actionCount: v.number(),
    })),
    averageReviewTime: v.optional(v.number()),
    automatedActions: v.number(),
    manualActions: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    
    let logs = await ctx.db.query("moderationLogs").collect();
    
    // Filter by date range
    if (args.startDate) {
      logs = logs.filter(log => log._creationTime >= args.startDate!);
    }
    if (args.endDate) {
      logs = logs.filter(log => log._creationTime <= args.endDate!);
    }
    
    const totalActions = logs.length;
    
    // Actions by type
    const actionsByType: Record<string, number> = {};
    logs.forEach(log => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
    });
    
    // Actions by entity type
    const actionsByEntity: Record<string, number> = {};
    logs.forEach(log => {
      actionsByEntity[log.entityType] = (actionsByEntity[log.entityType] || 0) + 1;
    });
    
    // Actions by moderator
    const moderatorCounts: Record<string, number> = {};
    logs.forEach(log => {
      moderatorCounts[log.moderatorId] = (moderatorCounts[log.moderatorId] || 0) + 1;
    });
    
    const actionsByModerator = [];
    for (const [moderatorId, count] of Object.entries(moderatorCounts)) {
      const moderator = await ctx.db.get(moderatorId as any);
      if (moderator && "name" in moderator) {
        actionsByModerator.push({
          moderatorId: moderator._id as any,
          moderatorName: (moderator as any).name || "Unknown",
          actionCount: count,
        });
      }
    }
    
    // Average review time
    const reviewTimes = logs
      .filter(log => log.reviewTime !== undefined)
      .map(log => log.reviewTime!);
    
    const averageReviewTime = reviewTimes.length > 0
      ? reviewTimes.reduce((sum, time) => sum + time, 0) / reviewTimes.length
      : undefined;
    
    // Automated vs manual actions
    const automatedActions = logs.filter(log => log.automated).length;
    const manualActions = logs.filter(log => !log.automated).length;
    
    return {
      totalActions,
      actionsByType,
      actionsByEntity,
      actionsByModerator,
      averageReviewTime,
      automatedActions,
      manualActions,
    };
  },
});

// Mutations

/**
 * Log a moderation action
 */
export const logModerationAction = mutation({
  args: {
    action: v.union(v.literal("approve"), v.literal("reject"), v.literal("request_changes"), v.literal("archive"), v.literal("restore")),
    entityType: v.union(v.literal("listing"), v.literal("image"), v.literal("user")),
    entityId: v.string(),
    reason: v.optional(v.string()),
    notes: v.optional(v.string()),
    previousStatus: v.optional(v.string()),
    newStatus: v.string(),
    automated: v.optional(v.boolean()),
    reviewTime: v.optional(v.number()),
  },
  returns: v.id("moderationLogs"),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    
    return await ctx.db.insert("moderationLogs", {
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      moderatorId: user._id,
      reason: args.reason,
      notes: args.notes,
      previousStatus: args.previousStatus,
      newStatus: args.newStatus,
      automated: args.automated || false,
      reviewTime: args.reviewTime,
    });
  },
});

/**
 * Bulk log moderation actions (for automated processes)
 */
export const bulkLogModerationActions = mutation({
  args: {
    actions: v.array(v.object({
      action: v.union(v.literal("approve"), v.literal("reject"), v.literal("request_changes"), v.literal("archive"), v.literal("restore")),
      entityType: v.union(v.literal("listing"), v.literal("image"), v.literal("user")),
      entityId: v.string(),
      reason: v.optional(v.string()),
      notes: v.optional(v.string()),
      previousStatus: v.optional(v.string()),
      newStatus: v.string(),
      automated: v.optional(v.boolean()),
      reviewTime: v.optional(v.number()),
    })),
  },
  returns: v.array(v.id("moderationLogs")),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    
    const logIds = [];
    
    for (const action of args.actions) {
      const logId = await ctx.db.insert("moderationLogs", {
        action: action.action,
        entityType: action.entityType,
        entityId: action.entityId,
        moderatorId: user._id,
        reason: action.reason,
        notes: action.notes,
        previousStatus: action.previousStatus,
        newStatus: action.newStatus,
        automated: action.automated || false,
        reviewTime: action.reviewTime,
      });
      
      logIds.push(logId);
    }
    
    return logIds;
  },
});

/**
 * Delete old moderation logs (cleanup function)
 */
export const cleanupOldLogs = mutation({
  args: { olderThanDays: v.number() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    
    const cutoffDate = Date.now() - (args.olderThanDays * 24 * 60 * 60 * 1000);
    
    const oldLogs = await ctx.db
      .query("moderationLogs")
      .filter((q) => q.lt(q.field("_creationTime"), cutoffDate))
      .collect();
    
    for (const log of oldLogs) {
      await ctx.db.delete(log._id);
    }
    
    return oldLogs.length;
  },
});
