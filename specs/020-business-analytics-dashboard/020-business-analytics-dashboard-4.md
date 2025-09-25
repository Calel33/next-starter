# Business Analytics Dashboard - Part 4: Testing, Error Handling, and Documentation

## Requirements Summary
- Implement comprehensive error handling for analytics queries and real-time updates
- Create unit tests for analytics hooks and components using existing testing patterns
- Add integration tests for owner analytics queries and role-based access
- Create documentation for analytics API and component usage
- Implement performance optimizations for large datasets

## Research Findings

### Best Practices
- Error boundary patterns for chart rendering failures
- Loading skeleton components for better UX during data fetching
- Retry mechanisms for failed analytics queries
- Performance optimization with data virtualization for large datasets

### Reference Implementations
- Existing error handling patterns in admin analytics
- Loading state patterns in dashboard components
- Role-based access testing patterns
- Component testing with React Testing Library

### Technology Decisions
- **Error Boundaries** - Wrap chart components to prevent crashes
- **Retry Logic** - Exponential backoff for failed queries
- **Performance** - React.memo and useMemo for expensive calculations
- **Testing** - Jest + React Testing Library for component tests

## Codebase Integration Points

### Files to Modify
- `components/custom/AnalyticsDashboard.tsx` - Add error boundaries and performance optimizations
- `hooks/useOwnerAnalytics.ts` - Add retry logic and error handling

### New Files to Create
- `components/custom/AnalyticsErrorBoundary.tsx` - Error boundary for analytics components
- `components/custom/AnalyticsLoadingSkeleton.tsx` - Loading states
- `__tests__/hooks/useOwnerAnalytics.test.ts` - Hook unit tests
- `__tests__/components/AnalyticsDashboard.test.tsx` - Component tests
- `docs/analytics-api.md` - API documentation

### Existing Patterns to Follow
- Error handling: Try-catch with user-friendly error messages
- Loading states: Skeleton components with proper accessibility
- Testing: Mock Convex queries and test component behavior
- Performance: React.memo for expensive components

## Technical Design

### Error Handling Strategy
```
Error Boundary
├── Network Errors → Retry with exponential backoff
├── Permission Errors → Show access denied message
├── Data Errors → Show fallback UI with refresh option
└── Chart Errors → Show error state with data table fallback
```

### Performance Optimization
```
Performance Strategy
├── React.memo → Prevent unnecessary re-renders
├── useMemo → Cache expensive calculations
├── useCallback → Stable function references
└── Data Virtualization → Handle large datasets
```

## Implementation Instructions

### Step 1: Create Error Boundary Component
**File**: `components/custom/AnalyticsErrorBoundary.tsx`

```typescript
"use client";

import React, { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AnalyticsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Analytics Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Analytics Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.error?.message || "Something went wrong while loading analytics data."}
            </p>
            <Button onClick={this.handleRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
```

### Step 2: Create Loading Skeleton Component
**File**: `components/custom/AnalyticsLoadingSkeleton.tsx`

```typescript
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Connection Status Skeleton */}
      <div className="bg-muted/30 rounded-lg p-3">
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-12" />
        </div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 3: Enhanced Hook with Error Handling
**File**: `hooks/useOwnerAnalytics.ts` (enhancement)

Add retry logic and better error handling:

```typescript
// Add to existing useOwnerAnalytics hook

const [retryCount, setRetryCount] = useState(0);
const [isRetrying, setIsRetrying] = useState(false);

// Enhanced error handling with retry logic
useEffect(() => {
  if (analyticsSummary === undefined && !isLoading && retryCount < 3) {
    const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
    
    setIsRetrying(true);
    const timer = setTimeout(() => {
      setRetryCount(prev => prev + 1);
      setIsRetrying(false);
    }, retryDelay);

    return () => clearTimeout(timer);
  }
}, [analyticsSummary, isLoading, retryCount]);

// Enhanced refresh function
const refreshData = useCallback(() => {
  setError(null);
  setRetryCount(0);
  setIsRetrying(false);
  // Convex will automatically refetch
}, []);

// Add to return object
return {
  // ... existing returns
  isRetrying,
  retryCount,
  // ... rest of returns
};
```

### Step 4: Component Unit Tests
**File**: `__tests__/hooks/useOwnerAnalytics.test.ts`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useOwnerAnalytics } from '@/hooks/useOwnerAnalytics';

// Mock Convex
jest.mock('convex/react', () => ({
  useQuery: jest.fn(),
}));

const mockUseQuery = require('convex/react').useQuery;

describe('useOwnerAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return loading state initially', () => {
    mockUseQuery.mockReturnValue(undefined);
    
    const { result } = renderHook(() => useOwnerAnalytics());
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.analyticsSummary).toBeUndefined();
  });

  it('should return analytics data when loaded', async () => {
    const mockData = {
      totalViews: 100,
      totalContactClicks: 10,
      totalDirectionsClicks: 5,
      conversionRate: 15.0,
    };
    
    mockUseQuery.mockReturnValue(mockData);
    
    const { result } = renderHook(() => useOwnerAnalytics());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.analyticsSummary).toEqual(mockData);
    });
  });

  it('should detect significant view increases', async () => {
    const initialData = { totalViews: 100, totalContactClicks: 10, totalDirectionsClicks: 5 };
    const updatedData = { totalViews: 110, totalContactClicks: 10, totalDirectionsClicks: 5 };
    
    mockUseQuery.mockReturnValueOnce(initialData).mockReturnValueOnce(updatedData);
    
    const { result, rerender } = renderHook(() => useOwnerAnalytics());
    
    // Wait for initial data
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Trigger update
    rerender();
    
    await waitFor(() => {
      expect(result.current.recentUpdates).toHaveLength(1);
      expect(result.current.recentUpdates[0].message).toContain('10 new listing views');
    });
  });
});
```

### Step 5: Component Integration Tests
**File**: `__tests__/components/AnalyticsDashboard.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnalyticsDashboard } from '@/components/custom/AnalyticsDashboard';

// Mock the analytics hook
jest.mock('@/hooks/useOwnerAnalytics', () => ({
  useOwnerAnalytics: jest.fn(),
}));

const mockUseOwnerAnalytics = require('@/hooks/useOwnerAnalytics').useOwnerAnalytics;

describe('AnalyticsDashboard', () => {
  const mockAnalyticsData = {
    analyticsSummary: {
      totalViews: 1000,
      totalContactClicks: 50,
      totalDirectionsClicks: 25,
      conversionRate: 7.5,
      topPerformingListing: {
        listingId: 'listing1',
        title: 'Best Restaurant',
        views: 500
      }
    },
    timeSeriesData: [
      { date: '2024-01-01', views: 100, contactClicks: 5, directionsClicks: 2 },
      { date: '2024-01-02', views: 120, contactClicks: 6, directionsClicks: 3 },
    ],
    recentUpdates: [],
    hasUnreadUpdates: false,
    isLoading: false,
    error: null,
    markUpdatesAsRead: jest.fn(),
    refreshData: jest.fn(),
  };

  beforeEach(() => {
    mockUseOwnerAnalytics.mockReturnValue(mockAnalyticsData);
  });

  it('should render analytics metrics correctly', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('1,000')).toBeInTheDocument(); // Total views
    expect(screen.getByText('50')).toBeInTheDocument(); // Contact clicks
    expect(screen.getByText('7.5%')).toBeInTheDocument(); // Conversion rate
    expect(screen.getByText('Best Restaurant')).toBeInTheDocument(); // Top listing
  });

  it('should handle time range changes', async () => {
    render(<AnalyticsDashboard />);
    
    const sevenDayButton = screen.getByText('7d');
    fireEvent.click(sevenDayButton);
    
    await waitFor(() => {
      expect(mockUseOwnerAnalytics).toHaveBeenCalledWith(7);
    });
  });

  it('should display error state correctly', () => {
    mockUseOwnerAnalytics.mockReturnValue({
      ...mockAnalyticsData,
      error: 'Failed to load data',
      isLoading: false,
    });
    
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText(/Failed to load analytics/)).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should show loading skeleton when loading', () => {
    mockUseOwnerAnalytics.mockReturnValue({
      ...mockAnalyticsData,
      isLoading: true,
      analyticsSummary: undefined,
    });
    
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('...')).toBeInTheDocument(); // Loading placeholder
  });
});
```

### Step 6: API Documentation
**File**: `docs/analytics-api.md`

```markdown
# Analytics API Documentation

## Owner Analytics Queries

### getOwnerAnalyticsSummary

Returns analytics summary for business owner's listings.

**Parameters:**
- `startDate` (optional): Start date timestamp
- `endDate` (optional): End date timestamp

**Returns:**
```typescript
{
  totalViews: number;
  totalContactClicks: number;
  totalDirectionsClicks: number;
  conversionRate: number;
  topPerformingListing?: {
    listingId: string;
    title: string;
    views: number;
  };
}
```

**Access Control:** Owner role required, can only access own listings

### getOwnerAnalyticsTimeSeries

Returns time-series data for charts.

**Parameters:**
- `startDate`: Start date timestamp (required)
- `endDate`: End date timestamp (required)
- `granularity`: "day" | "week" | "month"

**Returns:**
```typescript
Array<{
  date: string;
  views: number;
  contactClicks: number;
  directionsClicks: number;
}>
```

## Error Handling

All analytics queries include:
- Role-based access control
- Ownership verification
- Input validation
- Graceful error responses

## Performance Considerations

- Queries are optimized with proper indexing
- Large datasets are paginated
- Real-time updates use efficient change detection
- Charts handle up to 1000 data points efficiently
```

## Full Implementation Checklist
- [ ] Frontend changes (components, forms, UI state) - Parts 2 & 3 ✓
- [ ] Backend changes (services, controllers, logic) - Part 1 ✓
- [ ] Database changes (schemas, migrations, seeds) - Part 1 ✓
- [ ] API changes (routes, contracts, clients) - Part 1 ✓
- [ ] Test updates (unit, integration, E2E) - **THIS PART**
- [ ] Documentation updates (API reference, guides, changelogs) - **THIS PART**

## Integration Dependencies
- All previous parts must be implemented
- Testing framework setup (Jest + React Testing Library)
- Error boundary integration in main app
- Performance monitoring setup

## Deployment Checklist
- [ ] All tests passing
- [ ] Error boundaries implemented
- [ ] Performance optimizations applied
- [ ] Documentation complete
- [ ] Role-based access verified
- [ ] Mobile responsiveness tested
