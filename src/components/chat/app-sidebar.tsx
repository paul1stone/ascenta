"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
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
  MessageSquarePlus,
  MessagesSquare,
  Mountain,
  ChevronsUpDown,
  LogOut,
  UserCog,
  Settings,
  Sparkles,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { KnowledgeBasePanel } from "@/components/chat/knowledge-base-panel";
import Link from "next/link";
import type { ConversationSummary } from "@/lib/types";
import { DASHBOARD_NAV } from "@/lib/constants/dashboard-nav";

// TODO: Replace with real auth user once authentication is implemented
const CURRENT_USER = {
  name: "Paul Stone",
  email: "paul@ascenta.ai",
  initials: "PS",
  avatarUrl: "/avatars/user.jpg",
};

interface AppSidebarProps {
  conversations: ConversationSummary[];
  currentConversationId?: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  activeSubPage?: string;
  onSubPageChange?: (key: string) => void;
}

export function AppSidebar({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  activeSubPage = "",
  onSubPageChange,
}: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const activeCategory = activeSubPage ? activeSubPage.split("/")[0] : "";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              asChild
            >
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-deep-blue to-deep-blue/80 text-white">
                  <Mountain className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-display font-bold text-deep-blue">
                    Ascenta
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    HR Assistant
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* New Chat Button */}
      <SidebarGroup className="px-2 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onNewChat}
              className="bg-summit hover:bg-summit-hover text-white font-medium"
              tooltip="New Chat"
            >
              <MessageSquarePlus className="size-4" />
              <span>New Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {/* Navigation Groups (Launch / Protect / Attract) */}
      <SidebarContent>
        {DASHBOARD_NAV.map((category) => (
          <Collapsible
            key={category.key}
            defaultOpen={category.key === activeCategory}
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center gap-2">
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
                          onClick={() => onSubPageChange?.(subPage.key)}
                          className="cursor-pointer"
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

        {/* Conversations List */}
        <SidebarGroup>
          <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {conversations.map((conversation) => (
                <SidebarMenuItem key={conversation.id}>
                  <SidebarMenuButton
                    onClick={() => onSelectConversation(conversation.id)}
                    isActive={conversation.id === currentConversationId}
                    tooltip={conversation.title}
                  >
                    <MessagesSquare className="size-4" />
                    <span className="truncate">{conversation.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {conversations.length === 0 && !isCollapsed && (
                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                  <Sparkles className="mx-auto mb-2 size-5 text-summit/50" />
                  <p>No conversations yet</p>
                  <p className="text-xs">Start a new chat to begin</p>
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            <BookOpen className="mr-1 size-3" />
            Knowledge Base
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <KnowledgeBasePanel />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Profile */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
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
                  <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
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
