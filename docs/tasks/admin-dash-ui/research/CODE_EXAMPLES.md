# Admin Dashboard UI Integration — Code Examples

## Component Skeletons

### `components/custom/admin/AdminSidebar.tsx`
```tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Home,
  ListChecks,
  Star,
  LineChart,
  Settings,
  LucideIcon,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard/admin", label: "Dashboard", icon: Home },
  { href: "/dashboard/admin/listings", label: "Listings", icon: ListChecks },
  { href: "/dashboard/admin/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/admin/analytics", label: "Analytics", icon: LineChart },
  { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
] satisfies Array<{ href: string; label: string; icon: LucideIcon }>;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="flex flex-col gap-2">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
              "justify-start gap-2"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span className="text-sm font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

### `components/custom/admin/AdminMetricCard.tsx`
```tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminMetricCardProps {
  title: string;
  value: React.ReactNode;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}

export function AdminMetricCard({
  title,
  value,
  description,
  icon: Icon,
  className,
}: AdminMetricCardProps) {
  return (
    <Card className={cn("@container/card", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="text-2xl font-semibold tracking-tight @[250px]/card:text-3xl">
            {value}
          </div>
        </div>
        {Icon ? (
          <div className="rounded-lg bg-muted p-2 text-muted-foreground">
            <Icon className="h-4 w-4" aria-hidden />
          </div>
        ) : null}
      </CardHeader>
      {description ? (
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}
```

### `components/custom/admin/AdminAnalyticsPanel.tsx`
```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AdminAnalyticsPanelProps {
  title: string;
  headline: string;
  trendLabel: string;
  trendValue: string;
  timeframeLabel: string;
  footer?: React.ReactNode;
  chart?: React.ReactNode;
}

export function AdminAnalyticsPanel({
  title,
  headline,
  trendLabel,
  trendValue,
  timeframeLabel,
  chart,
  footer,
}: AdminAnalyticsPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-1">
        <Badge variant="outline" className="w-fit">
          {timeframeLabel}
        </Badge>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-3xl font-bold tracking-tight text-foreground">{headline}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{trendLabel}</span>
            <span className="font-medium text-success">{trendValue}</span>
          </div>
        </div>
        {chart ? <div className="min-h-[160px]">{chart}</div> : null}
        {footer ? <div className="text-xs text-muted-foreground">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}
```

### Layout Integration Snippet (`app/dashboard/admin/page.tsx`)
```tsx
return (
  <AdminProtection>
    <div className="grid min-h-screen gap-6 px-4 py-6 lg:grid-cols-[280px_1fr]">
      <aside className="hidden rounded-xl border bg-card p-4 shadow-sm lg:flex lg:flex-col">
        <AdminSidebar />
      </aside>
      <main className="space-y-6">
        <AdminDashboardHeader analytics={analyticsSummary} />
        <section className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          <AdminMetricCard ... />
          {/* additional metric cards */}
        </section>
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <AdminAnalyticsPanel ... />
          <AdminRevenuePanel ... />
        </section>
      </main>
    </div>
  </AdminProtection>
);
```

## Utility Patterns

### Icon/Token Mapping
```tsx
const statusColor = variant === "positive" ? "text-success" : "text-muted-foreground";

return <span className={cn("text-sm font-medium", statusColor)}>{label}</span>;
```

### Responsive Sidebar Toggle
```tsx
<Sheet>
  <SheetTrigger className="lg:hidden" aria-label="Toggle sidebar">
    <Button variant="ghost" size="icon">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="w-72 p-0">
    <div className="h-full overflow-y-auto p-4">
      <AdminSidebar />
    </div>
  </SheetContent>
</Sheet>
```

## Testing Example

```tsx
import { render, screen } from "@testing-library/react";
import AdminDashboardPage from "@/app/dashboard/admin/page";

it("shows moderation metrics", () => {
  render(<AdminDashboardPage />);
  expect(screen.getByText(/Pending Moderation/)).toBeInTheDocument();
});
```
