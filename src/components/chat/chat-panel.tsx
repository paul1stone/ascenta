"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { extractLastWorkflowRunId } from "@/components/chat/workflow-blocks";
import { AI_CONFIG } from "@/lib/ai/config";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const DEFAULT_MODEL = AI_CONFIG.defaultModels.anthropic;

interface PageConfig {
  title: string;
  description: string;
  suggestions: { title: string; prompt: string }[];
}

const PAGE_CONFIG: Record<string, PageConfig> = {
  "launch/onboarding": {
    title: "Onboarding",
    description: "Set up new hires for success with structured onboarding workflows.",
    suggestions: [
      { title: "Create onboarding plan", prompt: "Help me create an onboarding plan for a new employee" },
      { title: "First-day checklist", prompt: "Generate a first-day checklist for a new hire" },
      { title: "30-60-90 day plan", prompt: "Draft a 30-60-90 day onboarding plan" },
      { title: "Welcome email", prompt: "Write a welcome email for a new team member" },
    ],
  },
  "launch/training": {
    title: "Training Plans",
    description: "Build and manage training programs for employee development.",
    suggestions: [
      { title: "Training curriculum", prompt: "Help me design a training curriculum for a new role" },
      { title: "Skills assessment", prompt: "Create a skills gap assessment template" },
      { title: "Learning objectives", prompt: "Draft learning objectives for a training program" },
      { title: "Training schedule", prompt: "Build a training schedule for the first quarter" },
    ],
  },
  "launch/probation": {
    title: "Probation Review",
    description: "Manage probationary periods with structured reviews and documentation.",
    suggestions: [
      { title: "Probation review", prompt: "Help me write a probation period review" },
      { title: "Performance criteria", prompt: "Define probation performance criteria for a role" },
      { title: "Extension notice", prompt: "Draft a probation extension notice" },
      { title: "Confirmation letter", prompt: "Write a probation confirmation letter" },
    ],
  },
  "protect/warnings": {
    title: "Written Warnings",
    description: "Issue and manage written warnings with proper documentation and compliance.",
    suggestions: [
      { title: "Draft a written warning", prompt: "Help me write a corrective action for an employee" },
      { title: "Attendance warning", prompt: "Draft a written warning for attendance issues" },
      { title: "Conduct warning", prompt: "Write a written warning for a code of conduct violation" },
      { title: "Final warning", prompt: "Draft a final written warning before termination" },
    ],
  },
  "protect/pip": {
    title: "PIP Management",
    description: "Create and manage Performance Improvement Plans with clear goals and timelines.",
    suggestions: [
      { title: "Create a PIP", prompt: "Draft a Performance Improvement Plan for an underperforming employee" },
      { title: "PIP progress review", prompt: "Help me write a PIP mid-point progress review" },
      { title: "PIP completion", prompt: "Draft a PIP completion assessment" },
      { title: "PIP goals", prompt: "Help me define measurable PIP goals and milestones" },
    ],
  },
  "protect/compliance": {
    title: "Compliance",
    description: "Ensure HR processes meet legal and regulatory requirements.",
    suggestions: [
      { title: "Policy audit", prompt: "Help me audit our HR policies for compliance gaps" },
      { title: "Documentation review", prompt: "Review our employee documentation for compliance issues" },
      { title: "Regulatory update", prompt: "What recent labor law changes should I be aware of?" },
      { title: "Accommodation request", prompt: "Guide me through processing an ADA accommodation request" },
    ],
  },
  "attract/recruitment": {
    title: "Recruitment",
    description: "Streamline hiring with job postings, screening, and offer management.",
    suggestions: [
      { title: "Job description", prompt: "Help me write a job description for a new role" },
      { title: "Interview questions", prompt: "Generate structured interview questions for a role" },
      { title: "Offer letter", prompt: "Draft an offer letter for a new hire" },
      { title: "Candidate scorecard", prompt: "Create a candidate evaluation scorecard" },
    ],
  },
  "attract/engagement": {
    title: "Engagement",
    description: "Boost employee satisfaction, retention, and workplace culture.",
    suggestions: [
      { title: "Engagement survey", prompt: "Help me design an employee engagement survey" },
      { title: "Stay interview", prompt: "Draft stay interview questions for key employees" },
      { title: "Action plan", prompt: "Create an action plan from engagement survey results" },
      { title: "Recognition program", prompt: "Help me design an employee recognition program" },
    ],
  },
  "attract/recognition": {
    title: "Recognition",
    description: "Celebrate achievements and build a culture of appreciation.",
    suggestions: [
      { title: "Award nomination", prompt: "Help me write an employee award nomination" },
      { title: "Milestone celebration", prompt: "Plan a work anniversary milestone celebration" },
      { title: "Team shoutout", prompt: "Write a team recognition announcement for a project win" },
      { title: "Peer recognition", prompt: "Design a peer-to-peer recognition program" },
    ],
  },
};

const DEFAULT_CONFIG: PageConfig = {
  title: "Ascenta",
  description: "Your AI-powered HR assistant.",
  suggestions: [
    { title: "Written warning", prompt: "Help me write a corrective action for an employee" },
    { title: "Performance plan", prompt: "Draft a PIP for an underperforming employee" },
    { title: "Policy question", prompt: "What is our policy on remote work?" },
    { title: "Employee lookup", prompt: "Look up information about an employee" },
  ],
};

interface ChatPanelProps {
  subPage: string;
}

export function ChatPanel({ subPage }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [model, setModel] = useState<string>(DEFAULT_MODEL);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const config = PAGE_CONFIG[subPage] ?? DEFAULT_CONFIG;

  // Reset conversation when sub-page changes
  const resetChat = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setInput("");
    setConversationId(undefined);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    resetChat();
  }, [subPage, resetChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      const activeWorkflowRunId = lastAssistant
        ? extractLastWorkflowRunId(lastAssistant.content)
        : undefined;

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

      const newConversationId = res.headers.get("X-Conversation-Id");
      if (newConversationId && !conversationId) {
        setConversationId(newConversationId);
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
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content: fullContent } : msg
            )
          );
        }
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        // Request was cancelled
      } else {
        console.error("Chat error:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: "Sorry, I encountered an error. Please try again." }
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

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
            <div className="w-full max-w-2xl grid grid-cols-1 gap-3 sm:grid-cols-2">
              {config.suggestions.map((item) => (
                <button
                  key={item.title}
                  onClick={() => setInput(item.prompt)}
                  className="group flex flex-col gap-1 rounded-2xl border border-border bg-white p-4 text-left transition-all hover:border-summit/30 hover:shadow-lg hover:shadow-summit/5 hover:-translate-y-0.5"
                >
                  <p className="font-medium text-deep-blue">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.prompt}</p>
                </button>
              ))}
            </div>
          </div>
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

      {/* Input */}
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
  );
}
