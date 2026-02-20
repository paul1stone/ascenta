"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { AppSidebar } from "@/components/chat/app-sidebar";
import { ChatWelcome } from "@/components/chat/chat-welcome";
import { extractLastWorkflowRunId } from "@/components/chat/workflow-blocks";
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppNavbar } from "@/components/app-navbar";
import { AI_CONFIG } from "@/lib/ai/config";
import { cn } from "@/lib/utils";
import {
  SUB_PAGE_TITLES,
  type TabKey,
} from "@/lib/constants/dashboard-nav";
import {
  MessageSquare,
  BookOpen as BookOpenIcon,
  KanbanSquare,
  BarChart3,
  Users,
  FileCheck,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type { ConversationSummary } from "@/lib/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Default to Anthropic Claude Sonnet 4
const DEFAULT_MODEL = AI_CONFIG.defaultModels.anthropic;

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "do", label: "Do", icon: MessageSquare },
  { key: "learn", label: "Learn", icon: BookOpenIcon },
  { key: "status", label: "Status", icon: KanbanSquare },
  { key: "insights", label: "Insights", icon: BarChart3 },
];

// ============================================================================
// LEARN / STATUS / INSIGHTS CONTENT PANELS
// ============================================================================

function LearnContent({ subPage }: { subPage: string }) {
  const title = SUB_PAGE_TITLES[subPage] || "HR";
  const isGeneral = !subPage;

  const cards = isGeneral
    ? [
        {
          title: "Getting Started with Ascenta",
          description: "Learn how to use the platform to manage HR workflows end-to-end.",
          icon: BookOpenIcon,
        },
        {
          title: "Company Policies",
          description: "Review your organization's HR policies and compliance requirements.",
          icon: FileCheck,
        },
        {
          title: "Best Practices",
          description: "Proven approaches for employee relations, performance management, and more.",
          icon: Clock,
        },
      ]
    : [
        {
          title: `${title} Basics`,
          description: "Get started with foundational concepts and best practices.",
          icon: BookOpenIcon,
        },
        {
          title: "Policy Guidelines",
          description: "Review company policies and regulatory requirements.",
          icon: FileCheck,
        },
        {
          title: "Recent Updates",
          description: "Stay current with the latest process changes and announcements.",
          icon: Clock,
        },
      ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-deep-blue/5">
                <card.icon className="size-5 text-deep-blue" />
              </div>
              <h3 className="font-semibold text-deep-blue">{card.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusContent({ subPage }: { subPage: string }) {
  const title = SUB_PAGE_TITLES[subPage] || "All Workflows";

  const stages = [
    { label: "Draft", count: 3, icon: FileCheck, color: "bg-slate-100 text-slate-600" },
    { label: "In Review", count: 2, icon: AlertCircle, color: "bg-amber-50 text-amber-600" },
    { label: "Sent", count: 4, icon: KanbanSquare, color: "bg-blue-50 text-blue-600" },
    { label: "Completed", count: 8, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage) => (
          <div key={stage.label} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">{stage.label}</span>
              <div className={`flex size-8 items-center justify-center rounded-lg ${stage.color}`}>
                <stage.icon className="size-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-deep-blue">{stage.count}</div>
            <p className="text-xs text-muted-foreground mt-1">documents</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <KanbanSquare className="size-5 text-deep-blue" />
          <h3 className="font-semibold text-deep-blue">{title} Pipeline</h3>
        </div>
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm border border-dashed rounded-lg">
          Document pipeline view — connect to tracked documents
        </div>
      </div>
    </div>
  );
}

function InsightsContent({ subPage }: { subPage: string }) {
  const title = SUB_PAGE_TITLES[subPage] || "Organization";

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Cases", value: "12", icon: Users, change: "+2 this week" },
          { label: "Completed", value: "47", icon: FileCheck, change: "+5 this month" },
          { label: "Avg. Resolution", value: "8.3d", icon: Clock, change: "-1.2d vs last month" },
          { label: "Compliance Rate", value: "96%", icon: TrendingUp, change: "+2% this quarter" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className="size-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-deep-blue">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="size-5 text-deep-blue" />
          <h3 className="font-semibold text-deep-blue">{title} Analytics</h3>
        </div>
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm border border-dashed rounded-lg">
          Chart placeholder — connect analytics data source
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CHAT CONTENT (inner component using sidebar context)
// ============================================================================

function ChatContent({
  messages,
  setMessages,
  input,
  setInput,
  isLoading,
  setIsLoading,
  conversationId,
  setConversationId,
  conversations,
  model,
  setModel,
  messagesEndRef,
  abortControllerRef,
  handleNewChat,
  loadConversation,
  loadConversations,
  activeSubPage,
  activeTab,
  onTabChange,
}: {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  conversationId: string | undefined;
  setConversationId: React.Dispatch<React.SetStateAction<string | undefined>>;
  conversations: ConversationSummary[];
  model: string;
  setModel: React.Dispatch<React.SetStateAction<string>>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  abortControllerRef: React.MutableRefObject<AbortController | null>;
  handleNewChat: () => void;
  loadConversation: (id: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  activeSubPage: string;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}) {
  const handleSubmit = async (overrideValue?: string) => {
    const content = (overrideValue ?? input).trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!overrideValue) setInput("");
    setIsLoading(true);

    const assistantMessageId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);

    try {
      abortControllerRef.current = new AbortController();

      const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
      const activeWorkflowRunId = lastAssistant ? extractLastWorkflowRunId(lastAssistant.content) : undefined;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content }],
          conversationId,
          userId: "anonymous",
          model,
          ...(activeWorkflowRunId ? { activeWorkflowRunId } : {}),
        }),
        signal: abortControllerRef.current.signal,
      });

      // Get conversation ID from response header
      const newConversationId = res.headers.get("X-Conversation-Id");
      if (newConversationId && !conversationId) {
        setConversationId(newConversationId);
        loadConversations();
      }

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      // Stream the response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: fullContent }
                : msg
            )
          );
        }
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Chat error:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: "Sorry, I encountered an error. Please try again.",
                }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  /** Workflow field/button selection: no user message shown, backend injects it */
  const handleWorkflowFieldSelect = async (runId: string, fieldKey: string, value: string) => {
    if (isLoading || !conversationId) return;
    setIsLoading(true);
    const assistantMessageId = `assistant-${Date.now()}`;
    setMessages((prev) => [...prev, { id: assistantMessageId, role: "assistant", content: "" }]);
    try {
      abortControllerRef.current = new AbortController();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          model,
          workflowFieldSelection: { runId, fieldKey, value },
        }),
        signal: abortControllerRef.current.signal,
      });
      const newConversationId = res.headers.get("X-Conversation-Id");
      if (newConversationId && !conversationId) {
        setConversationId(newConversationId);
        loadConversations();
      }
      if (!res.ok) throw new Error("Failed to get response");
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      if (reader) {
        while (true) {
          const { done, value: chunk } = await reader.read();
          if (done) break;
          fullContent += decoder.decode(chunk, { stream: true });
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content: fullContent } : msg
            )
          );
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Chat error:", err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: "Sorry, something went wrong. Please try again." }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  /** Follow-up action (email/script): no user message shown */
  const handleWorkflowFollowUpSelect = async (runId: string, type: "email" | "script") => {
    if (isLoading || !conversationId) return;
    setIsLoading(true);
    const assistantMessageId = `assistant-${Date.now()}`;
    setMessages((prev) => [...prev, { id: assistantMessageId, role: "assistant", content: "" }]);
    try {
      abortControllerRef.current = new AbortController();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          model,
          workflowFollowUp: { runId, type },
        }),
        signal: abortControllerRef.current.signal,
      });
      if (!res.ok) throw new Error("Failed to get response");
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      if (reader) {
        while (true) {
          const { done, value: chunk } = await reader.read();
          if (done) break;
          fullContent += decoder.decode(chunk, { stream: true });
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content: fullContent } : msg
            )
          );
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Chat error:", err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: "Sorry, something went wrong. Please try again." }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const pageTitle = activeSubPage
    ? SUB_PAGE_TITLES[activeSubPage] ?? "Chat"
    : conversationId
      ? "Chat"
      : "New Chat";

  return (
    <SidebarInset className="bg-glacier flex flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="font-display font-semibold text-deep-blue">
          {pageTitle}
        </h1>
        <div className="flex-1" />
        <AppNavbar />
      </header>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b bg-white px-4">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative",
                "hover:text-deep-blue",
                isActive
                  ? "text-deep-blue after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-summit"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content — DO tab shows chat, others show their panels */}
      {activeTab === "do" ? (
        <div className="flex flex-1 min-h-0">
          <div className="flex-1 flex flex-col min-w-0">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <ChatWelcome
                  onSuggestionClick={handleSuggestionClick}
                  subPage={activeSubPage || undefined}
                />
              ) : (
                <div className="mx-auto max-w-3xl px-4">
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={message.id}
                      role={message.role}
                      content={message.content}
                      isStreaming={
                        isLoading &&
                        index === messages.length - 1 &&
                        message.role === "assistant"
                      }
                      onWorkflowOptionSelect={handleWorkflowFieldSelect}
                      onFollowUpSelect={handleWorkflowFollowUpSelect}
                      onFollowUpOther={(value) => handleSubmit(value)}
                    />
                  ))}
                  <div ref={messagesEndRef} className="h-4" />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="shrink-0 border-t border-border bg-gradient-to-t from-glacier to-transparent p-4">
              <div className="mx-auto max-w-3xl">
                <ChatInput
                  value={input}
                  onChange={setInput}
                  onSubmit={() => handleSubmit()}
                  onStop={handleStop}
                  isLoading={isLoading}
                  model={model}
                  onModelChange={setModel}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {activeTab === "learn" && <LearnContent subPage={activeSubPage} />}
          {activeTab === "status" && <StatusContent subPage={activeSubPage} />}
          {activeTab === "insights" && <InsightsContent subPage={activeSubPage} />}
        </div>
      )}
    </SidebarInset>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [model, setModel] = useState<string>(DEFAULT_MODEL);
  const [activeSubPage, setActiveSubPage] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("do");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Reset chat when activeSubPage changes
  useEffect(() => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setInput("");
    setConversationId(undefined);
    setIsLoading(false);
    setActiveTab("do");
  }, [activeSubPage]);

  const loadConversations = async () => {
    try {
      const res = await fetch("/api/conversations?userId=anonymous");
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations?id=${id}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(
          data.messages.map(
            (m: { id: string; role: string; content: string }) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
            })
          )
        );
        setConversationId(id);
        setActiveSubPage("");
        setActiveTab("do");
        if (data.conversation?.model) {
          setModel(data.conversation.model);
        }
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setConversationId(undefined);
    setInput("");
    setModel(DEFAULT_MODEL);
    setActiveSubPage("");
    setActiveTab("do");
  }, []);

  const handleSubPageChange = useCallback((key: string) => {
    setActiveSubPage(key);
  }, []);

  return (
    <>
      <AppSidebar
        conversations={conversations}
        currentConversationId={conversationId}
        onNewChat={handleNewChat}
        onSelectConversation={loadConversation}
        activeSubPage={activeSubPage}
        onSubPageChange={handleSubPageChange}
      />
      <ChatContent
        messages={messages}
        setMessages={setMessages}
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        conversationId={conversationId}
        setConversationId={setConversationId}
        conversations={conversations}
        model={model}
        setModel={setModel}
        messagesEndRef={messagesEndRef}
        abortControllerRef={abortControllerRef}
        handleNewChat={handleNewChat}
        loadConversation={loadConversation}
        loadConversations={loadConversations}
        activeSubPage={activeSubPage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </>
  );
}
