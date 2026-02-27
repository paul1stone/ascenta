"use client";

import { useState } from "react";
import {
  Target,
  FileText,
  CheckCircle,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@ascenta/ui";

// ============================================================================
// TYPES
// ============================================================================

interface LearnCard {
  id: string;
  icon: LucideIcon;
  title: string;
  shortDescription: string;
  content: React.ReactNode;
}

// ============================================================================
// CARD CONTENT
// ============================================================================

function WhatMakesAGoodGoalContent() {
  return (
    <>
      <h4 className="font-medium text-deep-blue">The SMART Framework</h4>
      <p>
        Great goals follow the SMART framework. Each goal should be{" "}
        <strong>Specific</strong> (clearly defined),{" "}
        <strong>Measurable</strong> (quantifiable progress),{" "}
        <strong>Achievable</strong> (realistic given resources and constraints),{" "}
        <strong>Relevant</strong> (aligned with team and business objectives),
        and <strong>Time-bound</strong> (has a clear deadline or milestone).
      </p>

      <h4 className="font-medium text-deep-blue">Good Goal Examples</h4>
      <div className="rounded-lg bg-green-50 p-3 text-green-800">
        <p className="font-medium">Example 1</p>
        <p>
          &quot;Reduce average customer support response time from 4 hours to
          under 1 hour by March 31, measured through the helpdesk
          dashboard.&quot;
        </p>
      </div>
      <div className="rounded-lg bg-green-50 p-3 text-green-800">
        <p className="font-medium">Example 2</p>
        <p>
          &quot;Complete AWS Solutions Architect certification by June 30 to
          support the team&apos;s cloud migration initiative.&quot;
        </p>
      </div>

      <h4 className="font-medium text-deep-blue">Weak Goal Examples</h4>
      <div className="rounded-lg bg-red-50 p-3 text-red-800">
        <p className="font-medium">Example 1</p>
        <p>
          &quot;Be better at customer support.&quot; &mdash; Not specific, not
          measurable, no deadline.
        </p>
      </div>
      <div className="rounded-lg bg-red-50 p-3 text-red-800">
        <p className="font-medium">Example 2</p>
        <p>
          &quot;Learn more about cloud stuff.&quot; &mdash; Vague topic, no
          measurable outcome, no time frame.
        </p>
      </div>
    </>
  );
}

function HowToWriteObjectiveNotesContent() {
  return (
    <>
      <h4 className="font-medium text-deep-blue">
        The Behavior &rarr; Impact Format
      </h4>
      <p>
        Effective performance notes describe <strong>observable behavior</strong>{" "}
        and its <strong>impact</strong>, rather than making character judgments.
        Focus on what someone did (or did not do) and the specific consequence it
        had on the team, project, or organization.
      </p>

      <h4 className="font-medium text-deep-blue">Good Note Examples</h4>
      <div className="rounded-lg bg-green-50 p-3 text-green-800">
        <p className="font-medium">Example 1</p>
        <p>
          &quot;During the March 12 sprint review, Jamie presented the API
          redesign with clear diagrams and handled all stakeholder questions
          confidently. This resulted in immediate sign-off, saving an estimated
          two weeks of follow-up.&quot;
        </p>
      </div>
      <div className="rounded-lg bg-green-50 p-3 text-green-800">
        <p className="font-medium">Example 2</p>
        <p>
          &quot;Alex missed the data migration deadline on Feb 28 without
          notifying the team in advance. The downstream QA team lost two days
          waiting for test data, delaying the release by one sprint.&quot;
        </p>
      </div>

      <h4 className="font-medium text-deep-blue">Weak Note Examples</h4>
      <div className="rounded-lg bg-red-50 p-3 text-red-800">
        <p className="font-medium">Example 1</p>
        <p>
          &quot;Jamie is a great presenter.&quot; &mdash; Character judgment
          with no specific behavior or impact described.
        </p>
      </div>
      <div className="rounded-lg bg-red-50 p-3 text-red-800">
        <p className="font-medium">Example 2</p>
        <p>
          &quot;Alex is unreliable and careless.&quot; &mdash; Subjective label
          with no observable behavior or measurable consequence.
        </p>
      </div>
    </>
  );
}

function StrongVsWeakCheckInContent() {
  return (
    <>
      <p>
        Check-ins are most valuable when they clearly communicate progress,
        surface blockers early, and include honest self-assessment. Compare these
        examples across three key dimensions.
      </p>

      <h4 className="font-medium text-deep-blue">Progress Reporting</h4>
      <div className="rounded-lg bg-green-50 p-3 text-green-800">
        <p className="font-medium">Strong</p>
        <p>
          &quot;Completed 3 of 5 user stories this sprint. The authentication
          flow and dashboard layout are deployed to staging. The remaining two
          stories (notifications and settings page) are in code review and
          should merge by Wednesday.&quot;
        </p>
      </div>
      <div className="rounded-lg bg-red-50 p-3 text-red-800">
        <p className="font-medium">Weak</p>
        <p>
          &quot;Making good progress on everything. Things are going
          well.&quot;
        </p>
      </div>

      <h4 className="font-medium text-deep-blue">Blocker Identification</h4>
      <div className="rounded-lg bg-green-50 p-3 text-green-800">
        <p className="font-medium">Strong</p>
        <p>
          &quot;Blocked on the payment integration &mdash; the third-party API
          docs are outdated and I&apos;ve opened a support ticket (case #4821).
          In the meantime, I&apos;ve mocked the responses so front-end work can
          continue. I may need help escalating if we don&apos;t hear back by
          Thursday.&quot;
        </p>
      </div>
      <div className="rounded-lg bg-red-50 p-3 text-red-800">
        <p className="font-medium">Weak</p>
        <p>
          &quot;Stuck on a few things but working through them.&quot;
        </p>
      </div>

      <h4 className="font-medium text-deep-blue">Self-Assessment</h4>
      <div className="rounded-lg bg-green-50 p-3 text-green-800">
        <p className="font-medium">Strong</p>
        <p>
          &quot;I underestimated the complexity of the data migration task. Next
          time I&apos;ll run a spike before committing to a timeline. I&apos;ve
          adjusted my remaining estimates to account for what I&apos;ve
          learned.&quot;
        </p>
      </div>
      <div className="rounded-lg bg-red-50 p-3 text-red-800">
        <p className="font-medium">Weak</p>
        <p>
          &quot;I think I&apos;m doing fine overall.&quot;
        </p>
      </div>
    </>
  );
}

function FeedbackScriptsContent() {
  return (
    <>
      <p>
        Use these templates as starting points. Adapt the language to fit your
        relationship with the employee and the specific situation.
      </p>

      <h4 className="font-medium text-deep-blue">Positive Feedback</h4>
      <div className="rounded-lg bg-blue-50 p-3 text-blue-800 italic">
        <p>
          &quot;I wanted to call out the work you did on [specific project or
          task]. The way you [specific behavior &mdash; e.g., organized the
          cross-team sync, caught the edge case in testing] made a real
          difference. It [specific impact &mdash; e.g., kept us on schedule,
          prevented a production issue]. I appreciate the effort and want you to
          know it&apos;s noticed.&quot;
        </p>
      </div>

      <h4 className="font-medium text-deep-blue">Redirecting Feedback</h4>
      <div className="rounded-lg bg-blue-50 p-3 text-blue-800 italic">
        <p>
          &quot;I&apos;d like to talk about [specific situation &mdash; e.g.,
          how the client call went on Tuesday]. I noticed that [specific
          behavior &mdash; e.g., some of the technical details were presented
          without context for the non-technical stakeholders]. The effect was
          [specific impact &mdash; e.g., the client seemed confused and we
          needed a follow-up meeting]. Going forward, I&apos;d suggest [concrete
          alternative &mdash; e.g., preparing a one-page summary with visuals
          for mixed audiences]. What are your thoughts?&quot;
        </p>
      </div>

      <h4 className="font-medium text-deep-blue">Mixed Feedback</h4>
      <div className="rounded-lg bg-blue-50 p-3 text-blue-800 italic">
        <p>
          &quot;I want to share some feedback on [project or time period].
          First, [specific positive behavior &mdash; e.g., your technical
          solution for the caching layer was well-architected and the team
          learned from your approach]. That said, one area I&apos;d like us to
          work on together is [specific concern &mdash; e.g., communicating
          timeline changes earlier when scope shifts]. When [specific
          impact &mdash; e.g., the team found out about the delay the day of the
          deadline], it created unnecessary pressure. How can we set up a
          process so those updates surface sooner?&quot;
        </p>
      </div>
    </>
  );
}

// ============================================================================
// CARD DATA
// ============================================================================

const LEARN_CARDS: LearnCard[] = [
  {
    id: "smart-goals",
    icon: Target,
    title: "What Makes a Good Goal",
    shortDescription:
      "Learn the SMART framework with real examples of strong and weak goals.",
    content: <WhatMakesAGoodGoalContent />,
  },
  {
    id: "objective-notes",
    icon: FileText,
    title: "How to Write Objective Notes",
    shortDescription:
      "Use the Behavior to Impact format for clear, actionable notes.",
    content: <HowToWriteObjectiveNotesContent />,
  },
  {
    id: "check-in-examples",
    icon: CheckCircle,
    title: "Strong vs Weak Check-In Examples",
    shortDescription:
      "Side-by-side comparisons for progress reporting, blockers, and self-assessment.",
    content: <StrongVsWeakCheckInContent />,
  },
  {
    id: "feedback-scripts",
    icon: MessageSquare,
    title: "Feedback Scripts",
    shortDescription:
      "Ready-to-use templates for positive, redirecting, and mixed feedback.",
    content: <FeedbackScriptsContent />,
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function GrowLearn() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleCard(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {LEARN_CARDS.map((card) => {
        const isExpanded = expanded.has(card.id);
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className="rounded-xl border bg-white shadow-sm overflow-hidden"
          >
            <button
              className="flex w-full items-center gap-3 p-5 text-left hover:bg-slate-50 transition-colors"
              onClick={() => toggleCard(card.id)}
              aria-expanded={isExpanded}
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-deep-blue/5">
                <Icon className="size-5 text-deep-blue" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-deep-blue">{card.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {card.shortDescription}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "size-5 text-muted-foreground transition-transform",
                  isExpanded && "rotate-180",
                )}
              />
            </button>
            {isExpanded && (
              <div className="border-t px-5 py-4 text-sm text-deep-blue/80 space-y-3">
                {card.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
