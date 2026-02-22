"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { AppSidebar } from "@/components/chat/app-sidebar";
import { ChatWelcome } from "@/components/chat/chat-welcome";
import { extractLastWorkflowRunId } from "@/components/chat/workflow-blocks";
import {
  SidebarInset,
  useSidebar,
} from "@ascenta/ui/sidebar";
import { AppNavbar } from "@/components/app-navbar";
import { DocumentTracker } from "@/components/document-tracker";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { NeedsAttention } from "@/components/dashboard/needs-attention";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { EmployeeDirectory } from "@/components/dashboard/employee-directory";
import { DocumentPipeline } from "@/components/dashboard/document-pipeline";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { AI_CONFIG } from "@/lib/ai/config";
import { cn } from "@ascenta/ui";
import {
  SUB_PAGE_TITLES,
  type TabKey,
} from "@/lib/constants/dashboard-nav";
import {
  MessageSquare,
  BookOpen as BookOpenIcon,
  KanbanSquare,
  FileCheck,
  Clock,
} from "lucide-react";
import type { ConversationSummary } from "@ascenta/types";

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
  );
}


// ============================================================================
// DASHBOARD CONTENT PANEL
// ============================================================================

function DashboardContent() {
  return (
    <main className="space-y-6">
      <StatsOverview />
      <NeedsAttention />
      <QuickActions />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EmployeeDirectory />
        </div>
        <div className="space-y-6">
          <DocumentPipeline />
          <RecentActivity />
        </div>
      </div>
    </main>
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
  model,
  setModel,
  messagesEndRef,
  abortControllerRef,
  loadConversations,
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
  model: string;
  setModel: React.Dispatch<React.SetStateAction<string>>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  abortControllerRef: React.RefObject<AbortController | null>;
  loadConversations: () => Promise<void>;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}) {
  const { setOpen } = useSidebar();
  const prevTabRef = useRef<TabKey>(activeTab);

  // Auto-close sidebar when leaving "do" tab, re-open when returning
  useEffect(() => {
    const prev = prevTabRef.current;
    prevTabRef.current = activeTab;

    if (activeTab !== "do" && prev === "do") {
      setOpen(false);
    } else if (activeTab === "do" && prev !== "do") {
      setOpen(true);
    }
  }, [activeTab, setOpen]);

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
        // Request was intentionally aborted
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

  return (
    <SidebarInset className="bg-glacier flex flex-col">
      {/* Header with inline tabs */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-6">
        <nav className="flex items-center gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                  isActive
                    ? "bg-deep-blue/8 text-deep-blue"
                    : "text-muted-foreground hover:text-deep-blue hover:bg-slate-100"
                )}
              >
                <Icon className="size-3.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="flex-1" />
        <AppNavbar
          onDashboardClick={() => onTabChange("dashboard")}
          isDashboardActive={activeTab === "dashboard"}
        />
      </header>

      {/* Content — DO tab shows chat, others show their panels */}
      {activeTab === "do" ? (
        <div className="flex flex-1 min-h-0">
          <div className="flex-1 flex flex-col min-w-0">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <ChatWelcome
                  onSuggestionClick={handleSuggestionClick}
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
          {activeTab === "learn" && (
            <div className="max-w-7xl mx-auto w-full px-6 py-8 space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-deep-blue">HR Knowledge Base</h1>
                <p className="mt-1 text-muted-foreground">Guides, policies, and best practices for your organization.</p>
              </div>
              <LearnContent subPage="" />
            </div>
          )}
          {activeTab === "status" && (
            <div className="max-w-7xl mx-auto w-full px-6 py-8 space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-deep-blue">Document Tracker</h1>
                <p className="mt-1 text-muted-foreground">Track and manage HR documents through their delivery lifecycle.</p>
              </div>
              <DocumentTracker />
            </div>
          )}
          {activeTab === "dashboard" && (
            <div className="max-w-7xl mx-auto w-full px-6 py-8 space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-deep-blue">Dashboard</h1>
                <p className="mt-1 text-muted-foreground">Overview of your HR operations and team activity.</p>
              </div>
              <DashboardContent />
            </div>
          )}
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
  const [activeTab, setActiveTab] = useState<TabKey>("do");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await fetch("/api/conversations?userId=anonymous");
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  // Load conversations on mount
  useEffect(() => {
    fetch("/api/conversations?userId=anonymous")
      .then((res) => res.json())
      .then((data) => setConversations(data.conversations || []))
      .catch((error) => console.error("Failed to load conversations:", error));
  }, []);

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
    setActiveTab("do");
  }, []);

  return (
    <>
      <AppSidebar
        conversations={conversations}
        currentConversationId={conversationId}
        onNewChat={handleNewChat}
        onSelectConversation={loadConversation}
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
        model={model}
        setModel={setModel}
        messagesEndRef={messagesEndRef}
        abortControllerRef={abortControllerRef}
        loadConversations={loadConversations}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </>
  );
}
