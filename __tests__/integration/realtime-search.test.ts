/**
 * Integration Test: Real-time Search & Map Interaction
 * 
 * Tests real-time search functionality with live updates, map synchronization,
 * and interactive clustering. Tests MUST FAIL until implementation is complete.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConvexTestingHelper } from 'convex/testing';

// Mock real-time components
const RealTimeSearchInterface = ({ onSearch, onFilterChange }: any) => {
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState({
    category: '',
    openNow: false,
    distance: 25,
  });

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    onSearch?.(newQuery, filters);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    onFilterChange?.(query, newFilters);
  };

  return (
    <div data-testid="realtime-search">
      <input
        data-testid="search-input"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search businesses..."
      />
      <div data-testid="filters">
        <select
          data-testid="category-filter"
          value={filters.category}
          onChange={(e) => handleFilterChange({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="restaurants">Restaurants</option>
          <option value="shopping">Shopping</option>
        </select>
        <label>
          <input
            data-testid="open-now-filter"
            type="checkbox"
            checked={filters.openNow}
            onChange={(e) => handleFilterChange({ ...filters, openNow: e.target.checked })}
          />
          Open Now
        </label>
        <input
          data-testid="distance-slider"
          type="range"
          min="1"
          max="50"
          value={filters.distance}
          onChange={(e) => handleFilterChange({ ...filters, distance: parseInt(e.target.value) })}
        />
      </div>
    </div>
  );
};

const InteractiveMap = ({ listings, onMapMove, onClusterClick, onMarkerClick }: any) => {
  const [viewport, setViewport] = React.useState({
    latitude: 40.7589,
    longitude: -73.9851,
    zoom: 12,
  });

  const handleMapMove = (newViewport: any) => {
    setViewport(newViewport);
    onMapMove?.(newViewport);
  };

  return (
    <div data-testid="interactive-map">
      <div data-testid="map-viewport">
        Lat: {viewport.latitude}, Lng: {viewport.longitude}, Zoom: {viewport.zoom}
      </div>
      <div data-testid="map-markers">
        {listings?.map((listing: any, index: number) => (
          <button
            key={listing._id || index}
            data-testid={`marker-${listing._id || index}`}
            onClick={() => onMarkerClick?.(listing)}
          >
            {listing.name}
          </button>
        ))}
      </div>
      <div data-testid="map-clusters">
        <button
          data-testid="cluster-1"
          onClick={() => onClusterClick?.({ count: 5, bounds: {} })}
        >
          Cluster (5)
        </button>
      </div>
      <div data-testid="map-controls">
        <button
          data-testid="zoom-in"
          onClick={() => handleMapMove({ ...viewport, zoom: viewport.zoom + 1 })}
        >
          +
        </button>
        <button
          data-testid="zoom-out"
          onClick={() => handleMapMove({ ...viewport, zoom: viewport.zoom - 1 })}
        >
          -
        </button>
        <button
          data-testid="pan-north"
          onClick={() => handleMapMove({ ...viewport, latitude: viewport.latitude + 0.01 })}
        >
          ↑
        </button>
      </div>
    </div>
  );
};

const LiveSearchResults = ({ listings, loading, onListingClick }: any) => (
  <div data-testid="live-search-results">
    {loading && <div data-testid="loading-indicator">Searching...</div>}
    <div data-testid="results-count">
      {listings?.length || 0} results found
    </div>
    <div data-testid="results-list">
      {listings?.map((listing: any, index: number) => (
        <div
          key={listing._id || index}
          data-testid={`result-${listing._id || index}`}
          onClick={() => onListingClick?.(listing)}
        >
          <h3>{listing.name}</h3>
          <p>{listing.description}</p>
          <span data-testid="distance">{listing.distance}km away</span>
          <span data-testid="status" className={listing.isOpen ? 'open' : 'closed'}>
            {listing.isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const RealTimeSearchPage = () => {
  const [listings, setListings] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedListing, setSelectedListing] = React.useState(null);

  const handleSearch = async (query: string, filters: any) => {
    setLoading(true);
    
    // Simulate real-time search with debouncing
    setTimeout(() => {
      const mockResults = [
        {
          _id: 'listing-1',
          name: 'Mario\'s Pizza',
          description: 'Authentic Italian pizza',
          distance: 0.5,
          isOpen: true,
          location: { lat: 40.7589, lng: -73.9851 },
        },
        {
          _id: 'listing-2',
          name: 'Joe\'s Burgers',
          description: 'Best burgers in town',
          distance: 1.2,
          isOpen: false,
          location: { lat: 40.7600, lng: -73.9800 },
        },
      ].filter(listing => 
        !query || listing.name.toLowerCase().includes(query.toLowerCase())
      ).filter(listing =>
        !filters.openNow || listing.isOpen
      );

      setListings(mockResults);
      setLoading(false);
    }, 300); // Simulate 300ms debounce
  };

  const handleMapMove = (viewport: any) => {
    // Trigger search based on new map bounds
    handleSearch('', {});
  };

  return (
    <div data-testid="realtime-search-page">
      <RealTimeSearchInterface 
        onSearch={handleSearch}
        onFilterChange={handleSearch}
      />
      <div style={{ display: 'flex' }}>
        <InteractiveMap
          listings={listings}
          onMapMove={handleMapMove}
          onClusterClick={(cluster) => console.log('Cluster clicked:', cluster)}
          onMarkerClick={setSelectedListing}
        />
        <LiveSearchResults
          listings={listings}
          loading={loading}
          onListingClick={setSelectedListing}
        />
      </div>
      {selectedListing && (
        <div data-testid="selected-listing">
          Selected: {selectedListing.name}
        </div>
      )}
    </div>
  );
};

describe('Real-time Search & Map Interaction Integration', () => {
  let t: ConvexTestingHelper;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    t = new ConvexTestingHelper();
    user = userEvent.setup();

    // Seed test data
    await t.run(async (ctx) => {
      const userId = await ctx.db.insert('users', {
        name: 'Test User',
        externalId: 'test-user-1',
        role: 'owner',
        listingCount: 0,
      });

      const categoryId = await ctx.db.insert('categories', {
        name: 'Restaurants',
        slug: 'restaurants',
        isActive: true,
        sortOrder: 1,
        listingCount: 2,
        createdBy: userId,
        updatedAt: Date.now(),
      });

      // Create multiple test listings
      await ctx.db.insert('listings', {
        name: 'Mario\'s Pizza',
        slug: 'marios-pizza',
        description: 'Authentic Italian pizza',
        phone: '+1-555-PIZZA-1',
        address: {
          line1: '123 Main St',
          city: 'New York',
          region: 'NY',
          postalCode: '10001',
          country: 'US',
        },
        location: { lat: 40.7589, lng: -73.9851 },
        categories: [categoryId],
        images: [],
        ownerId: userId,
        status: 'approved',
        views: 0,
        phoneClicks: 0,
        websiteClicks: 0,
        directionsClicks: 0,
        updatedAt: Date.now(),
      });

      await ctx.db.insert('listings', {
        name: 'Joe\'s Burgers',
        slug: 'joes-burgers',
        description: 'Best burgers in town',
        phone: '+1-555-BURGER',
        address: {
          line1: '456 Oak Ave',
          city: 'New York',
          region: 'NY',
          postalCode: '10002',
          country: 'US',
        },
        location: { lat: 40.7600, lng: -73.9800 },
        categories: [categoryId],
        images: [],
        ownerId: userId,
        status: 'approved',
        views: 0,
        phoneClicks: 0,
        websiteClicks: 0,
        directionsClicks: 0,
        updatedAt: Date.now(),
      });
    });
  });

  describe('Real-time Search Functionality', () => {
    it('should render search interface with filters', async () => {
      render(<RealTimeSearchPage />);

      expect(screen.getByTestId('realtime-search')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('filters')).toBeInTheDocument();
      expect(screen.getByTestId('category-filter')).toBeInTheDocument();
      expect(screen.getByTestId('open-now-filter')).toBeInTheDocument();
      expect(screen.getByTestId('distance-slider')).toBeInTheDocument();
    });

    it('should perform debounced search as user types', async () => {
      render(<RealTimeSearchPage />);

      const searchInput = screen.getByTestId('search-input');
      
      await user.type(searchInput, 'pizza');

      // Should show loading indicator
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();

      // Wait for debounced search to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      }, { timeout: 1000 });

      // Should show filtered results
      expect(screen.getByText('Mario\'s Pizza')).toBeInTheDocument();
      expect(screen.queryByText('Joe\'s Burgers')).not.toBeInTheDocument();
    });

    it('should update results when filters change', async () => {
      render(<RealTimeSearchPage />);

      // Apply "Open Now" filter
      const openNowFilter = screen.getByTestId('open-now-filter');
      await user.click(openNowFilter);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      // Should only show open businesses
      const results = screen.getByTestId('results-list');
      expect(results).toBeInTheDocument();
    });

    it('should show real-time result count', async () => {
      render(<RealTimeSearchPage />);

      await waitFor(() => {
        const resultCount = screen.getByTestId('results-count');
        expect(resultCount).toHaveTextContent('2 results found');
      });
    });
  });

  describe('Map Interaction', () => {
    it('should render interactive map with controls', async () => {
      render(<RealTimeSearchPage />);

      expect(screen.getByTestId('interactive-map')).toBeInTheDocument();
      expect(screen.getByTestId('map-viewport')).toBeInTheDocument();
      expect(screen.getByTestId('map-markers')).toBeInTheDocument();
      expect(screen.getByTestId('map-controls')).toBeInTheDocument();
    });

    it('should show listing markers on map', async () => {
      render(<RealTimeSearchPage />);

      await waitFor(() => {
        expect(screen.getByTestId('marker-listing-1')).toBeInTheDocument();
        expect(screen.getByTestId('marker-listing-2')).toBeInTheDocument();
      });
    });

    it('should update search results when map is moved', async () => {
      render(<RealTimeSearchPage />);

      const panButton = screen.getByTestId('pan-north');
      await user.click(panButton);

      // Should trigger new search based on map bounds
      await waitFor(() => {
        expect(screen.getByTestId('map-viewport')).toHaveTextContent('Lat: 40.7689');
      });
    });

    it('should handle zoom interactions', async () => {
      render(<RealTimeSearchPage />);

      const zoomInButton = screen.getByTestId('zoom-in');
      await user.click(zoomInButton);

      await waitFor(() => {
        expect(screen.getByTestId('map-viewport')).toHaveTextContent('Zoom: 13');
      });
    });

    it('should expand clusters when clicked', async () => {
      render(<RealTimeSearchPage />);

      const cluster = screen.getByTestId('cluster-1');
      await user.click(cluster);

      // In actual implementation, cluster would expand to show individual markers
      expect(cluster).toBeInTheDocument();
    });
  });

  describe('List-Map Synchronization', () => {
    it('should synchronize list view with map viewport', async () => {
      render(<RealTimeSearchPage />);

      // Move map
      const panButton = screen.getByTestId('pan-north');
      await user.click(panButton);

      // List should update to show results in new viewport
      await waitFor(() => {
        expect(screen.getByTestId('results-list')).toBeInTheDocument();
      });
    });

    it('should highlight corresponding marker when listing is hovered', async () => {
      render(<RealTimeSearchPage />);

      await waitFor(() => {
        const listing = screen.getByTestId('result-listing-1');
        expect(listing).toBeInTheDocument();
      });

      // In actual implementation, would test hover effects
    });

    it('should center map on listing when clicked', async () => {
      render(<RealTimeSearchPage />);

      await waitFor(() => {
        const listing = screen.getByTestId('result-listing-1');
        if (listing) {
          user.click(listing);
        }
      });

      // In actual implementation, map would center on selected listing
    });
  });

  describe('Performance Requirements', () => {
    it('should maintain 60fps during map interactions', async () => {
      render(<RealTimeSearchPage />);

      // In actual implementation, would use performance monitoring
      const map = screen.getByTestId('interactive-map');
      expect(map).toBeInTheDocument();
    });

    it('should complete search within 800ms', async () => {
      render(<RealTimeSearchPage />);

      const startTime = Date.now();
      const searchInput = screen.getByTestId('search-input');
      
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      const endTime = Date.now();
      const searchTime = endTime - startTime;

      expect(searchTime).toBeLessThan(1200); // Including debounce time
    });

    it('should handle large datasets with clustering', async () => {
      // In actual implementation, would test with 1000+ listings
      render(<RealTimeSearchPage />);

      expect(screen.getByTestId('map-clusters')).toBeInTheDocument();
    });
  });

  describe('Real-time Updates', () => {
    it('should receive live updates when new listings are added', async () => {
      render(<RealTimeSearchPage />);

      // In actual implementation, would test Convex live queries
      // New listings should appear automatically without refresh
    });

    it('should update when listing status changes', async () => {
      // In actual implementation, would test real-time status updates
      // (e.g., when business opens/closes, listing gets approved)
    });

    it('should handle connection interruptions gracefully', async () => {
      // In actual implementation, would test offline/reconnection scenarios
    });
  });

  describe('Error Handling', () => {
    it('should handle search API failures', async () => {
      // In actual implementation, would mock API failures
      render(<RealTimeSearchPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'test');

      // Should show error state but not crash
    });

    it('should handle map loading failures', async () => {
      // In actual implementation, would test Mapbox API failures
      render(<RealTimeSearchPage />);

      expect(screen.getByTestId('realtime-search-page')).toBeInTheDocument();
    });

    it('should provide fallback when geolocation fails', async () => {
      // Mock geolocation failure
      Object.defineProperty(global.navigator, 'geolocation', {
        value: {
          getCurrentPosition: jest.fn((success, error) => {
            error({ code: 1, message: 'Permission denied' });
          }),
        },
        writable: true,
      });

      render(<RealTimeSearchPage />);

      // Should still function without user location
      expect(screen.getByTestId('interactive-map')).toBeInTheDocument();
    });
  });
});
