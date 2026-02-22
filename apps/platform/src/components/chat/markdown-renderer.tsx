"use client";

import { memo, useMemo, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { codeToHtml } from "shiki";
import { cn } from "@ascenta/ui";
import { Check, Copy, AlertCircle, Info, Lightbulb, AlertTriangle } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Memoized code block component with syntax highlighting
function CodeBlock({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [html, setHtml] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const highlight = async () => {
      try {
        const highlighted = await codeToHtml(code, {
          lang: language || "text",
          theme: "github-dark",
        });
        setHtml(highlighted);
      } catch {
        // Fallback for unknown languages
        const fallback = await codeToHtml(code, {
          lang: "text",
          theme: "github-dark",
        });
        setHtml(fallback);
      }
    };
    highlight();
  }, [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-4 rounded-lg overflow-hidden">
      {/* Language badge and copy button */}
      <div className="flex items-center justify-between bg-slate-800 px-4 py-2 text-xs text-slate-400">
        <span className="font-medium uppercase tracking-wide">
          {language || "text"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2 py-1 hover:bg-slate-700 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="size-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Highlighted code */}
      <div
        className="overflow-x-auto [&>pre]:!m-0 [&>pre]:!rounded-none [&>pre]:p-4 [&>pre]:text-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

// Inline code component
function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono text-deep-blue before:content-none after:content-none">
      {children}
    </code>
  );
}

// Callout component for special blockquotes
function Callout({
  type,
  children,
}: {
  type: "note" | "warning" | "tip" | "important";
  children: React.ReactNode;
}) {
  const styles = {
    note: {
      bg: "bg-blue-50",
      border: "border-blue-400",
      icon: <Info className="size-5 text-blue-600" />,
      title: "Note",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-400",
      icon: <AlertTriangle className="size-5 text-amber-600" />,
      title: "Warning",
    },
    tip: {
      bg: "bg-green-50",
      border: "border-green-400",
      icon: <Lightbulb className="size-5 text-green-600" />,
      title: "Tip",
    },
    important: {
      bg: "bg-red-50",
      border: "border-red-400",
      icon: <AlertCircle className="size-5 text-red-600" />,
      title: "Important",
    },
  };

  const style = styles[type];

  return (
    <div
      className={cn(
        "my-4 flex gap-3 rounded-lg border-l-4 p-4",
        style.bg,
        style.border
      )}
    >
      <div className="shrink-0">{style.icon}</div>
      <div className="flex-1 [&>p]:m-0">{children}</div>
    </div>
  );
}

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  const components = useMemo(
    () => ({
      code: ({
        inline,
        className: codeClassName,
        children,
      }: {
        inline?: boolean;
        className?: string;
        children?: React.ReactNode;
      }) => {
        const match = /language-(\w+)/.exec(codeClassName || "");
        const language = match ? match[1] : "";
        const code = String(children).replace(/\n$/, "");

        if (inline) {
          return <InlineCode>{children}</InlineCode>;
        }

        return <CodeBlock language={language} code={code} />;
      },

      blockquote: ({ children }: { children?: React.ReactNode }) => {
        const text = String(children);
        const calloutMatch = text.match(/\[!(NOTE|WARNING|TIP|IMPORTANT)\]/i);

        if (calloutMatch) {
          const type = calloutMatch[1].toLowerCase() as
            | "note"
            | "warning"
            | "tip"
            | "important";
          const cleanedChildren = text.replace(/\[!(NOTE|WARNING|TIP|IMPORTANT)\]\s*/i, "");
          return <Callout type={type}>{cleanedChildren}</Callout>;
        }

        return (
          <blockquote className="my-4 border-l-4 border-summit pl-4 italic text-muted-foreground">
            {children}
          </blockquote>
        );
      },

      a: ({
        href,
        children,
      }: {
        href?: string;
        children?: React.ReactNode;
      }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-summit hover:text-summit-hover underline underline-offset-2 transition-colors"
        >
          {children}
        </a>
      ),

      table: ({ children }: { children?: React.ReactNode }) => (
        <div className="my-4 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">{children}</table>
        </div>
      ),
      thead: ({ children }: { children?: React.ReactNode }) => (
        <thead className="bg-glacier text-left">{children}</thead>
      ),
      th: ({ children }: { children?: React.ReactNode }) => (
        <th className="border-b px-4 py-2 font-semibold text-deep-blue">
          {children}
        </th>
      ),
      td: ({ children }: { children?: React.ReactNode }) => (
        <td className="border-b px-4 py-2">{children}</td>
      ),
      tr: ({ children }: { children?: React.ReactNode }) => (
        <tr className="hover:bg-glacier/50 transition-colors">{children}</tr>
      ),

      li: ({
        children,
        className: liClassName,
      }: {
        children?: React.ReactNode;
        className?: string;
      }) => {
        if (liClassName?.includes("task-list-item")) {
          return <li className="flex items-start gap-2 list-none">{children}</li>;
        }
        return <li>{children}</li>;
      },

      h1: ({ children }: { children?: React.ReactNode }) => (
        <h1 className="mt-6 mb-4 text-2xl font-bold text-deep-blue font-display">
          {children}
        </h1>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <h2 className="mt-5 mb-3 text-xl font-bold text-deep-blue font-display">
          {children}
        </h2>
      ),
      h3: ({ children }: { children?: React.ReactNode }) => (
        <h3 className="mt-4 mb-2 text-lg font-semibold text-deep-blue">
          {children}
        </h3>
      ),
      h4: ({ children }: { children?: React.ReactNode }) => (
        <h4 className="mt-3 mb-2 text-base font-semibold text-deep-blue">
          {children}
        </h4>
      ),

      p: ({ children }: { children?: React.ReactNode }) => (
        <p className="my-3 leading-7">{children}</p>
      ),

      ul: ({ children }: { children?: React.ReactNode }) => (
        <ul className="my-3 ml-6 list-disc space-y-1 marker:text-summit">
          {children}
        </ul>
      ),
      ol: ({ children }: { children?: React.ReactNode }) => (
        <ol className="my-3 ml-6 list-decimal space-y-1 marker:text-summit marker:font-semibold">
          {children}
        </ol>
      ),

      hr: () => <hr className="my-6 border-t border-border" />,

      strong: ({ children }: { children?: React.ReactNode }) => (
        <strong className="font-semibold text-deep-blue">{children}</strong>
      ),
      em: ({ children }: { children?: React.ReactNode }) => (
        <em className="italic">{children}</em>
      ),
    }),
    []
  );

  return (
    <div
      className={cn(
        "prose prose-ascenta max-w-none",
        "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
});
