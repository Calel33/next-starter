"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconMessageCircle,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconSparkles,
  IconBrandOpenai,
  IconBuilding,
  IconPlus,
  IconEdit,
  IconShield,
  IconAnalyze,
  IconCategory,
  IconMap,
} from "@tabler/icons-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

import { NavDocuments } from "@/app/dashboard/nav-documents"
import { NavMain } from "@/app/dashboard/nav-main"
import { NavSecondary } from "@/app/dashboard/nav-secondary"
import { NavUser } from "@/app/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ChatMaxingIconColoured } from "@/components/logo"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Base navigation items
const baseNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Directory",
    url: "/directory",
    icon: IconMap,
  },
]

// Owner-specific navigation
const ownerNavItems = [
  {
    title: "My Business",
    url: "/dashboard/owner",
    icon: IconBuilding,
  },
  {
    title: "My Listings",
    url: "/dashboard/owner/listings",
    icon: IconListDetails,
  },
  {
    title: "Add Listing",
    url: "/dashboard/owner/create",
    icon: IconPlus,
  },
]

// Admin-specific navigation
const adminNavItems = [
  {
    title: "Admin Panel",
    url: "/dashboard/admin",
    icon: IconShield,
  },
  {
    title: "Moderation",
    url: "/dashboard/admin/moderation",
    icon: IconEdit,
  },
  {
    title: "Categories",
    url: "/dashboard/admin/categories",
    icon: IconCategory,
  },
  {
    title: "Analytics",
    url: "/dashboard/admin/analytics",
    icon: IconAnalyze,
  },
]

const baseSecondaryItems = [
  {
    title: "Settings",
    url: "#",
    icon: IconSettings,
  },
  {
    title: "Get Help",
    url: "#",
    icon: IconHelp,
  },
  {
    title: "Search",
    url: "#",
    icon: IconSearch,
  },
]

const baseDocuments = [
  {
    name: "Data Library",
    url: "#",
    icon: IconDatabase,
  },
  {
    name: "Reports",
    url: "#",
    icon: IconReport,
  },
  {
    name: "Word Assistant",
    url: "#",
    icon: IconFileWord,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useQuery(api.users.current)

  // Build navigation based on user role
  const getNavigationItems = () => {
    let navItems = [...baseNavItems]

    if (user?.role === "owner") {
      navItems = [...navItems, ...ownerNavItems]
    } else if (user?.role === "admin") {
      navItems = [...navItems, ...ownerNavItems, ...adminNavItems]
    }

    return navItems
  }

  const navigationItems = getNavigationItems()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <ChatMaxingIconColoured className="!size-6" />
                <span className="text-base font-semibold">Business Directory</span>
                <Badge variant="outline" className="text-muted-foreground text-xs">MVP</Badge>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationItems} />
        <NavDocuments items={baseDocuments} />
        <NavSecondary items={baseSecondaryItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
