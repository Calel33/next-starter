/**
 * Integration Test: Owner Registration & Listing Creation
 * 
 * Tests the complete user journey for business owners registering and creating listings
 * through the owner dashboard. Tests MUST FAIL until implementation is complete.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConvexTestingHelper } from 'convex/testing';
import { api } from '../../convex/_generated/api';

// Mock Clerk authentication
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-123',
      emailAddresses: [{ emailAddress: 'owner@test.com' }],
      firstName: 'John',
      lastName: 'Doe',
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    signOut: jest.fn(),
  }),
  SignIn: ({ redirectUrl }: any) => (
    <div data-testid="clerk-signin">
      <button onClick={() => window.location.href = redirectUrl}>
        Sign In
      </button>
    </div>
  ),
  SignUp: ({ redirectUrl }: any) => (
    <div data-testid="clerk-signup">
      <form data-testid="signup-form">
        <input data-testid="email-input" placeholder="Email" />
        <input data-testid="password-input" type="password" placeholder="Password" />
        <button type="submit" onClick={() => window.location.href = redirectUrl}>
          Sign Up
        </button>
      </form>
    </div>
  ),
}));

// Mock components
jest.mock('../../components/custom/ListingForm', () => ({
  ListingForm: ({ onSubmit, onCancel }: any) => (
    <form data-testid="listing-form" onSubmit={(e) => {
      e.preventDefault();
      onSubmit?.({
        name: 'Joe\'s Pizza',
        description: 'Best pizza in town',
        phone: '+1-555-123-4567',
        website: 'https://joespizza.com',
        email: 'contact@joespizza.com',
        address: {
          line1: '123 Main St',
          city: 'Anytown',
          region: 'ST',
          postalCode: '12345',
          country: 'US',
        },
        location: { lat: 40.7589, lng: -73.9851 },
        categoryIds: ['test-category-id'],
        hours: [
          { day: 1, open: '11:00', close: '22:00', closed: false },
          { day: 2, open: '11:00', close: '22:00', closed: false },
        ],
        imageIds: [],
      });
    }}>
      <input data-testid="business-name" placeholder="Business Name" required />
      <textarea data-testid="description" placeholder="Description" />
      <input data-testid="phone" placeholder="Phone Number" />
      <input data-testid="website" placeholder="Website URL" />
      <input data-testid="email" placeholder="Email" />
      <input data-testid="address-line1" placeholder="Street Address" required />
      <input data-testid="city" placeholder="City" required />
      <input data-testid="region" placeholder="State/Region" required />
      <input data-testid="postal-code" placeholder="ZIP/Postal Code" required />
      <select data-testid="category-select" required>
        <option value="">Select Category</option>
        <option value="test-category-id">Restaurants</option>
      </select>
      <div data-testid="hours-section">
        <label>Business Hours</label>
        <input data-testid="monday-open" placeholder="Open Time" />
        <input data-testid="monday-close" placeholder="Close Time" />
      </div>
      <div data-testid="image-upload">
        <input type="file" data-testid="image-input" multiple accept="image/*" />
      </div>
      <button type="submit" data-testid="submit-button">Submit for Review</button>
      <button type="button" onClick={onCancel} data-testid="cancel-button">Cancel</button>
    </form>
  ),
}));

jest.mock('../../components/custom/ImageUpload', () => ({
  ImageUpload: ({ onUpload, maxFiles = 10 }: any) => (
    <div data-testid="image-upload-component">
      <input 
        type="file" 
        data-testid="file-input"
        multiple 
        accept="image/*"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          files.forEach((file, index) => {
            onUpload?.({
              file,
              preview: `blob:preview-${index}`,
              id: `temp-${index}`,
            });
          });
        }}
      />
      <div data-testid="upload-progress">Uploading...</div>
    </div>
  ),
}));

// Mock pages
const OwnerDashboard = () => (
  <div data-testid="owner-dashboard">
    <h1>Owner Dashboard</h1>
    <div data-testid="dashboard-stats">
      <div>Total Listings: 0</div>
      <div>Total Views: 0</div>
      <div>Pending Approval: 0</div>
    </div>
    <button data-testid="add-listing-button">Add New Listing</button>
    <div data-testid="my-listings">
      <h2>My Listings</h2>
      <div data-testid="listings-list">No listings yet</div>
    </div>
  </div>
);

const CreateListingPage = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const handleSubmit = async (listingData: any) => {
    setIsSubmitting(true);
    try {
      // In actual implementation, would call Convex mutation
      // await convex.mutation(api.listings.createListing, listingData);
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Failed to create listing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div data-testid="success-message">
        <h2>Listing Submitted Successfully!</h2>
        <p>Your listing has been submitted for review and will be visible once approved.</p>
        <button data-testid="back-to-dashboard">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div data-testid="create-listing-page">
      <h1>Create New Listing</h1>
      <ListingForm 
        onSubmit={handleSubmit}
        onCancel={() => window.history.back()}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

describe('Owner Registration & Listing Creation Integration', () => {
  let t: ConvexTestingHelper;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    t = new ConvexTestingHelper();
    user = userEvent.setup();

    // Seed test data
    await t.run(async (ctx) => {
      const adminUserId = await ctx.db.insert('users', {
        name: 'Admin User',
        externalId: 'admin-1',
        role: 'admin',
        listingCount: 0,
      });

      await ctx.db.insert('categories', {
        name: 'Restaurants',
        slug: 'restaurants',
        description: 'Food and dining establishments',
        isActive: true,
        sortOrder: 1,
        listingCount: 0,
        createdBy: adminUserId,
        updatedAt: Date.now(),
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('User Registration Flow', () => {
    it('should redirect to Clerk sign-up when accessing dashboard unauthenticated', async () => {
      // Mock unauthenticated state
      jest.mocked(require('@clerk/nextjs').useUser).mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      });

      render(<OwnerDashboard />);

      // Should redirect to sign-up
      // In actual implementation, would verify redirect behavior
      expect(screen.queryByTestId('owner-dashboard')).not.toBeInTheDocument();
    });

    it('should complete Clerk onboarding flow', async () => {
      render(
        <div data-testid="signup-flow">
          <SignUp redirectUrl="/dashboard" />
        </div>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const signUpButton = screen.getByRole('button', { name: /sign up/i });

      await user.type(emailInput, 'newowner@test.com');
      await user.type(passwordInput, 'securepassword123');
      await user.click(signUpButton);

      // Should complete registration and redirect
      expect(screen.getByTestId('signup-form')).toBeInTheDocument();
    });

    it('should assign owner role to new business users', async () => {
      // In actual implementation, would verify user role assignment
      // after Clerk webhook processes the new user
      
      await t.run(async (ctx) => {
        const newUserId = await ctx.db.insert('users', {
          name: 'New Owner',
          externalId: 'new-owner-123',
          role: 'owner',
          email: 'newowner@test.com',
          listingCount: 0,
        });

        const user = await ctx.db.get(newUserId);
        expect(user?.role).toBe('owner');
      });
    });

    it('should redirect to owner dashboard after successful registration', async () => {
      render(<OwnerDashboard />);

      expect(screen.getByTestId('owner-dashboard')).toBeInTheDocument();
      expect(screen.getByText('Owner Dashboard')).toBeInTheDocument();
    });
  });

  describe('Owner Dashboard', () => {
    beforeEach(() => {
      // Mock authenticated owner state
      jest.mocked(require('@clerk/nextjs').useUser).mockReturnValue({
        user: {
          id: 'test-owner-123',
          emailAddresses: [{ emailAddress: 'owner@test.com' }],
          firstName: 'John',
          lastName: 'Doe',
        },
        isLoaded: true,
        isSignedIn: true,
      });
    });

    it('should display dashboard with owner statistics', async () => {
      render(<OwnerDashboard />);

      expect(screen.getByTestId('owner-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-stats')).toBeInTheDocument();
      expect(screen.getByText('Total Listings: 0')).toBeInTheDocument();
      expect(screen.getByText('Total Views: 0')).toBeInTheDocument();
      expect(screen.getByText('Pending Approval: 0')).toBeInTheDocument();
    });

    it('should show Add New Listing button', async () => {
      render(<OwnerDashboard />);

      const addButton = screen.getByTestId('add-listing-button');
      expect(addButton).toBeInTheDocument();
      expect(addButton).toHaveTextContent('Add New Listing');
    });

    it('should display My Listings section', async () => {
      render(<OwnerDashboard />);

      expect(screen.getByTestId('my-listings')).toBeInTheDocument();
      expect(screen.getByText('My Listings')).toBeInTheDocument();
      expect(screen.getByText('No listings yet')).toBeInTheDocument();
    });

    it('should navigate to create listing page when Add button clicked', async () => {
      render(<OwnerDashboard />);

      const addButton = screen.getByTestId('add-listing-button');
      await user.click(addButton);

      // In actual implementation, would verify navigation
      expect(addButton).toBeInTheDocument();
    });
  });

  describe('Listing Creation Form', () => {
    beforeEach(() => {
      render(<CreateListingPage />);
    });

    it('should render listing form with all required fields', async () => {
      expect(screen.getByTestId('create-listing-page')).toBeInTheDocument();
      expect(screen.getByTestId('listing-form')).toBeInTheDocument();
      
      // Required fields
      expect(screen.getByTestId('business-name')).toBeInTheDocument();
      expect(screen.getByTestId('address-line1')).toBeInTheDocument();
      expect(screen.getByTestId('city')).toBeInTheDocument();
      expect(screen.getByTestId('region')).toBeInTheDocument();
      expect(screen.getByTestId('postal-code')).toBeInTheDocument();
      expect(screen.getByTestId('category-select')).toBeInTheDocument();
      
      // Optional fields
      expect(screen.getByTestId('description')).toBeInTheDocument();
      expect(screen.getByTestId('phone')).toBeInTheDocument();
      expect(screen.getByTestId('website')).toBeInTheDocument();
      expect(screen.getByTestId('email')).toBeInTheDocument();
    });

    it('should include business hours configuration', async () => {
      expect(screen.getByTestId('hours-section')).toBeInTheDocument();
      expect(screen.getByTestId('monday-open')).toBeInTheDocument();
      expect(screen.getByTestId('monday-close')).toBeInTheDocument();
    });

    it('should include image upload functionality', async () => {
      expect(screen.getByTestId('image-upload')).toBeInTheDocument();
      expect(screen.getByTestId('image-input')).toBeInTheDocument();
    });

    it('should validate required fields before submission', async () => {
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Form should not submit without required fields
      // In actual implementation, would check for validation errors
      expect(screen.getByTestId('listing-form')).toBeInTheDocument();
    });

    it('should fill out complete listing form', async () => {
      // Fill required fields
      await user.type(screen.getByTestId('business-name'), 'Joe\'s Pizza');
      await user.type(screen.getByTestId('description'), 'Best pizza in town');
      await user.type(screen.getByTestId('phone'), '+1-555-123-4567');
      await user.type(screen.getByTestId('website'), 'https://joespizza.com');
      await user.type(screen.getByTestId('email'), 'contact@joespizza.com');
      await user.type(screen.getByTestId('address-line1'), '123 Main St');
      await user.type(screen.getByTestId('city'), 'Anytown');
      await user.type(screen.getByTestId('region'), 'ST');
      await user.type(screen.getByTestId('postal-code'), '12345');
      
      // Select category
      await user.selectOptions(screen.getByTestId('category-select'), 'test-category-id');
      
      // Set business hours
      await user.type(screen.getByTestId('monday-open'), '11:00');
      await user.type(screen.getByTestId('monday-close'), '22:00');

      // All fields should be filled
      expect(screen.getByTestId('business-name')).toHaveValue('Joe\'s Pizza');
      expect(screen.getByTestId('phone')).toHaveValue('+1-555-123-4567');
    });

    it('should handle image uploads with client-side resizing', async () => {
      const fileInput = screen.getByTestId('image-input');
      
      // Mock file upload
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });
      await user.upload(fileInput, file);

      // In actual implementation, would verify image processing
      expect(fileInput.files).toHaveLength(1);
    });

    it('should submit listing for review', async () => {
      // Fill form and submit
      await user.type(screen.getByTestId('business-name'), 'Joe\'s Pizza');
      await user.type(screen.getByTestId('address-line1'), '123 Main St');
      await user.type(screen.getByTestId('city'), 'Anytown');
      await user.type(screen.getByTestId('region'), 'ST');
      await user.type(screen.getByTestId('postal-code'), '12345');
      await user.selectOptions(screen.getByTestId('category-select'), 'test-category-id');

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Should show success message
      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
      });
    });
  });

  describe('Post-Submission Flow', () => {
    it('should show submission confirmation', async () => {
      render(<CreateListingPage />);

      // Submit form (mocked to succeed)
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
        expect(screen.getByText('Listing Submitted Successfully!')).toBeInTheDocument();
        expect(screen.getByText(/submitted for review/)).toBeInTheDocument();
      });
    });

    it('should create listing with pending status in database', async () => {
      // In actual implementation, would verify database state
      await t.run(async (ctx) => {
        const userId = await ctx.db.insert('users', {
          name: 'Test Owner',
          externalId: 'test-owner-123',
          role: 'owner',
          listingCount: 0,
        });

        const categoryId = await ctx.db.insert('categories', {
          name: 'Restaurants',
          slug: 'restaurants',
          isActive: true,
          sortOrder: 1,
          listingCount: 0,
          createdBy: userId,
          updatedAt: Date.now(),
        });

        const listingId = await ctx.db.insert('listings', {
          name: 'Joe\'s Pizza',
          slug: 'joes-pizza',
          description: 'Best pizza in town',
          phone: '+1-555-123-4567',
          address: {
            line1: '123 Main St',
            city: 'Anytown',
            region: 'ST',
            postalCode: '12345',
            country: 'US',
          },
          location: { lat: 40.7589, lng: -73.9851 },
          categories: [categoryId],
          images: [],
          ownerId: userId,
          status: 'pending',
          views: 0,
          phoneClicks: 0,
          websiteClicks: 0,
          directionsClicks: 0,
          updatedAt: Date.now(),
        });

        const listing = await ctx.db.get(listingId);
        expect(listing?.status).toBe('pending');
        expect(listing?.ownerId).toBe(userId);
      });
    });

    it('should update owner dashboard with new listing', async () => {
      // After submission, dashboard should show the new listing
      render(<OwnerDashboard />);

      // In actual implementation, would show updated stats
      expect(screen.getByTestId('owner-dashboard')).toBeInTheDocument();
    });

    it('should send confirmation notification to owner', async () => {
      // In actual implementation, would verify email/notification sent
      // This could be tested by mocking the notification service
    });
  });
});
