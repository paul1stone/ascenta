# Inline Chat on "Do" Tabs — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make each sub-page's "Do" tab an inline conversational chat interface with workflow cards as quick-start launchers.

**Architecture:** Refactor `ChatProvider` from single-conversation to per-page-key conversations using a `Map<string, ConversationState>`. Create a `DoTabChat` component that renders either suggestion cards (empty state) or inline chat (active state). Wire `ChatProvider` into the root layout.

**Tech Stack:** React 19, Next.js App Router, TypeScript, Tailwind CSS, existing chat components (`ChatMessage`, `ChatInput`), existing `/api/chat` endpoint.

---

### Task 1: Refactor ChatProvider to support per-page conversations

**Files:**
- Modify: `apps/platform/src/lib/chat/chat-context.tsx`

**Step 1: Define the new per-page state shape**

Replace the single-conversation state variables with a `Map`-based approach. Add a `pageKey` parameter to all conversation-mutating methods.

Replace these state variables (lines 59-66):
```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [conversationId, setConversationId] = useState<string | undefined>();
const [conversations, setConversations] = useState<ConversationSummary[]>([]);
const [model, setModel] = useState<string>(DEFAULT_MODEL);
const [isPanelOpen, setIsPanelOpen] = useState(false);
const [activeTab, setActiveTab] = useState<TabKey>("do");
```

With this structure:

```typescript
interface PageConversation {
  messages: Message[];
  conversationId: string | undefined;
  isLoading: boolean;
  input: string;
}

const [pageConversations, setPageConversations] = useState<Map<string, PageConversation>>(new Map());
const [activePageKey, setActivePageKey] = useState<string>("");
const [model, setModel] = useState<string>(DEFAULT_MODEL);
const messagesEndRef = useRef<HTMLDivElement>(null);
const abortControllerRef = useRef<AbortController | null>(null);
```

**Step 2: Add helper to get/set current page state**

```typescript
const getPageState = useCallback((pageKey: string): PageConversation => {
  return pageConversations.get(pageKey) ?? {
    messages: [],
    conversationId: undefined,
    isLoading: false,
    input: "",
  };
}, [pageConversations]);

const updatePageState = useCallback((pageKey: string, update: Partial<PageConversation>) => {
  setPageConversations((prev) => {
    const next = new Map(prev);
    const current = next.get(pageKey) ?? {
      messages: [],
      conversationId: undefined,
      isLoading: false,
      input: "",
    };
    next.set(pageKey, { ...current, ...update });
    return next;
  });
}, []);
```

**Step 3: Update the context interface**

Replace `ChatPanelContextValue` interface (lines 24-52) with:

```typescript
interface ChatContextValue {
  // Per-page state accessors
  getPageState: (pageKey: string) => PageConversation;
  activePageKey: string;
  setActivePageKey: (key: string) => void;
  model: string;
  setModel: (model: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;

  // Per-page actions
  sendMessage: (pageKey: string, content: string) => Promise<void>;
  setPageInput: (pageKey: string, value: string) => void;
  resetConversation: (pageKey: string) => void;
  stopGeneration: (pageKey: string) => void;

  // Workflow actions (still need conversationId context)
  handleWorkflowFieldSelect: (pageKey: string, runId: string, fieldKey: string, value: string) => Promise<void>;
  handleWorkflowFollowUpSelect: (pageKey: string, runId: string, type: "email" | "script") => Promise<void>;
}
```

**Step 4: Rewrite `handleSubmit` as `sendMessage`**

Adapt the existing `handleSubmit` (lines 98-183) to accept a `pageKey` parameter and read/write state from the page map instead of top-level state:

```typescript
const sendMessage = useCallback(
  async (pageKey: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const state = getPageState(pageKey);
    if (state.isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const assistantMessageId = `assistant-${Date.now()}`;

    updatePageState(pageKey, {
      messages: [...state.messages, userMessage, { id: assistantMessageId, role: "assistant", content: "" }],
      isLoading: true,
      input: "",
    });

    try {
      abortControllerRef.current = new AbortController();

      const lastAssistant = [...state.messages].reverse().find((m) => m.role === "assistant");
      const activeWorkflowRunId = lastAssistant
        ? extractLastWorkflowRunId(lastAssistant.content)
        : undefined;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: trimmed }],
          conversationId: state.conversationId,
          userId: "anonymous",
          model,
          ...(activeWorkflowRunId ? { activeWorkflowRunId } : {}),
        }),
        signal: abortControllerRef.current.signal,
      });

      const newConversationId = res.headers.get("X-Conversation-Id");
      if (newConversationId && !state.conversationId) {
        updatePageState(pageKey, { conversationId: newConversationId });
      }

      if (!res.ok) throw new Error("Failed to get response");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let fullContent = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullContent += decoder.decode(value, { stream: true });
          setPageConversations((prev) => {
            const next = new Map(prev);
            const current = next.get(pageKey);
            if (!current) return prev;
            next.set(pageKey, {
              ...current,
              messages: current.messages.map((msg) =>
                msg.id === assistantMessageId ? { ...msg, content: fullContent } : msg
              ),
            });
            return next;
          });
        }
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Chat error:", error);
        setPageConversations((prev) => {
          const next = new Map(prev);
          const current = next.get(pageKey);
          if (!current) return prev;
          next.set(pageKey, {
            ...current,
            messages: current.messages.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: "Sorry, I encountered an error. Please try again." }
                : msg
            ),
          });
          return next;
        });
      }
    } finally {
      updatePageState(pageKey, { isLoading: false });
      abortControllerRef.current = null;
    }
  },
  [getPageState, updatePageState, model]
);
```

**Step 5: Add `resetConversation`, `setPageInput`, `stopGeneration`**

```typescript
const resetConversation = useCallback((pageKey: string) => {
  setPageConversations((prev) => {
    const next = new Map(prev);
    next.delete(pageKey);
    return next;
  });
}, []);

const setPageInput = useCallback((pageKey: string, value: string) => {
  updatePageState(pageKey, { input: value });
}, [updatePageState]);

const stopGeneration = useCallback((pageKey: string) => {
  abortControllerRef.current?.abort();
  updatePageState(pageKey, { isLoading: false });
}, [updatePageState]);
```

**Step 6: Adapt workflow field select and follow-up handlers**

Adapt `handleWorkflowFieldSelect` (lines 185-244) and `handleWorkflowFollowUpSelect` (lines 246-300) to accept `pageKey` as the first parameter and use `getPageState`/`updatePageState` instead of top-level state. Same streaming pattern as `sendMessage` but with `workflowFieldSelection` or `workflowFollowUp` body fields.

**Step 7: Remove unused state and exports**

Remove: `isPanelOpen`, `activeTab`, `conversations`, `openPanel`, `closePanel`, `togglePanel`, `handleNewChat`, `loadConversation`, `loadConversations`, `setActiveTab`. These were for the slide-over panel and are no longer needed.

Remove the `ConversationSummary` import and the `TabKey` import.

**Step 8: Update the Provider value and hook**

Update `ChatPanelContext` to use the new `ChatContextValue` interface. Rename `useChatPanel` to `useChat` (keep `useChatPanel` as a re-export for any remaining references).

```typescript
const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return ctx;
}

// Backwards compat alias
export const useChatPanel = useChat;
```

**Step 9: Verify no type errors**

Run: `cd apps/platform && npx tsc --noEmit`

Expected: May have errors in files that import `useChatPanel` — those will be fixed in subsequent tasks.

**Step 10: Commit**

```
git add apps/platform/src/lib/chat/chat-context.tsx
git commit -m "refactor: convert ChatProvider to per-page conversation model"
```

---

### Task 2: Create the DoTabChat component

**Files:**
- Create: `apps/platform/src/components/do-tab-chat.tsx`

**Step 1: Create the component with empty/active state rendering**

```typescript
"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/lib/chat/chat-context";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@ascenta/ui/button";
import type { PageConfig } from "@/lib/constants/dashboard-nav";

interface DoTabChatProps {
  pageKey: string;
  pageConfig: PageConfig;
  accentColor: string;
}

export function DoTabChat({ pageKey, pageConfig, accentColor }: DoTabChatProps) {
  const {
    getPageState,
    sendMessage,
    setPageInput,
    resetConversation,
    stopGeneration,
    handleWorkflowFieldSelect,
    handleWorkflowFollowUpSelect,
    model,
    setModel,
    messagesEndRef,
  } = useChat();

  const state = getPageState(pageKey);
  const hasMessages = state.messages.length > 0;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, messagesEndRef]);

  const handleCardClick = (prompt: string) => {
    sendMessage(pageKey, prompt);
  };

  const handleSubmit = () => {
    if (state.input.trim()) {
      sendMessage(pageKey, state.input);
    }
  };

  // Empty state: show suggestion cards
  if (!hasMessages) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="font-display text-xl font-bold text-foreground mb-1">
            {pageConfig.title}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {pageConfig.description}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
            {pageConfig.suggestions.map((s) => (
              <button
                key={s.title}
                onClick={() => handleCardClick(s.prompt)}
                className="group flex flex-col gap-1.5 rounded-xl border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5"
                style={{
                  borderColor: `${accentColor}30`,
                }}
              >
                <span className="text-sm font-semibold text-foreground">
                  {s.title}
                </span>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  {s.prompt}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Input always visible even in empty state */}
        <div className="shrink-0 border-t bg-white/50 p-4">
          <div className="mx-auto max-w-3xl">
            <ChatInput
              value={state.input}
              onChange={(v) => setPageInput(pageKey, v)}
              onSubmit={handleSubmit}
              onStop={() => stopGeneration(pageKey)}
              isLoading={state.isLoading}
              model={model}
              onModelChange={setModel}
              placeholder={`Ask about ${pageConfig.title.toLowerCase()}...`}
            />
          </div>
        </div>
      </div>
    );
  }

  // Active state: show messages
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header with new conversation button */}
      <div className="flex items-center justify-between border-b bg-white/50 px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          {pageConfig.title}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => resetConversation(pageKey)}
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <MessageSquarePlus className="size-3.5" />
          New conversation
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl">
          {state.messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              isStreaming={
                state.isLoading && index === state.messages.length - 1 && message.role === "assistant"
              }
              onWorkflowOptionSelect={(runId, fieldKey, value) =>
                handleWorkflowFieldSelect(pageKey, runId, fieldKey, value)
              }
              onFollowUpSelect={(runId, type) =>
                handleWorkflowFollowUpSelect(pageKey, runId, type)
              }
              onFollowUpOther={(value) => sendMessage(pageKey, value)}
            />
          ))}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t bg-white/50 p-4">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            value={state.input}
            onChange={(v) => setPageInput(pageKey, v)}
            onSubmit={handleSubmit}
            onStop={() => stopGeneration(pageKey)}
            isLoading={state.isLoading}
            model={model}
            onModelChange={setModel}
            placeholder={`Ask about ${pageConfig.title.toLowerCase()}...`}
          />
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify no type errors**

Run: `cd apps/platform && npx tsc --noEmit`

Expected: Should compile cleanly (or only errors from unconverted files).

**Step 3: Commit**

```
git add apps/platform/src/components/do-tab-chat.tsx
git commit -m "feat: add DoTabChat component with empty/active states"
```

---

### Task 3: Wire ChatProvider into the root layout

**Files:**
- Modify: `apps/platform/src/app/layout.tsx`

**Step 1: Add ChatProvider wrapper**

The root layout (lines 12-33) is a server component. Since `ChatProvider` is a client component, wrap `children` in a client boundary. The simplest approach: import `ChatProvider` and wrap the content area.

Since the layout itself is a server component and `ChatProvider` is `"use client"`, we just need to nest it. The `"use client"` boundary is on `ChatProvider` itself, so we can import and use it from the server layout:

```typescript
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { NavSidebar } from "@/components/nav-sidebar";
import { TopHeader } from "@/components/top-header";
import { ChatProvider } from "@/lib/chat/chat-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ascenta Platform",
  description: "AI-powered HR workflows for peak performance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ChatProvider>
          <div className="flex h-screen overflow-hidden">
            <NavSidebar />
            <main className="flex flex-1 flex-col overflow-hidden bg-glacier">
              <TopHeader />
              <div className="flex flex-1 flex-col overflow-hidden">
                {children}
              </div>
            </main>
          </div>
        </ChatProvider>
        <Analytics />
      </body>
    </html>
  );
}
```

**Step 2: Verify no type errors**

Run: `cd apps/platform && npx tsc --noEmit`

**Step 3: Commit**

```
git add apps/platform/src/app/layout.tsx
git commit -m "feat: wire ChatProvider into root layout"
```

---

### Task 4: Update the category sub-page to use DoTabChat

**Files:**
- Modify: `apps/platform/src/app/[category]/[sub]/page.tsx`

**Step 1: Replace the "Do" tab placeholder with DoTabChat**

Replace the entire page component. The "Do" tab now renders `DoTabChat`; other tabs keep their placeholder content.

```typescript
"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import {
  findNavContext,
  FUNCTION_TABS,
  PAGE_CONFIG,
  DEFAULT_PAGE_CONFIG,
  type TabKey,
} from "@/lib/constants/dashboard-nav";
import { FunctionTabs } from "@/components/function-tabs";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { DoTabChat } from "@/components/do-tab-chat";

export default function CategorySubPage({
  params,
}: {
  params: Promise<{ category: string; sub: string }>;
}) {
  const { category, sub } = use(params);
  const ctx = findNavContext(category, sub);
  if (!ctx) notFound();

  const [activeTab, setActiveTab] = useState<TabKey>("do");
  const tabMeta = FUNCTION_TABS.find((t) => t.key === activeTab)!;
  const pageKey = `${category}/${sub}`;
  const pageConfig = PAGE_CONFIG[pageKey] || DEFAULT_PAGE_CONFIG;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <FunctionTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentColor={ctx.category.color}
      />

      {activeTab === "do" ? (
        <DoTabChat
          pageKey={pageKey}
          pageConfig={pageConfig}
          accentColor={ctx.category.color}
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <BreadcrumbNav
            category={ctx.category.label}
            subPage={ctx.subPage.label}
            functionTab={tabMeta.label}
          />
          <h2 className="font-display text-xl font-bold text-foreground mb-1">
            {tabMeta.title}
          </h2>
          <p className="text-xs text-muted-foreground mb-5">
            {ctx.category.label} / {ctx.subPage.label} — {tabMeta.description}
          </p>
          <div className="rounded-lg border-2 border-dashed flex items-center justify-center h-[200px] text-sm text-muted-foreground">
            {tabMeta.label} content coming soon
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify no type errors**

Run: `cd apps/platform && npx tsc --noEmit`

**Step 3: Commit**

```
git add apps/platform/src/app/[category]/[sub]/page.tsx
git commit -m "feat: wire DoTabChat into category sub-pages for Do tab"
```

---

### Task 5: Manual smoke test

**Step 1: Start the dev server**

Run: `pnpm dev --filter=@ascenta/platform`

**Step 2: Test empty state**

1. Navigate to any sub-page (e.g. `http://localhost:3051/grow/coaching`)
2. Verify the "Do" tab is selected by default
3. Verify 4 suggestion cards are visible with correct titles from `PAGE_CONFIG`
4. Verify the chat input is visible at the bottom

**Step 3: Test card click → chat activation**

1. Click a suggestion card
2. Verify the cards disappear and the chat messages area appears
3. Verify the user message shows the card's prompt text
4. Verify the assistant starts streaming a response (requires valid API keys in `.env.local`)
5. Verify the "New conversation" button is visible at the top

**Step 4: Test new conversation reset**

1. Click "New conversation"
2. Verify the chat clears and the suggestion cards reappear

**Step 5: Test tab switching**

1. Start a conversation on the "Do" tab
2. Switch to "Learn" tab — verify non-chat placeholder shows
3. Switch back to "Do" tab — verify the conversation is preserved

**Step 6: Test page navigation**

1. Start a conversation on `grow/coaching`
2. Navigate to `attract/requisition` — verify different cards show (empty state)
3. Navigate back to `grow/coaching` — verify the conversation is preserved (in-memory)

**Step 7: Test free-form input**

1. On the "Do" tab with no conversation, type a message and press Enter
2. Verify the chat activates and the message is sent

**Step 8: Commit if all tests pass**

```
git add -A
git commit -m "feat: inline chat on Do tabs — complete"
```
