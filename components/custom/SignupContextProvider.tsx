'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useUser, SignUpButton } from '@clerk/nextjs'

interface SignupContext {
  signupContext: 'visitor' | 'business-owner' | 'claim-listing' | null
  setSignupContext: (context: 'visitor' | 'business-owner' | 'claim-listing' | null) => void
  businessInfo?: {
    businessName?: string
    businessType?: string
    claimingListingId?: string
  }
  setBusinessInfo: (info: any) => void
}

const SignupContextContext = createContext<SignupContext | undefined>(undefined)

export function SignupContextProvider({ children }: { children: React.ReactNode }) {
  const [signupContext, setSignupContext] = useState<'visitor' | 'business-owner' | 'claim-listing' | null>(null)
  const [businessInfo, setBusinessInfo] = useState<any>({})
  const { user } = useUser()

  // Update Clerk user metadata when signup context changes
  useEffect(() => {
    if (user && signupContext) {
      user.update({
        publicMetadata: {
          ...user.publicMetadata,
          signupContext,
          businessOwner: signupContext === 'business-owner' || signupContext === 'claim-listing',
          ...businessInfo,
        }
      }).catch(console.error)
    }
  }, [user, signupContext, businessInfo])

  return (
    <SignupContextContext.Provider value={{
      signupContext,
      setSignupContext,
      businessInfo,
      setBusinessInfo,
    }}>
      {children}
    </SignupContextContext.Provider>
  )
}

export function useSignupContext() {
  const context = useContext(SignupContextContext)
  if (context === undefined) {
    throw new Error('useSignupContext must be used within a SignupContextProvider')
  }
  return context
}

// Helper components for different signup flows
export function BusinessOwnerSignupButton({ children, businessName, businessType }: {
  children: React.ReactNode
  businessName?: string
  businessType?: string
}) {
  const { setSignupContext, setBusinessInfo } = useSignupContext()

  const handleClick = () => {
    setSignupContext('business-owner')
    setBusinessInfo({ businessName, businessType })
    // The SignUpButton will be triggered by the child component
  }

  return (
    <SignUpButton mode="modal">
      <div onClick={handleClick}>
        {children}
      </div>
    </SignUpButton>
  )
}

export function ClaimListingSignupButton({ children, listingId }: {
  children: React.ReactNode
  listingId: string
}) {
  const { setSignupContext, setBusinessInfo } = useSignupContext()

  const handleClick = () => {
    setSignupContext('claim-listing')
    setBusinessInfo({ claimingListingId: listingId })
    // The SignUpButton will be triggered by the child component
  }

  return (
    <SignUpButton mode="modal">
      <div onClick={handleClick}>
        {children}
      </div>
    </SignUpButton>
  )
}

export function VisitorSignupButton({ children }: { children: React.ReactNode }) {
  const { setSignupContext } = useSignupContext()

  const handleClick = () => {
    setSignupContext('visitor')
    // The SignUpButton will be triggered by the child component
  }

  return (
    <SignUpButton mode="modal">
      <div onClick={handleClick}>
        {children}
      </div>
    </SignUpButton>
  )
}
