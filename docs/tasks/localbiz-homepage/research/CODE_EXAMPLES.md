# LocalBiz Homepage Code Examples

## Component Structure Examples

### 1. LocalBizHeader Component
```typescript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";

export function LocalBizHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border px-10 py-3 bg-background">
      <div className="flex items-center gap-8">
        {/* Logo Section */}
        <div className="flex items-center gap-4 text-foreground">
          <div className="size-4">
            {/* LocalBiz SVG Logo */}
          </div>
          <h2 className="text-foreground text-lg font-bold leading-tight tracking-tight">
            LocalBiz
          </h2>
        </div>
        
        {/* Navigation */}
        <nav className="flex items-center gap-9">
          <a className="text-foreground text-sm font-medium leading-normal hover:text-primary" href="#">
            Home
          </a>
          <a className="text-foreground text-sm font-medium leading-normal hover:text-primary" href="#">
            Categories
          </a>
          <a className="text-foreground text-sm font-medium leading-normal hover:text-primary" href="#">
            Deals
          </a>
          <a className="text-foreground text-sm font-medium leading-normal hover:text-primary" href="#">
            About
          </a>
        </nav>
      </div>
      
      <div className="flex flex-1 justify-end gap-8">
        {/* Search Input */}
        <div className="relative min-w-40 max-w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-10 bg-muted border-none"
          />
        </div>
        
        {/* List Business Button */}
        <Button variant="secondary" className="min-w-[84px]">
          List Your Business
        </Button>
        
        {/* User Avatar */}
        <Avatar className="size-10">
          <AvatarImage src="/placeholder-avatar.jpg" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
```

### 2. HeroSection Component
```typescript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function HeroSection() {
  return (
    <section className="px-40 flex flex-1 justify-center py-5">
      <div className="flex flex-col max-w-[960px] flex-1">
        <div className="@container">
          <div className="@[480px]:p-4">
            <div
              className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-4"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url('/hero-background.jpg')`
              }}
            >
              <div className="flex flex-col gap-2 text-center">
                <h1 className="text-white text-4xl font-black leading-tight tracking-tight @[480px]:text-5xl">
                  Explore Local Businesses Worldwide
                </h1>
                <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base">
                  Discover top-rated services and businesses in any location. Use the interactive globe to find businesses near you or anywhere in the world.
                </h2>
              </div>
              
              {/* Hero Search Bar */}
              <div className="flex w-full max-w-[480px] h-14 @[480px]:h-16">
                <div className="flex w-full items-stretch rounded-xl bg-card border border-border">
                  <div className="flex items-center justify-center pl-4">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    placeholder="Search for businesses or services"
                    className="flex-1 border-none bg-transparent rounded-l-none rounded-r-none text-sm @[480px]:text-base"
                  />
                  <div className="flex items-center justify-center pr-2">
                    <Button className="h-10 @[480px]:h-12">
                      Search
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### 3. BusinessCard Component
```typescript
import { Card, CardContent } from "@/components/ui/card";

interface BusinessCardProps {
  name: string;
  description: string;
  imageUrl: string;
}

export function BusinessCard({ name, description, imageUrl }: BusinessCardProps) {
  return (
    <Card className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60 bg-card shadow-sm">
      <div
        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <CardContent className="p-4">
        <p className="text-foreground text-base font-medium leading-normal">
          {name}
        </p>
        <p className="text-muted-foreground text-sm font-normal leading-normal">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
```

### 4. FeaturedBusinesses Component
```typescript
import { BusinessCard } from "./BusinessCard";

const featuredBusinesses = [
  {
    id: 1,
    name: "The Cozy Corner Cafe",
    description: "A charming cafe with a warm atmosphere.",
    imageUrl: "/business-1.jpg"
  },
  {
    id: 2,
    name: "AutoFix Mechanics", 
    description: "Expert auto repair services for all makes and models.",
    imageUrl: "/business-2.jpg"
  },
  // ... more businesses
];

export function FeaturedBusinesses() {
  return (
    <section>
      <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-tight px-4 pb-3 pt-5">
        Featured Businesses
      </h2>
      <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-stretch p-4 gap-3">
          {featuredBusinesses.map((business) => (
            <BusinessCard
              key={business.id}
              name={business.name}
              description={business.description}
              imageUrl={business.imageUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

### 5. PopularCategories Component
```typescript
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  { id: 1, name: "Restaurants", imageUrl: "/category-restaurants.jpg" },
  { id: 2, name: "Home Services", imageUrl: "/category-home.jpg" },
  { id: 3, name: "Beauty & Spas", imageUrl: "/category-beauty.jpg" },
  { id: 4, name: "Automotive", imageUrl: "/category-auto.jpg" },
  { id: 5, name: "Health & Medical", imageUrl: "/category-health.jpg" },
  { id: 6, name: "Professional Services", imageUrl: "/category-professional.jpg" },
];

export function PopularCategories() {
  return (
    <section>
      <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-tight px-4 pb-3 pt-5">
        Popular Categories
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
        {categories.map((category) => (
          <Card key={category.id} className="flex flex-col gap-3 pb-3 bg-card shadow-sm hover:shadow-md transition-shadow">
            <div
              className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
              style={{ backgroundImage: `url(${category.imageUrl})` }}
            />
            <CardContent className="p-0 px-3">
              <p className="text-foreground text-base font-medium leading-normal">
                {category.name}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
```

## Design System Usage Examples

### Color Token Usage
```typescript
// CORRECT: Using design system tokens
className="bg-primary text-primary-foreground"
className="bg-secondary text-secondary-foreground" 
className="bg-card text-card-foreground"
className="text-muted-foreground"
className="border-border"

// INCORRECT: Hard-coded colors
className="bg-[#4f46e5] text-white"
className="bg-[#cbdbeb] text-[#131416]"
```

### Typography Usage
```typescript
// Headers with design system
className="text-foreground text-lg font-bold leading-tight tracking-tight"
className="text-foreground text-[22px] font-bold leading-tight tracking-tight"

// Body text with design system  
className="text-foreground text-base font-medium leading-normal"
className="text-muted-foreground text-sm font-normal leading-normal"
```

### Spacing and Layout
```typescript
// Using design system spacing
className="px-4 py-3"  // Based on --spacing: 0.25rem
className="gap-3 gap-4 gap-6 gap-8"  // Consistent spacing scale
className="min-w-40 max-w-64"  // Consistent sizing

// Using design system radius
className="rounded-xl"  // Based on --radius system
className="rounded-lg rounded-md"  // Radius variants
```

## Integration Patterns

### Convex Query Integration
```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function FeaturedBusinesses() {
  const businesses = useQuery(api.businesses.getFeatured);
  
  if (!businesses) {
    return <div>Loading...</div>;
  }
  
  return (
    <section>
      {/* Component implementation */}
    </section>
  );
}
```

### Responsive Design Pattern
```typescript
// Mobile-first responsive design
className="text-4xl @[480px]:text-5xl"  // Container queries
className="h-14 @[480px]:h-16"  // Responsive sizing
className="px-4 md:px-10"  // Breakpoint-based spacing
```
