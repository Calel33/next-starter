"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MapPin, 
  Grid, 
  Map, 
  Filter,
  ChevronDown,
  Home,
  Building2,
  Star,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface DirectoryNavProps {
  className?: string;
  showSearch?: boolean;
  showCategories?: boolean;
  showViewToggle?: boolean;
  currentView?: 'list' | 'map' | 'split';
  onViewChange?: (view: 'list' | 'map' | 'split') => void;
}

/**
 * DirectoryNav component
 * Navigation specifically designed for the business directory section
 */
export function DirectoryNav({
  className,
  showSearch = true,
  showCategories = true,
  showViewToggle = false,
  currentView = 'split',
  onViewChange,
}: DirectoryNavProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch categories for navigation
  const categories = useQuery(api.categories.getCategories);

  // Get popular/featured categories (first 8)
  const popularCategories = categories?.slice(0, 8) || [];
  
  // Get remaining categories for "More" dropdown
  const moreCategories = categories?.slice(8) || [];

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/directory/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  // Check if current path is active
  const isActivePath = (path: string) => {
    if (path === '/directory' && pathname === '/directory') return true;
    if (path !== '/directory' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className={cn("border-b bg-card", className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Main Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link 
              href="/directory"
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                isActivePath('/directory') ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Home className="h-4 w-4" />
              Directory Home
            </Link>

            {/* Categories Navigation */}
            {showCategories && categories && categories.length > 0 && (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-medium">
                      <Building2 className="h-4 w-4 mr-2" />
                      Categories
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid w-[600px] gap-3 p-4 md:grid-cols-2">
                        {/* Popular Categories */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium leading-none">Popular Categories</h4>
                          <div className="grid gap-2">
                            {popularCategories.map((category) => (
                              <NavigationMenuLink key={category._id} asChild>
                                <Link
                                  href={`/directory/category/${category.slug}`}
                                  className={cn(
                                    "flex items-center gap-3 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                                    pathname.includes(`/category/${category.slug}`) && "bg-accent text-accent-foreground"
                                  )}
                                >
                                  <span className="text-lg">{category.icon || '📍'}</span>
                                  <div className="flex-1">
                                    <div className="font-medium">{category.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {category.listingCount || 0} listings
                                    </div>
                                  </div>
                                  {category.trending && (
                                    <Badge variant="secondary" className="text-xs">
                                      <TrendingUp className="h-3 w-3 mr-1" />
                                      Hot
                                    </Badge>
                                  )}
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>

                        {/* More Categories or Featured */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium leading-none">
                            {moreCategories.length > 0 ? 'More Categories' : 'Quick Links'}
                          </h4>
                          <div className="grid gap-2">
                            {moreCategories.length > 0 ? (
                              moreCategories.slice(0, 6).map((category) => (
                                <NavigationMenuLink key={category._id} asChild>
                                  <Link
                                    href={`/directory/category/${category.slug}`}
                                    className={cn(
                                      "flex items-center gap-3 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                                      pathname.includes(`/category/${category.slug}`) && "bg-accent text-accent-foreground"
                                    )}
                                  >
                                    <span className="text-lg">{category.icon || '📍'}</span>
                                    <div className="flex-1">
                                      <div className="font-medium">{category.name}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {category.listingCount || 0} listings
                                      </div>
                                    </div>
                                  </Link>
                                </NavigationMenuLink>
                              ))
                            ) : (
                              <>
                                <NavigationMenuLink asChild>
                                  <Link
                                    href="/directory/search"
                                    className="flex items-center gap-3 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                  >
                                    <Search className="h-4 w-4" />
                                    <span>Advanced Search</span>
                                  </Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild>
                                  <Link
                                    href="/directory?view=map"
                                    className="flex items-center gap-3 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                  >
                                    <Map className="h-4 w-4" />
                                    <span>Map View</span>
                                  </Link>
                                </NavigationMenuLink>
                              </>
                            )}
                          </div>
                          
                          {moreCategories.length > 6 && (
                            <NavigationMenuLink asChild>
                              <Link
                                href="/directory/categories"
                                className="flex items-center justify-center gap-2 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors border border-dashed"
                              >
                                <Grid className="h-4 w-4" />
                                View All Categories
                              </Link>
                            </NavigationMenuLink>
                          )}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            )}

            {/* Quick Links */}
            <Link 
              href="/directory/search"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActivePath('/directory/search') ? "text-primary" : "text-muted-foreground"
              )}
            >
              Search
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Quick Search */}
            {showSearch && (
              <form onSubmit={handleSearch} className="hidden md:flex">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Quick search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-9"
                  />
                </div>
              </form>
            )}

            {/* View Toggle */}
            {showViewToggle && onViewChange && (
              <div className="flex items-center gap-1 rounded-md border p-1">
                <Button
                  variant={currentView === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewChange('list')}
                  className="h-7 px-2"
                >
                  <Grid className="h-3 w-3" />
                </Button>
                <Button
                  variant={currentView === 'split' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewChange('split')}
                  className="h-7 px-2"
                >
                  <div className="flex gap-0.5">
                    <div className="w-1 h-3 bg-current" />
                    <div className="w-1 h-3 bg-current" />
                  </div>
                </Button>
                <Button
                  variant={currentView === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewChange('map')}
                  className="h-7 px-2"
                >
                  <Map className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Menu
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/directory">
                    <Home className="h-4 w-4 mr-2" />
                    Directory Home
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/directory/search">
                    <Search className="h-4 w-4 mr-2" />
                    Advanced Search
                  </Link>
                </DropdownMenuItem>
                {popularCategories.slice(0, 5).map((category) => (
                  <DropdownMenuItem key={category._id} asChild>
                    <Link href={`/directory/category/${category.slug}`}>
                      <span className="mr-2">{category.icon || '📍'}</span>
                      {category.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                {moreCategories.length > 0 && (
                  <DropdownMenuItem asChild>
                    <Link href="/directory/categories">
                      <Grid className="h-4 w-4 mr-2" />
                      All Categories
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search */}
        {showSearch && (
          <div className="pb-4 md:hidden">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9"
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
}
