"use client"

import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  IconShield, 
  IconAlertTriangle, 
  IconBuilding, 
  IconLogin,
  IconArrowLeft 
} from '@tabler/icons-react'
import { UserRole } from '@/lib/auth-utils'

interface RoleProtectionProps {
  children: ReactNode
  requiredRole: UserRole | UserRole[]
  fallbackUrl?: string
  showFallback?: boolean
  loadingComponent?: ReactNode
  unauthorizedComponent?: ReactNode
}

/**
 * Role-based protection wrapper component
 * Protects content based on user roles and provides appropriate fallbacks
 */
export function RoleProtection({
  children,
  requiredRole,
  fallbackUrl,
  showFallback = true,
  loadingComponent,
  unauthorizedComponent
}: RoleProtectionProps) {
  const { user, isLoaded } = useUser()
  const convexUser = useQuery(api.users.current)
  const router = useRouter()

  // Get role from Clerk metadata first, fallback to Convex user data
  const clerkRole = user?.publicMetadata?.role as UserRole
  const convexRole = convexUser?.role as UserRole
  const userRole: UserRole = clerkRole || convexRole || 'visitor'

  // Check if user has required role
  const hasRequiredRole = () => {
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole)
    }
    return userRole === requiredRole
  }

  // Handle redirects for unauthorized access
  useEffect(() => {
    if (isLoaded && user && convexUser !== undefined && !hasRequiredRole() && fallbackUrl) {
      router.push(fallbackUrl)
    }
  }, [isLoaded, user, convexUser, userRole, fallbackUrl, router])

  // Loading state
  if (!isLoaded || (user && convexUser === undefined)) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }
    return <RoleProtectionSkeleton />
  }

  // Not authenticated
  if (!user) {
    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>
    }
    if (!showFallback) {
      return null
    }
    return <NotAuthenticatedFallback />
  }

  // Authenticated but insufficient role
  if (!hasRequiredRole()) {
    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>
    }
    if (!showFallback) {
      return null
    }
    return <InsufficientRoleFallback userRole={userRole} requiredRole={requiredRole} />
  }

  // User has required role, render children
  return <>{children}</>
}

/**
 * Owner-specific protection wrapper
 */
export function OwnerProtection({ children, ...props }: Omit<RoleProtectionProps, 'requiredRole'>) {
  return (
    <RoleProtection 
      requiredRole={['owner', 'admin']} 
      fallbackUrl="/dashboard"
      {...props}
    >
      {children}
    </RoleProtection>
  )
}

/**
 * Admin-specific protection wrapper
 */
export function AdminProtection({ children, ...props }: Omit<RoleProtectionProps, 'requiredRole'>) {
  return (
    <RoleProtection 
      requiredRole="admin" 
      fallbackUrl="/dashboard"
      {...props}
    >
      {children}
    </RoleProtection>
  )
}

/**
 * Loading skeleton for role protection
 */
function RoleProtectionSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

/**
 * Fallback component for non-authenticated users
 */
function NotAuthenticatedFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <IconLogin className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
      <p className="text-muted-foreground mb-4">
        Please sign in to access this page.
      </p>
      <Button asChild>
        <a href="/sign-in">Sign In</a>
      </Button>
    </div>
  )
}

/**
 * Fallback component for insufficient role
 */
function InsufficientRoleFallback({ 
  userRole, 
  requiredRole 
}: { 
  userRole: UserRole
  requiredRole: UserRole | UserRole[] 
}) {
  const requiredRoleText = Array.isArray(requiredRole) 
    ? requiredRole.join(' or ') 
    : requiredRole

  const getIcon = () => {
    if (userRole === 'visitor') return IconLogin
    if (userRole === 'owner') return IconBuilding
    return IconShield
  }

  const Icon = getIcon()

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <IconAlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
      <p className="text-muted-foreground mb-4">
        This page requires {requiredRoleText} access. Your current role is {userRole}.
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => window.history.back()}>
          <IconArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
        <Button asChild>
          <a href="/dashboard">
            <Icon className="h-4 w-4 mr-2" />
            Dashboard
          </a>
        </Button>
      </div>
    </div>
  )
}
