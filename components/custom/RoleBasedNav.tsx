"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  IconBuilding, 
  IconShield, 
  IconUser, 
  IconDirectory,
  IconPlus,
  IconEye,
  IconSettings,
  IconCategory,
  IconChartBar
} from '@tabler/icons-react'
import { 
  useRoleBasedNavigation, 
  useRoleBasedStyling,
  AdminOnly,
  OwnerOrAdmin,
  RoleBased
} from '@/lib/role-utils'
import { cn } from '@/lib/utils'

/**
 * Role-based navigation component that shows different navigation items
 * based on the user's role and permissions
 */
export function RoleBasedNav({ className }: { className?: string }) {
  const { getAvailableRoutes, canAccessRoute, role, isLoading } = useRoleBasedNavigation()
  const { getRoleColor, getRoleIcon } = useRoleBasedStyling()
  const pathname = usePathname()

  if (isLoading) {
    return (
      <nav className={cn("space-y-2", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-muted h-10 rounded" />
        ))}
      </nav>
    )
  }

  const routes = getAvailableRoutes()

  const getRouteIcon = (path: string) => {
    if (path.includes('/directory')) return IconDirectory
    if (path.includes('/admin')) return IconShield
    if (path.includes('/owner')) return IconBuilding
    if (path.includes('/create')) return IconPlus
    if (path.includes('/listings')) return IconEye
    if (path.includes('/moderation')) return IconSettings
    if (path.includes('/categories')) return IconCategory
    if (path.includes('/analytics')) return IconChartBar
    return IconUser
  }

  return (
    <nav className={cn("space-y-2", className)}>
      {routes.map((route) => {
        const Icon = getRouteIcon(route.path)
        const isActive = pathname === route.path
        
        return (
          <Button
            key={route.path}
            asChild
            variant={isActive ? "default" : "ghost"}
            className="w-full justify-start"
          >
            <Link href={route.path}>
              <Icon className="h-4 w-4 mr-2" />
              {route.label}
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}

/**
 * Role badge component that displays the user's current role
 */
export function RoleBadge({ showIcon = true }: { showIcon?: boolean }) {
  const { getRoleBadgeVariant, getRoleColor, getRoleIcon, role, isLoading } = useRoleBasedStyling()

  if (isLoading) {
    return <div className="animate-pulse bg-muted h-6 w-16 rounded" />
  }

  const getIcon = () => {
    const iconName = getRoleIcon()
    switch (iconName) {
      case 'shield': return IconShield
      case 'building': return IconBuilding
      case 'user': return IconUser
      default: return IconUser
    }
  }

  const Icon = getIcon()
  const roleDisplayNames = {
    admin: 'Administrator',
    owner: 'Business Owner',
    visitor: 'Visitor'
  }

  return (
    <Badge variant={getRoleBadgeVariant()} className={cn("gap-1", getRoleColor())}>
      {showIcon && <Icon className="h-3 w-3" />}
      {roleDisplayNames[role as keyof typeof roleDisplayNames] || 'Unknown'}
    </Badge>
  )
}

/**
 * Conditional action buttons based on user role
 */
export function RoleBasedActions() {
  return (
    <div className="flex gap-2">
      <OwnerOrAdmin>
        <Button asChild>
          <Link href="/dashboard/owner/create">
            <IconPlus className="h-4 w-4 mr-2" />
            Add Listing
          </Link>
        </Button>
      </OwnerOrAdmin>
      
      <AdminOnly>
        <Button variant="outline" asChild>
          <Link href="/dashboard/admin/moderation">
            <IconSettings className="h-4 w-4 mr-2" />
            Moderate
          </Link>
        </Button>
      </AdminOnly>
    </div>
  )
}

/**
 * Role-based dashboard links
 */
export function RoleBasedDashboardLinks() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <OwnerOrAdmin>
        <Link href="/dashboard/owner" className="block">
          <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <IconBuilding className="h-8 w-8 text-secondary" />
              <div>
                <h3 className="font-semibold">My Business</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your listings and view performance
                </p>
              </div>
            </div>
          </div>
        </Link>
      </OwnerOrAdmin>

      <AdminOnly>
        <Link href="/dashboard/admin" className="block">
          <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <IconShield className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Admin Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor and moderate the platform
                </p>
              </div>
            </div>
          </div>
        </Link>
      </AdminOnly>

      <AdminOnly>
        <Link href="/dashboard/admin/analytics" className="block">
          <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <IconChartBar className="h-8 w-8 text-accent" />
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  View platform statistics and insights
                </p>
              </div>
            </div>
          </div>
        </Link>
      </AdminOnly>
    </div>
  )
}

/**
 * Role-based feature announcements or notifications
 */
export function RoleBasedNotifications() {
  return (
    <div className="space-y-4">
      <RoleBased requiredRole="owner">
        <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
          <h4 className="font-semibold text-secondary mb-2">Business Owner Features</h4>
          <p className="text-sm text-muted-foreground">
            Create and manage your business listings, track performance, and engage with customers.
          </p>
        </div>
      </RoleBased>

      <RoleBased requiredRole="admin">
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <h4 className="font-semibold text-primary mb-2">Administrator Tools</h4>
          <p className="text-sm text-muted-foreground">
            Moderate content, manage categories, and view comprehensive analytics.
          </p>
        </div>
      </RoleBased>

      <RoleBased requiredRole="visitor">
        <div className="p-4 bg-muted border rounded-lg">
          <h4 className="font-semibold mb-2">Welcome to the Directory</h4>
          <p className="text-sm text-muted-foreground">
            Discover local businesses and services in your area. Sign up to save favorites and get personalized recommendations.
          </p>
        </div>
      </RoleBased>
    </div>
  )
}

/**
 * Example of complex role-based conditional rendering
 */
export function RoleBasedComplexExample() {
  return (
    <div className="space-y-4">
      <RoleBased 
        minRole="owner"
        fallback={
          <div className="text-center p-8 border rounded-lg">
            <IconUser className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Business Features</h3>
            <p className="text-muted-foreground mb-4">
              Sign up as a business owner to access listing management features.
            </p>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        }
      >
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-4">Business Management</h3>
          <div className="grid gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/owner/listings">View My Listings</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/owner/create">Create New Listing</Link>
            </Button>
            <AdminOnly>
              <Button variant="outline" asChild>
                <Link href="/dashboard/admin">Admin Panel</Link>
              </Button>
            </AdminOnly>
          </div>
        </div>
      </RoleBased>
    </div>
  )
}
