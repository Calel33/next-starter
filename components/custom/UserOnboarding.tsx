'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUserRole, needsOnboarding, getOnboardingSteps } from '@/lib/auth-utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, MapPin, Building, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'

interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
}

export function UserOnboarding() {
  const { user: clerkUser } = useUser()
  const { role, isLoading } = useUserRole()
  const convexUser = useQuery(api.users.current)
  const completeOnboarding = useMutation(api.users.completeOnboarding)
  
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    phone: '',
    address: '',
    lat: 0,
    lng: 0,
  })
  
  // Check if user needs onboarding
  const needsOnboardingFlow = convexUser && needsOnboarding(role, convexUser)
  
  // Get onboarding steps for current role
  const onboardingSteps = getOnboardingSteps(role)
  
  // Convert steps to detailed step objects
  const steps: OnboardingStep[] = onboardingSteps.map((step, index) => ({
    id: `step-${index}`,
    title: step,
    description: getStepDescription(step, role),
    completed: false,
  }))
  
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 100
  
  useEffect(() => {
    // Pre-fill form with existing user data
    if (convexUser) {
      setFormData(prev => ({
        ...prev,
        businessName: convexUser.businessName || '',
        phone: convexUser.phone || '',
        address: convexUser.defaultLocation?.address || '',
        lat: convexUser.defaultLocation?.lat || 0,
        lng: convexUser.defaultLocation?.lng || 0,
      }))
    }
  }, [convexUser])
  
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }
  
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }
  
  const handleCompleteOnboarding = async () => {
    try {
      const result = await completeOnboarding({
        businessName: formData.businessName || undefined,
        businessType: formData.businessType || undefined,
        phone: formData.phone || undefined,
        location: formData.address ? {
          lat: formData.lat,
          lng: formData.lng,
          address: formData.address,
        } : undefined,
      })
      
      if (result.success) {
        toast.success('Onboarding completed successfully!')
        // Redirect based on role
        window.location.href = role === 'admin' ? '/dashboard/admin' : '/dashboard/owner'
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to complete onboarding')
      console.error('Onboarding error:', error)
    }
  }
  
  // Don't show onboarding if not needed or still loading
  if (isLoading || !needsOnboardingFlow || !convexUser) {
    return null
  }
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Business Directory</CardTitle>
          <CardDescription>
            Let's set up your {role} account to get you started
          </CardDescription>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="secondary">{role}</Badge>
            <Progress value={progress} className="w-32" />
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {steps.length}
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Current Step Content */}
          {role === 'owner' && (
            <OwnerOnboardingStep
              step={currentStep}
              formData={formData}
              onInputChange={handleInputChange}
            />
          )}
          
          {role === 'admin' && (
            <AdminOnboardingStep
              step={currentStep}
              formData={formData}
              onInputChange={handleInputChange}
            />
          )}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNextStep}>
                Next
              </Button>
            ) : (
              <Button onClick={handleCompleteOnboarding}>
                Complete Setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to get step descriptions
function getStepDescription(step: string, role: string): string {
  const descriptions: Record<string, string> = {
    'Complete business information': 'Tell us about your business',
    'Verify email address': 'Confirm your email for notifications',
    'Set up business location': 'Add your business address',
    'Create first listing': 'Add your business to the directory',
    'Complete profile information': 'Fill out your admin profile',
    'Verify admin privileges': 'Confirm your administrator access',
    'Review moderation guidelines': 'Learn about content moderation',
  }
  
  return descriptions[step] || step
}

// Owner-specific onboarding steps
function OwnerOnboardingStep({
  step,
  formData,
  onInputChange,
}: {
  step: number
  formData: any
  onInputChange: (field: string, value: string) => void
}) {
  switch (step) {
    case 0: // Business Information
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Building className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Business Information</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => onInputChange('businessName', e.target.value)}
              placeholder="Enter your business name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Input
              id="businessType"
              value={formData.businessType}
              onChange={(e) => onInputChange('businessType', e.target.value)}
              placeholder="e.g., Restaurant, Retail, Service"
            />
          </div>
        </div>
      )
      
    case 1: // Contact Information
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Contact Information</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
              type="tel"
            />
          </div>
        </div>
      )
      
    case 2: // Location
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Business Location</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Business Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => onInputChange('address', e.target.value)}
              placeholder="Enter your full business address"
              rows={3}
            />
          </div>
        </div>
      )
      
    default:
      return <div>Setup complete!</div>
  }
}

// Admin-specific onboarding steps
function AdminOnboardingStep({
  step,
  formData,
  onInputChange,
}: {
  step: number
  formData: any
  onInputChange: (field: string, value: string) => void
}) {
  switch (step) {
    case 0: // Profile Information
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Admin Profile</h3>
          </div>
          
          <p className="text-muted-foreground">
            Your admin account has been set up. You can now access the admin dashboard
            to manage listings, categories, and moderate content.
          </p>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Admin Responsibilities:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Review and approve business listings</li>
              <li>Manage business categories</li>
              <li>Moderate user-generated content</li>
              <li>Monitor platform analytics</li>
            </ul>
          </div>
        </div>
      )
      
    default:
      return <div>Admin setup complete!</div>
  }
}
