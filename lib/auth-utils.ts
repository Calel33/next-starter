/**
 * Authentication and Role Management Utilities
 * 
 * This module provides utilities for managing user roles and permissions
 * in the local business directory application. It integrates with Clerk
 * authentication and Convex database to provide role-based access control.
 */

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

// Define the role types used throughout the application
export type UserRole = 'visitor' | 'owner' | 'admin';

// Role hierarchy for permission checking
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  visitor: 0,
  owner: 1,
  admin: 2,
} as const;

// Permission definitions for different actions
export const PERMISSIONS = {
  // Listing permissions
  CREATE_LISTING: ['owner', 'admin'],
  EDIT_OWN_LISTING: ['owner', 'admin'],
  EDIT_ANY_LISTING: ['admin'],
  DELETE_OWN_LISTING: ['owner', 'admin'],
  DELETE_ANY_LISTING: ['admin'],
  MODERATE_LISTING: ['admin'],
  
  // Category permissions
  VIEW_CATEGORIES: ['visitor', 'owner', 'admin'],
  CREATE_CATEGORY: ['admin'],
  EDIT_CATEGORY: ['admin'],
  DELETE_CATEGORY: ['admin'],
  
  // User management permissions
  VIEW_OWN_PROFILE: ['visitor', 'owner', 'admin'],
  EDIT_OWN_PROFILE: ['visitor', 'owner', 'admin'],
  VIEW_ANY_PROFILE: ['admin'],
  EDIT_ANY_PROFILE: ['admin'],
  ASSIGN_ROLES: ['admin'],
  
  // Analytics permissions
  VIEW_OWN_ANALYTICS: ['owner', 'admin'],
  VIEW_ALL_ANALYTICS: ['admin'],
  
  // Moderation permissions
  ACCESS_MODERATION_QUEUE: ['admin'],
  MODERATE_CONTENT: ['admin'],
  VIEW_MODERATION_LOGS: ['admin'],
} as const;

/**
 * Hook to get the current user's role from Clerk and Convex
 */
export function useUserRole(): {
  role: UserRole;
  isLoading: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isVisitor: boolean;
} {
  const { user, isLoaded } = useUser();
  const convexUser = useQuery(api.users.current);
  
  // Get role from Clerk metadata first, fallback to Convex user data
  const clerkRole = user?.publicMetadata?.role as UserRole;
  const convexRole = convexUser?.role as UserRole;
  const role: UserRole = clerkRole || convexRole || 'visitor';
  
  const isLoading = !isLoaded || (user && convexUser === undefined);
  
  return {
    role,
    isLoading,
    isAdmin: role === 'admin',
    isOwner: role === 'owner',
    isVisitor: role === 'visitor',
  };
}

/**
 * Check if a user role has permission for a specific action
 */
export function hasPermission(userRole: UserRole, permission: keyof typeof PERMISSIONS): boolean {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles.includes(userRole);
}

/**
 * Check if a user role is at least the required role level
 */
export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
  const userLevel = ROLE_HIERARCHY[userRole];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return userLevel >= requiredLevel;
}

/**
 * Check if user can access a specific resource
 */
export function canAccessResource(
  userRole: UserRole,
  resourceType: 'listing' | 'category' | 'user' | 'analytics' | 'moderation',
  resourceOwnerId?: string,
  currentUserId?: string
): boolean {
  // Admin can access everything
  if (userRole === 'admin') return true;
  
  // Resource-specific access rules
  switch (resourceType) {
    case 'listing':
      // Owners can access their own listings
      return userRole === 'owner' && resourceOwnerId === currentUserId;
      
    case 'category':
      // Categories are public for viewing, admin-only for editing
      return true; // Viewing is allowed, editing checked separately
      
    case 'user':
      // Users can access their own profile
      return resourceOwnerId === currentUserId;
      
    case 'analytics':
      // Owners can see their own analytics
      return userRole === 'owner' && resourceOwnerId === currentUserId;
      
    case 'moderation':
      // Only admins can access moderation features
      return false;
      
    default:
      return false;
  }
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    visitor: 'Visitor',
    owner: 'Business Owner',
    admin: 'Administrator',
  };
  
  return roleNames[role];
}

/**
 * Get role badge color for UI display
 */
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    visitor: 'bg-muted text-muted-foreground',
    owner: 'bg-secondary text-secondary-foreground',
    admin: 'bg-primary text-primary-foreground',
  };
  
  return colors[role];
}

/**
 * Validate role transition (for role assignment)
 */
export function canAssignRole(
  assignerRole: UserRole,
  targetRole: UserRole,
  currentTargetRole: UserRole
): boolean {
  // Only admins can assign roles
  if (assignerRole !== 'admin') return false;
  
  // Can't demote yourself from admin (prevent lockout)
  if (currentTargetRole === 'admin' && targetRole !== 'admin') {
    // This would need additional checks to ensure at least one admin remains
    return true; // Simplified for now
  }
  
  return true;
}

/**
 * Get default redirect URL based on user role
 */
export function getDefaultRedirectUrl(role: UserRole): string {
  const redirectUrls: Record<UserRole, string> = {
    visitor: '/directory',
    owner: '/dashboard/owner',
    admin: '/dashboard/admin',
  };
  
  return redirectUrls[role];
}

/**
 * Check if user needs onboarding based on role and profile completeness
 */
export function needsOnboarding(
  role: UserRole,
  user: any // Convex user object
): boolean {
  if (!user) return true;
  
  // Visitors don't need onboarding
  if (role === 'visitor') return false;
  
  // Owners need business information
  if (role === 'owner') {
    return !user.businessName || !user.email;
  }
  
  // Admins need basic profile completion
  if (role === 'admin') {
    return !user.email;
  }
  
  return false;
}

/**
 * Get onboarding steps for a user role
 */
export function getOnboardingSteps(role: UserRole): string[] {
  const steps: Record<UserRole, string[]> = {
    visitor: [],
    owner: [
      'Complete business information',
      'Verify email address',
      'Set up business location',
      'Create first listing',
    ],
    admin: [
      'Complete profile information',
      'Verify admin privileges',
      'Review moderation guidelines',
    ],
  };
  
  return steps[role];
}
