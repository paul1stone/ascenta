"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Rocket,
  Shield,
  Magnet,
  ChevronRight,
  Mountain,
  ChevronsUpDown,
  LogOut,
  UserCog,
  Settings,
  UserPlus,
  BookOpen,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  Scale,
  Target,
  Heart,
  Award,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

const CURRENT_USER = {
  name: "Paul Stone",
  email: "paul@ascenta.ai",
  initials: "PS",
  avatarUrl: "/avatars/user.jpg",
};

interface SubPage {
  key: string;
  label: string;
  icon: LucideIcon;
}

interface NavCategory {
  key: string;
  label: string;
  icon: LucideIcon;
  subPages: SubPage[];
}

const DASHBOARD_NAV: NavCategory[] = [
  {
    key: "launch",
    label: "Launch",
    icon: Rocket,
    subPages: [
      { key: "launch/onboarding", label: "Onboarding", icon: UserPlus },
      { key: "launch/training", label: "Training Plans", icon: BookOpen },
      { key: "launch/probation", label: "Probation Review", icon: ClipboardCheck },
    ],
  },
  {
    key: "protect",
    label: "Protect",
    icon: Shield,
    subPages: [
      { key: "protect/warnings", label: "Written Warnings", icon: AlertTriangle },
      { key: "protect/pip", label: "PIP Management", icon: FileText },
      { key: "protect/compliance", label: "Compliance", icon: Scale },
    ],
  },
  {
    key: "attract",
    label: "Attract",
    icon: Magnet,
    subPages: [
      { key: "attract/recruitment", label: "Recruitment", icon: Target },
      { key: "attract/engagement", label: "Engagement", icon: Heart },
      { key: "attract/recognition", label: "Recognition", icon: Award },
    ],
  },
];

interface DashboardSidebarProps {
  activeSubPage: string;
  onSubPageChange: (key: string) => void;
}

export function DashboardSidebar({
  activeSubPage,
  onSubPageChange,
}: DashboardSidebarProps) {
  const activeCategory = activeSubPage ? activeSubPage.split("/")[0] : "";

  return (
    <Sidebar collapsible="icon" className="sidebar-dark border-r-0">
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-white/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-white/10 data-[state=open]:text-white"
              asChild
            >
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-summit to-summit-hover text-white">
                  <Mountain className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-display font-bold text-white">
                    Ascenta
                  </span>
                  <span className="truncate text-xs text-slate-400">
                    HR Platform
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Home / Dashboard button */}
      <SidebarGroup className="px-2 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onSubPageChange("")}
              isActive={!activeSubPage}
              tooltip="Dashboard"
              className="text-slate-300 hover:text-white hover:bg-white/10 data-[active=true]:text-summit data-[active=true]:bg-white/10"
            >
              <LayoutDashboard className="size-4" />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {/* Navigation Groups */}
      <SidebarContent>
        {DASHBOARD_NAV.map((category) => (
          <Collapsible
            key={category.key}
            defaultOpen={category.key === activeCategory}
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center gap-2 text-slate-400 hover:text-white">
                  <category.icon className="size-4" />
                  <span className="flex-1 text-left">{category.label}</span>
                  <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenuSub>
                    {category.subPages.map((subPage) => (
                      <SidebarMenuSubItem key={subPage.key}>
                        <SidebarMenuSubButton
                          isActive={activeSubPage === subPage.key}
                          onClick={() => onSubPageChange(subPage.key)}
                          className="cursor-pointer text-slate-300 hover:text-white hover:bg-white/10 data-[active=true]:text-summit data-[active=true]:bg-white/10"
                        >
                          <subPage.icon className="size-4" />
                          <span>{subPage.label}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>

      {/* Footer with User Profile */}
      <SidebarFooter className="border-t border-white/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-white/10 data-[state=open]:text-white"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={CURRENT_USER.avatarUrl} alt={CURRENT_USER.name} />
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-summit to-summit-hover text-white font-medium">
                      {CURRENT_USER.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-white">
                      {CURRENT_USER.name}
                    </span>
                    <span className="truncate text-xs text-slate-400">
                      {CURRENT_USER.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-slate-400" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={CURRENT_USER.avatarUrl} alt={CURRENT_USER.name} />
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-summit to-summit-hover text-white font-medium">
                        {CURRENT_USER.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{CURRENT_USER.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {CURRENT_USER.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer">
                    <UserCog className="mr-2 size-4" />
                    Switch Account
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 size-4" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
