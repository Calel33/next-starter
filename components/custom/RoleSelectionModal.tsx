'use client'

import { useState } from 'react'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Building, User, ArrowRight } from 'lucide-react'
import { BusinessOwnerSignupButton, VisitorSignupButton } from './SignupContextProvider'

// Simplified dropdown-based role selection for header
export function HeaderRoleSelection({ children }: { children: React.ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">Join LocalBiz</p>
          <p className="text-xs text-muted-foreground">Choose your account type</p>
        </div>
        <DropdownMenuSeparator />

        <BusinessOwnerSignupButton>
          <DropdownMenuItem className="cursor-pointer">
            <div className="flex items-center gap-3 w-full">
              <div className="p-1.5 rounded bg-primary/10">
                <Building className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Business Owner</div>
                <div className="text-xs text-muted-foreground">List and manage your business</div>
              </div>
            </div>
          </DropdownMenuItem>
        </BusinessOwnerSignupButton>

        <VisitorSignupButton>
          <DropdownMenuItem className="cursor-pointer">
            <div className="flex items-center gap-3 w-full">
              <div className="p-1.5 rounded bg-secondary/10">
                <User className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Customer</div>
                <div className="text-xs text-muted-foreground">Discover and review businesses</div>
              </div>
            </div>
          </DropdownMenuItem>
        </VisitorSignupButton>

        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Already have an account? Sign In
            </Button>
          </SignInButton>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


