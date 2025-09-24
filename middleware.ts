import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define route matchers for different protection levels
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])
const isOwnerRoute = createRouteMatcher(['/dashboard/owner(.*)'])
const isAdminRoute = createRouteMatcher(['/dashboard/admin(.*)'])
const isPublicDirectoryRoute = createRouteMatcher(['/directory(.*)'])

// Enhanced role-based route protection
export default clerkMiddleware(async (auth, req) => {
  // Protect all dashboard routes
  if (isProtectedRoute(req)) {
    try {
      await auth.protect()
    } catch (error) {
      // Redirect to sign-in if not authenticated
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }

    // Get user session to check roles
    const { sessionClaims, userId } = await auth()
    const userRole = sessionClaims?.metadata?.role as string | undefined

    // Enhanced role-based route protection with detailed logging
    if (isAdminRoute(req)) {
      // Admin routes require admin role
      if (userRole !== 'admin') {
        console.warn(`Access denied to admin route ${req.nextUrl.pathname} for user ${userId} with role ${userRole}`)

        // Redirect based on user role
        if (userRole === 'owner') {
          return NextResponse.redirect(new URL('/dashboard/owner', req.url))
        } else {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }
    } else if (isOwnerRoute(req)) {
      // Owner routes require owner or admin role
      if (userRole !== 'owner' && userRole !== 'admin') {
        console.warn(`Access denied to owner route ${req.nextUrl.pathname} for user ${userId} with role ${userRole}`)

        // Redirect to appropriate dashboard based on role
        if (userRole === 'admin') {
          return NextResponse.redirect(new URL('/dashboard/admin', req.url))
        } else {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }
    }

    // Add role information to response headers for client-side access
    const response = NextResponse.next()
    response.headers.set('x-user-role', userRole || 'visitor')
    response.headers.set('x-user-id', userId || '')
    return response
  }

  // Public directory routes are accessible to everyone
  // No additional protection needed for /directory routes
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}