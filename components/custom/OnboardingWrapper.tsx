'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUserRole, needsOnboarding, getDefaultRedirectUrl } from '@/lib/auth-utils'
import { UserOnboarding } from './UserOnboarding'
import { Loader2 } from 'lucide-react'

interface OnboardingWrapperProps {
  children: React.ReactNode
  requiresAuth?: boolean
  allowedRoles?: Array<'visitor' | 'owner' | 'admin'>
}

/**
 * OnboardingWrapper component that:
 * 1. Checks if user needs onboarding
 * 2. Shows onboarding flow if needed
 * 3. Redirects to appropriate dashboard after onboarding
 * 4. Handles role-based access control
 */
export function OnboardingWrapper({ 
  children, 
  requiresAuth = true,
  allowedRoles = ['visitor', 'owner', 'admin']
}: OnboardingWrapperProps) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const { role, isLoading: roleLoading } = useUserRole()
  const convexUser = useQuery(api.users.current)
  
  const isLoading = !clerkLoaded || roleLoading || (clerkUser && convexUser === undefined)
  
  // Check if user needs onboarding
  const needsOnboardingFlow = convexUser && needsOnboarding(role, convexUser)
  
  // Check if user has access to this route
  const hasAccess = allowedRoles.includes(role)
  
  useEffect(() => {
    // Redirect unauthenticated users if auth is required
    if (clerkLoaded && !clerkUser && requiresAuth) {
      window.location.href = '/sign-in'
      return
    }
    
    // Redirect users without proper role access
    if (!isLoading && clerkUser && !hasAccess) {
      const redirectUrl = getDefaultRedirectUrl(role)
      window.location.href = redirectUrl
      return
    }
  }, [clerkLoaded, clerkUser, requiresAuth, isLoading, hasAccess, role])
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    )
  }
  
  // Redirect if no auth and auth required
  if (requiresAuth && !clerkUser) {
    return null // Will redirect via useEffect
  }
  
  // Redirect if no access
  if (clerkUser && !hasAccess) {
    return null // Will redirect via useEffect
  }
  
  // Show onboarding if needed
  if (needsOnboardingFlow) {
    return <UserOnboarding />
  }
  
  // Show main content
  return <>{children}</>
}

/**
 * Higher-order component for protecting routes with onboarding
 */
export function withOnboarding<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requiresAuth?: boolean
    allowedRoles?: Array<'visitor' | 'owner' | 'admin'>
  } = {}
) {
  return function OnboardingProtectedComponent(props: P) {
    return (
      <OnboardingWrapper {...options}>
        <Component {...props} />
      </OnboardingWrapper>
    )
  }
}

/**
 * Hook to check onboarding status
 */
export function useOnboardingStatus() {
  const { user: clerkUser, isLoaded } = useUser()
  const { role, isLoading: roleLoading } = useUserRole()
  const convexUser = useQuery(api.users.current)
  
  const isLoading = !isLoaded || roleLoading || (clerkUser && convexUser === undefined)
  const needsOnboardingFlow = convexUser && needsOnboarding(role, convexUser)
  
  return {
    isLoading,
    needsOnboarding: needsOnboardingFlow,
    role,
    user: convexUser,
    isAuthenticated: !!clerkUser,
  }
}
