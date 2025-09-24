"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  IconShield, 
  IconBuilding, 
  IconUser,
  IconEye,
  IconSettings,
  IconPlus
} from '@tabler/icons-react'
import {
  useRoleBasedRendering,
  AdminOnly,
  OwnerOnly,
  OwnerOrAdmin,
  AuthenticatedOnly,
  RoleBased,
  RoleBadge,
  CanCreateListing,
  CanModerate,
  CanViewAnalytics
} from '@/lib/role-utils'

/**
 * Demo component to showcase role-based rendering utilities
 * This can be used for testing and demonstration purposes
 */
export function RoleProtectionDemo() {
  const { 
    role, 
    isLoading, 
    renderForRole, 
    renderForPermission, 
    renderForMinRole,
    getClassForRole 
  } = useRoleBasedRendering()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse bg-muted h-6 w-48 rounded" />
          <div className="animate-pulse bg-muted h-4 w-64 rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-muted h-16 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Role Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Role Protection Demo
            <RoleBadge />
          </CardTitle>
          <CardDescription>
            Demonstrating role-based component rendering utilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current Role:</p>
              <div className={getClassForRole({
                admin: 'text-primary font-semibold',
                owner: 'text-secondary font-semibold',
                visitor: 'text-muted-foreground'
              })}>
                {role} ({role === 'admin' ? 'Full Access' : role === 'owner' ? 'Business Access' : 'Public Access'})
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-Specific Components */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AdminOnly fallback={
          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconShield className="h-5 w-5" />
                Admin Only
              </CardTitle>
              <CardDescription>Requires admin role</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This content is only visible to administrators.
              </p>
            </CardContent>
          </Card>
        }>
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <IconShield className="h-5 w-5" />
                Admin Panel
              </CardTitle>
              <CardDescription>Administrator features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button size="sm" className="w-full">
                  <IconSettings className="h-4 w-4 mr-2" />
                  Moderate Content
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  <IconEye className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </AdminOnly>

        <OwnerOnly fallback={
          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconBuilding className="h-5 w-5" />
                Owner Only
              </CardTitle>
              <CardDescription>Requires owner role</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This content is only visible to business owners.
              </p>
            </CardContent>
          </Card>
        }>
          <Card className="border-secondary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-secondary">
                <IconBuilding className="h-5 w-5" />
                Business Dashboard
              </CardTitle>
              <CardDescription>Owner-specific features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button size="sm" variant="secondary" className="w-full">
                  <IconPlus className="h-4 w-4 mr-2" />
                  Add Listing
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  <IconEye className="h-4 w-4 mr-2" />
                  My Listings
                </Button>
              </div>
            </CardContent>
          </Card>
        </OwnerOnly>

        <OwnerOrAdmin fallback={
          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUser className="h-5 w-5" />
                Authenticated Only
              </CardTitle>
              <CardDescription>Requires authentication</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This content requires authentication.
              </p>
            </CardContent>
          </Card>
        }>
          <Card className="border-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <IconUser className="h-5 w-5" />
                Authenticated Features
              </CardTitle>
              <CardDescription>Available to owners and admins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button size="sm" variant="outline" className="w-full">
                  Profile Settings
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </OwnerOrAdmin>
      </div>

      {/* Permission-Based Components */}
      <Card>
        <CardHeader>
          <CardTitle>Permission-Based Rendering</CardTitle>
          <CardDescription>
            Components that render based on specific permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <CanCreateListing fallback={
              <div className="p-4 border rounded-lg opacity-50">
                <p className="text-sm text-muted-foreground">
                  Create Listing permission required
                </p>
              </div>
            }>
              <div className="p-4 border border-secondary rounded-lg">
                <h4 className="font-semibold text-secondary mb-2">Create Listing</h4>
                <p className="text-sm text-muted-foreground">
                  You can create new business listings
                </p>
              </div>
            </CanCreateListing>

            <CanModerate fallback={
              <div className="p-4 border rounded-lg opacity-50">
                <p className="text-sm text-muted-foreground">
                  Moderation permission required
                </p>
              </div>
            }>
              <div className="p-4 border border-primary rounded-lg">
                <h4 className="font-semibold text-primary mb-2">Moderate Content</h4>
                <p className="text-sm text-muted-foreground">
                  You can moderate listings and content
                </p>
              </div>
            </CanModerate>

            <CanViewAnalytics fallback={
              <div className="p-4 border rounded-lg opacity-50">
                <p className="text-sm text-muted-foreground">
                  Analytics permission required
                </p>
              </div>
            }>
              <div className="p-4 border border-accent rounded-lg">
                <h4 className="font-semibold text-accent mb-2">View Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  You can access analytics data
                </p>
              </div>
            </CanViewAnalytics>
          </div>
        </CardContent>
      </Card>

      {/* Hook-Based Rendering Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Hook-Based Rendering</CardTitle>
          <CardDescription>
            Examples using the useRoleBasedRendering hook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {renderForRole('admin', (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <h4 className="font-semibold text-primary">Admin Hook Example</h4>
                <p className="text-sm text-muted-foreground">
                  This content is rendered using renderForRole('admin', content)
                </p>
              </div>
            ))}

            {renderForRole(['owner', 'admin'], (
              <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
                <h4 className="font-semibold text-secondary">Multi-Role Hook Example</h4>
                <p className="text-sm text-muted-foreground">
                  This content is rendered using renderForRole(['owner', 'admin'], content)
                </p>
              </div>
            ))}

            {renderForMinRole('owner', (
              <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <h4 className="font-semibold text-accent">Minimum Role Hook Example</h4>
                <p className="text-sm text-muted-foreground">
                  This content is rendered using renderForMinRole('owner', content)
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
