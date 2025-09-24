/**
 * Role-based Component Rendering Utilities
 * 
 * This module provides utilities for conditional component rendering based on user roles.
 * It includes hooks, wrapper components, and helper functions for role-based UI logic.
 */

import { ReactNode } from 'react'
import { useUserRole, UserRole, hasPermission, hasRoleLevel, canAccessResource } from './auth-utils'

// Re-export types and utilities for convenience
export type { UserRole } from './auth-utils'
export { hasPermission, hasRoleLevel, canAccessResource } from './auth-utils'

/**
 * Hook for conditional rendering based on user role
 */
export function useRoleBasedRendering() {
  const { role, isLoading, isAdmin, isOwner, isVisitor } = useUserRole()

  return {
    role,
    isLoading,
    isAdmin,
    isOwner,
    isVisitor,
    
    // Conditional rendering helpers
    renderForRole: (requiredRole: UserRole | UserRole[], content: ReactNode) => {
      if (isLoading) return null
      
      const hasRole = Array.isArray(requiredRole) 
        ? requiredRole.includes(role)
        : role === requiredRole
        
      return hasRole ? content : null
    },
    
    renderForPermission: (permission: string, content: ReactNode) => {
      if (isLoading) return null
      return hasPermission(role, permission as any) ? content : null
    },
    
    renderForMinRole: (minRole: UserRole, content: ReactNode) => {
      if (isLoading) return null
      return hasRoleLevel(role, minRole) ? content : null
    },
    
    // Conditional class helpers
    getClassForRole: (roleClasses: Partial<Record<UserRole, string>>, defaultClass = '') => {
      if (isLoading) return defaultClass
      return roleClasses[role] || defaultClass
    }
  }
}

/**
 * Component wrapper for role-based conditional rendering
 */
interface RoleBasedProps {
  children: ReactNode
  requiredRole?: UserRole | UserRole[]
  permission?: string
  minRole?: UserRole
  fallback?: ReactNode
  showLoading?: boolean
  loadingComponent?: ReactNode
}

export function RoleBased({
  children,
  requiredRole,
  permission,
  minRole,
  fallback = null,
  showLoading = false,
  loadingComponent = null
}: RoleBasedProps) {
  const { role, isLoading } = useUserRole()

  // Show loading state if requested
  if (isLoading) {
    if (showLoading && loadingComponent) {
      return <>{loadingComponent}</>
    }
    if (showLoading) {
      return <div className="animate-pulse bg-muted h-4 w-16 rounded" />
    }
    return null
  }

  // Check role-based access
  let hasAccess = true

  if (requiredRole) {
    hasAccess = Array.isArray(requiredRole) 
      ? requiredRole.includes(role)
      : role === requiredRole
  }

  if (permission && hasAccess) {
    hasAccess = hasPermission(role, permission as any)
  }

  if (minRole && hasAccess) {
    hasAccess = hasRoleLevel(role, minRole)
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

/**
 * Specific role-based wrapper components
 */
export function AdminOnly({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <RoleBased requiredRole="admin" fallback={fallback}>
      {children}
    </RoleBased>
  )
}

export function OwnerOnly({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <RoleBased requiredRole="owner" fallback={fallback}>
      {children}
    </RoleBased>
  )
}

export function OwnerOrAdmin({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <RoleBased requiredRole={['owner', 'admin']} fallback={fallback}>
      {children}
    </RoleBased>
  )
}

export function AuthenticatedOnly({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <RoleBased requiredRole={['owner', 'admin']} fallback={fallback}>
      {children}
    </RoleBased>
  )
}

/**
 * Permission-based wrapper components
 */
export function CanCreateListing({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <RoleBased permission="CREATE_LISTING" fallback={fallback}>
      {children}
    </RoleBased>
  )
}

export function CanModerate({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <RoleBased permission="MODERATE_CONTENT" fallback={fallback}>
      {children}
    </RoleBased>
  )
}

export function CanViewAnalytics({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <RoleBased permission="VIEW_ALL_ANALYTICS" fallback={fallback}>
      {children}
    </RoleBased>
  )
}

/**
 * Role-based navigation helpers
 */
export function useRoleBasedNavigation() {
  const { role, isLoading } = useUserRole()

  const getAvailableRoutes = () => {
    if (isLoading) return []

    const routes = [
      { path: '/directory', label: 'Directory', roles: ['visitor', 'owner', 'admin'] },
    ]

    if (role === 'owner' || role === 'admin') {
      routes.push(
        { path: '/dashboard/owner', label: 'My Business', roles: ['owner', 'admin'] },
        { path: '/dashboard/owner/listings', label: 'My Listings', roles: ['owner', 'admin'] },
        { path: '/dashboard/owner/create', label: 'Add Listing', roles: ['owner', 'admin'] }
      )
    }

    if (role === 'admin') {
      routes.push(
        { path: '/dashboard/admin', label: 'Admin Dashboard', roles: ['admin'] },
        { path: '/dashboard/admin/moderation', label: 'Moderation', roles: ['admin'] },
        { path: '/dashboard/admin/categories', label: 'Categories', roles: ['admin'] },
        { path: '/dashboard/admin/analytics', label: 'Analytics', roles: ['admin'] }
      )
    }

    return routes.filter(route => route.roles.includes(role))
  }

  const canAccessRoute = (routePath: string) => {
    if (isLoading) return false
    const routes = getAvailableRoutes()
    return routes.some(route => route.path === routePath)
  }

  return {
    role,
    isLoading,
    getAvailableRoutes,
    canAccessRoute
  }
}

/**
 * Role-based styling utilities
 */
export function useRoleBasedStyling() {
  const { role, isLoading } = useUserRole()

  const getRoleBadgeVariant = () => {
    switch (role) {
      case 'admin': return 'default'
      case 'owner': return 'secondary'
      case 'visitor': return 'outline'
      default: return 'outline'
    }
  }

  const getRoleColor = () => {
    switch (role) {
      case 'admin': return 'text-primary'
      case 'owner': return 'text-secondary'
      case 'visitor': return 'text-muted-foreground'
      default: return 'text-muted-foreground'
    }
  }

  const getRoleIcon = () => {
    switch (role) {
      case 'admin': return 'shield'
      case 'owner': return 'building'
      case 'visitor': return 'user'
      default: return 'user'
    }
  }

  return {
    role,
    isLoading,
    getRoleBadgeVariant,
    getRoleColor,
    getRoleIcon
  }
}

/**
 * Utility function for conditional class names based on role
 */
export function roleBasedClassName(
  role: UserRole | undefined,
  roleClasses: Partial<Record<UserRole, string>>,
  defaultClass = ''
): string {
  if (!role) return defaultClass
  return roleClasses[role] || defaultClass
}

/**
 * Utility function for conditional content based on role
 */
export function roleBasedContent<T>(
  role: UserRole | undefined,
  roleContent: Partial<Record<UserRole, T>>,
  defaultContent: T
): T {
  if (!role) return defaultContent
  return roleContent[role] || defaultContent
}
