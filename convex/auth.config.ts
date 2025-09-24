/**
 * Clerk Authentication Configuration for Convex
 *
 * This configuration extends the basic Clerk setup to support custom roles
 * for the local business directory application:
 * - visitor: Browse and search (no auth required, but can save favorites)
 * - owner: Manage own business listings (authenticated)
 * - admin: Approve listings, manage categories, moderate content
 *
 * Role information is stored in Clerk's user metadata and passed through
 * JWT claims to Convex for authorization decisions.
 */

export default {
  providers: [
    {
      domain: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL,
      applicationID: "convex",
      // Custom JWT claims configuration
      // This tells Convex to expect role information in the JWT token
      // The actual role assignment happens in the webhook handler
    },
  ],

  // Custom authorization configuration
  // These functions help Convex understand user roles and permissions
  authorization: {
    // Extract user role from JWT claims
    getUserRole: (identity: any) => {
      return identity?.metadata?.role || 'visitor';
    },

    // Check if user has required role or higher
    hasRole: (userRole: string, requiredRole: string) => {
      const roleHierarchy = {
        'visitor': 0,
        'owner': 1,
        'admin': 2
      };

      const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] ?? 0;
      const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] ?? 0;

      return userLevel >= requiredLevel;
    },

    // Check if user can access specific resource
    canAccessResource: (userRole: string, resourceType: string, resourceOwnerId?: string, userId?: string) => {
      // Admin can access everything
      if (userRole === 'admin') return true;

      // Owner can access their own resources
      if (userRole === 'owner' && resourceOwnerId === userId) return true;

      // Public resources accessible to all
      if (resourceType === 'public') return true;

      return false;
    }
  }
};