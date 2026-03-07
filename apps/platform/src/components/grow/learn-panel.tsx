"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ascenta/ui/accordion";
import { Card, CardContent } from "@ascenta/ui/card";
import { Target, FileText, MessageSquare } from "lucide-react";

function SectionIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <span className="mr-3 flex size-7 shrink-0 items-center justify-center rounded-md bg-[#0c1e3d]/8 text-[#0c1e3d]">
      <Icon className="size-4" />
    </span>
  );
}

function ExampleBlock({
  label,
  children,
  variant = "good",
}: {
  label: string;
  children: React.ReactNode;
  variant?: "good" | "bad";
}) {
  return (
    <div
      className={`rounded-md border px-3 py-2.5 text-sm ${
        variant === "good"
          ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
          : "border-red-200 bg-red-50/60 text-red-900"
      }`}
    >
      <span className="mr-1.5 text-xs font-semibold uppercase tracking-wide opacity-70">
        {label}
      </span>
      {children}
    </div>
  );
}

export function LearnPanel() {
  return (
    <Card className="mx-auto w-full max-w-3xl gap-0 py-0">
      <Accordion type="multiple" defaultValue={["goals", "notes", "checkins"]}>
        {/* Section 1 - Goals */}
        <AccordionItem value="goals" className="px-6">
          <AccordionTrigger className="py-5 text-base font-semibold">
            <span className="flex items-center">
              <SectionIcon icon={Target} />
              What Makes a Good Goal
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-6 text-[13px] leading-relaxed text-muted-foreground">
            <p className="mb-3">
              Strong goals follow the <strong className="text-foreground">SMART</strong> framework:
              they are Specific, Measurable, Achievable, Relevant, and Time-bound. A well-written
              goal gives both manager and employee a clear picture of what success looks like and
              when it should be achieved.
            </p>
            <p className="mb-4">
              Focus on outcomes rather than activities. Instead of &ldquo;work on customer
              service,&rdquo; define a concrete target with a deadline. This makes progress easy to
              track and conversations more productive.
            </p>

            <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-foreground">
              Examples by Category
            </h4>
            <div className="space-y-2">
              <ExampleBlock label="Performance" variant="good">
                &ldquo;Reduce average ticket resolution time from 48h to 24h by end of Q2.&rdquo;
              </ExampleBlock>
              <ExampleBlock label="Leadership" variant="good">
                &ldquo;Lead weekly team standups and document action items for 3 consecutive
                months.&rdquo;
              </ExampleBlock>
              <ExampleBlock label="Development" variant="good">
                &ldquo;Complete AWS Solutions Architect certification by Q3.&rdquo;
              </ExampleBlock>
            </div>

            <h4 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-foreground">
              Writing Measurable Success Metrics
            </h4>
            <ul className="list-inside list-disc space-y-1 pl-1">
              <li>Include a baseline number and a target number (e.g., &ldquo;from 48h to 24h&rdquo;).</li>
              <li>Set a specific deadline, not &ldquo;soon&rdquo; or &ldquo;ongoing.&rdquo;</li>
              <li>Use observable evidence: &ldquo;documented action items,&rdquo; &ldquo;certification earned,&rdquo; &ldquo;report delivered.&rdquo;</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* Section 2 - Performance Notes */}
        <AccordionItem value="notes" className="px-6">
          <AccordionTrigger className="py-5 text-base font-semibold">
            <span className="flex items-center">
              <SectionIcon icon={FileText} />
              How to Write Objective Performance Notes
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-6 text-[13px] leading-relaxed text-muted-foreground">
            <p className="mb-3">
              A good performance note follows the{" "}
              <strong className="text-foreground">Observation &rarr; Expectation &rarr; Follow-up</strong>{" "}
              structure. State what happened, what was expected, and what comes next. This
              keeps documentation factual and defensible.
            </p>

            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground">
                  Do
                </h4>
                <ul className="list-inside list-disc space-y-1 pl-1">
                  <li>Stick to facts and observable behaviors</li>
                  <li>Be specific: who, what, when, where</li>
                  <li>Note frequency (&ldquo;second occurrence in 30 days&rdquo;)</li>
                  <li>Include the stated expectation going forward</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground">
                  Don&apos;t
                </h4>
                <ul className="list-inside list-disc space-y-1 pl-1">
                  <li>Use subjective language (&ldquo;bad attitude&rdquo;)</li>
                  <li>State opinions as facts</li>
                  <li>Generalize (&ldquo;always,&rdquo; &ldquo;never&rdquo;)</li>
                  <li>Attribute intent (&ldquo;doesn&apos;t care&rdquo;)</li>
                </ul>
              </div>
            </div>

            <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-foreground">
              Compare
            </h4>
            <div className="space-y-2">
              <ExampleBlock label="Bad" variant="bad">
                &ldquo;John has a bad attitude and doesn&apos;t care about his work.&rdquo;
              </ExampleBlock>
              <ExampleBlock label="Good" variant="good">
                &ldquo;On March 3, John arrived 30 minutes late to the client presentation and did
                not have the requested data prepared. This is the second occurrence in 30 days.
                Expectation: arrive on time and prepare materials 24 hours in advance.&rdquo;
              </ExampleBlock>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 3 - Check-In Conversations */}
        <AccordionItem value="checkins" className="border-b-0 px-6">
          <AccordionTrigger className="py-5 text-base font-semibold">
            <span className="flex items-center">
              <SectionIcon icon={MessageSquare} />
              Effective Check-In Conversations
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-6 text-[13px] leading-relaxed text-muted-foreground">
            <p className="mb-3">
              <strong className="text-foreground">Preparation matters.</strong> Before every
              check-in, review the employee&apos;s active goals, recent performance notes, and
              any action items from the last conversation. Walking in prepared signals that you
              take their development seriously.
            </p>

            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground">
              Conversation Framework
            </h4>
            <ol className="mb-4 list-inside list-decimal space-y-1.5 pl-1">
              <li>
                <strong className="text-foreground">Start with recognition</strong> — acknowledge
                specific progress or effort since the last check-in.
              </li>
              <li>
                <strong className="text-foreground">Discuss progress</strong> — walk through active
                goals together and update status honestly.
              </li>
              <li>
                <strong className="text-foreground">Explore blockers</strong> — ask what is getting
                in the way and how you can help remove obstacles.
              </li>
              <li>
                <strong className="text-foreground">Agree on next steps</strong> — define 1-2
                concrete actions each party will take before the next meeting.
              </li>
            </ol>

            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground">
              Sample Questions
            </h4>
            <ul className="list-inside list-disc space-y-1 pl-1">
              <li>&ldquo;What accomplishment from the past two weeks are you most proud of?&rdquo;</li>
              <li>&ldquo;Which goal feels most on-track, and which feels stuck?&rdquo;</li>
              <li>&ldquo;Is there anything I can do differently to support you?&rdquo;</li>
              <li>&ldquo;What would make our next check-in even more useful?&rdquo;</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
