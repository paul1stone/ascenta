"use client";

import { useState } from "react";
import { Button } from "@ascenta/ui/button";
import { ScrollArea } from "@ascenta/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@ascenta/ui/collapsible";
import { ToggleGroup, ToggleGroupItem } from "@ascenta/ui/toggle-group";
import {
  BookOpen,
  ChevronRight,
  Database,
  FileText,
  FolderOpen,
  Plus,
  Share2,
  Building2,
  Sparkles,
  Users,
  File,
} from "lucide-react";
import { cn } from "@ascenta/ui";

type ResourceMode = "prompts" | "knowledge";

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}

function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
  count,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-glacier hover:text-deep-blue transition-colors">
        <ChevronRight
          className={cn(
            "size-4 transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
        {icon}
        <span className="flex-1 text-left">{title}</span>
        {count !== undefined && (
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-9 pr-2 py-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

interface ResourceItemProps {
  icon: React.ReactNode;
  name: string;
  description?: string;
  onClick?: () => void;
}

function ResourceItem({ icon, name, description, onClick }: ResourceItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-glacier transition-colors group"
    >
      <span className="mt-0.5 text-muted-foreground group-hover:text-summit">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-deep-blue truncate">{name}</p>
        {description && (
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        )}
      </div>
    </button>
  );
}

export function ResourceSidebar() {
  const [mode, setMode] = useState<ResourceMode>("prompts");

  return (
    <div className="flex h-full w-80 flex-col border-l bg-white overflow-hidden">
      {/* Header with Toggle */}
      <div className="border-b p-3">
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(value) => value && setMode(value as ResourceMode)}
          className="w-full bg-glacier/50 rounded-lg p-1"
        >
          <ToggleGroupItem
            value="prompts"
            className={cn(
              "flex-1 gap-1.5 rounded-md text-xs font-medium transition-all",
              "data-[state=on]:bg-white data-[state=on]:text-deep-blue data-[state=on]:shadow-sm",
              "data-[state=off]:text-muted-foreground data-[state=off]:hover:text-deep-blue"
            )}
          >
            <BookOpen className="size-3.5" />
            Prompt Library
          </ToggleGroupItem>
          <ToggleGroupItem
            value="knowledge"
            className={cn(
              "flex-1 gap-1.5 rounded-md text-xs font-medium transition-all",
              "data-[state=on]:bg-white data-[state=on]:text-deep-blue data-[state=on]:shadow-sm",
              "data-[state=off]:text-muted-foreground data-[state=off]:hover:text-deep-blue"
            )}
          >
            <Database className="size-3.5" />
            Knowledge Base
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Content - independently scrollable */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="pb-4">
          {mode === "prompts" ? (
            <PromptLibraryContent />
          ) : (
            <KnowledgeBaseContent />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function PromptLibraryContent() {
  return (
    <div className="p-2 space-y-1">
      {/* Add Prompt Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2 mb-3 border-dashed border-summit/30 text-summit hover:bg-summit/5 hover:text-summit hover:border-summit"
      >
        <Plus className="size-4" />
        Save Current Prompt
      </Button>

      {/* My Prompts */}
      <CollapsibleSection
        title="My Prompts"
        icon={<FileText className="size-4" />}
        defaultOpen={true}
        count={3}
      >
        <div className="space-y-0.5">
          <ResourceItem
            icon={<FileText className="size-3.5" />}
            name="Policy Draft Template"
            description="HR policy structure"
          />
          <ResourceItem
            icon={<FileText className="size-3.5" />}
            name="Performance Review"
            description="Annual review template"
          />
          <ResourceItem
            icon={<FileText className="size-3.5" />}
            name="Onboarding Checklist"
            description="New hire guide"
          />
        </div>
      </CollapsibleSection>

      {/* Shared with me */}
      <CollapsibleSection
        title="Shared with me"
        icon={<Share2 className="size-4" />}
        count={2}
      >
        <div className="space-y-0.5">
          <ResourceItem
            icon={<FileText className="size-3.5" />}
            name="Team Meeting Agenda"
            description="From Sarah K."
          />
          <ResourceItem
            icon={<FileText className="size-3.5" />}
            name="Interview Questions"
            description="From Mike L."
          />
        </div>
      </CollapsibleSection>

      {/* Organization Prompts */}
      <CollapsibleSection
        title="Organization Prompts"
        icon={<Building2 className="size-4" />}
        count={5}
      >
        <div className="space-y-0.5">
          <ResourceItem
            icon={<FileText className="size-3.5" />}
            name="Company Values Statement"
            description="Official template"
          />
          <ResourceItem
            icon={<FileText className="size-3.5" />}
            name="Benefits Explanation"
            description="2024 benefits"
          />
          <ResourceItem
            icon={<FileText className="size-3.5" />}
            name="PTO Policy Summary"
            description="Quick reference"
          />
          <ResourceItem
            icon={<FileText className="size-3.5" />}
            name="Remote Work Guidelines"
            description="Hybrid policy"
          />
          <ResourceItem
            icon={<FileText className="size-3.5" />}
            name="Expense Reporting"
            description="Reimbursement guide"
          />
        </div>
      </CollapsibleSection>

      {/* Ascenta Prompts */}
      <CollapsibleSection
        title="Ascenta Prompts"
        icon={<Sparkles className="size-4 text-summit" />}
        count={8}
      >
        <div className="space-y-0.5">
          <ResourceItem
            icon={<FileText className="size-3.5" />}
            name="FMLA Eligibility Check"
            description="Compliance assistant"
          />
          <ResourceItem
            icon={<FileText className="size-3.5" />}
            name="Job Description Writer"
            description="Role definition helper"
          />
          <ResourceItem
            icon={<FileText className="size-3.5" />}
            name="Salary Benchmarking"
            description="Compensation analysis"
          />
          <ResourceItem
            icon={<FileText className="size-3.5" />}
            name="Employee Handbook Draft"
            description="Policy compilation"
          />
          <ResourceItem
            icon={<FileText className="size-3.5" />}
            name="Exit Interview Guide"
            description="Offboarding template"
          />
          <ResourceItem
            icon={<FileText className="size-3.5" />}
            name="Training Plan Builder"
            description="L&D framework"
          />
          <ResourceItem
            icon={<FileText className="size-3.5" />}
            name="Conflict Resolution"
            description="Mediation guide"
          />
          <ResourceItem
            icon={<FileText className="size-3.5" />}
            name="DEI Initiative Planner"
            description="Inclusion strategies"
          />
        </div>
      </CollapsibleSection>
    </div>
  );
}

function KnowledgeBaseContent() {
  return (
    <div className="p-2 space-y-1">
      {/* Upload Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2 mb-3 border-dashed border-summit/30 text-summit hover:bg-summit/5 hover:text-summit hover:border-summit"
      >
        <Plus className="size-4" />
        Upload Document
      </Button>

      {/* My Files */}
      <CollapsibleSection
        title="My Files"
        icon={<FolderOpen className="size-4" />}
        defaultOpen={true}
        count={4}
      >
        <div className="space-y-0.5">
          <ResourceItem
            icon={<File className="size-3.5" />}
            name="Q4 Performance Notes.pdf"
            description="Last modified 2 days ago"
          />
          <ResourceItem
            icon={<File className="size-3.5" />}
            name="Hiring Plan 2024.xlsx"
            description="Last modified 1 week ago"
          />
          <ResourceItem
            icon={<File className="size-3.5" />}
            name="Team Structure.docx"
            description="Last modified 3 weeks ago"
          />
          <ResourceItem
            icon={<File className="size-3.5" />}
            name="Training Feedback.csv"
            description="Last modified 1 month ago"
          />
        </div>
      </CollapsibleSection>

      {/* Shared with me */}
      <CollapsibleSection
        title="Shared with me"
        icon={<Users className="size-4" />}
        count={3}
      >
        <div className="space-y-0.5">
          <ResourceItem
            icon={<File className="size-3.5" />}
            name="Benefits Guide 2024.pdf"
            description="From HR Team"
          />
          <ResourceItem
            icon={<File className="size-3.5" />}
            name="Org Chart Q4.pptx"
            description="From Leadership"
          />
          <ResourceItem
            icon={<File className="size-3.5" />}
            name="Salary Bands.xlsx"
            description="From Finance"
          />
        </div>
      </CollapsibleSection>

      {/* Organization Files */}
      <CollapsibleSection
        title="Organization Files"
        icon={<Building2 className="size-4" />}
        count={6}
      >
        <div className="space-y-0.5">
          <ResourceItem
            icon={<File className="size-3.5" />}
            name="Employee Handbook v3.2.pdf"
            description="Official policy"
          />
          <ResourceItem
            icon={<File className="size-3.5" />}
            name="Code of Conduct.pdf"
            description="Compliance document"
          />
          <ResourceItem
            icon={<File className="size-3.5" />}
            name="PTO Policy.pdf"
            description="Leave guidelines"
          />
          <ResourceItem
            icon={<File className="size-3.5" />}
            name="Remote Work Agreement.pdf"
            description="WFH terms"
          />
          <ResourceItem
            icon={<File className="size-3.5" />}
            name="Expense Policy.pdf"
            description="Reimbursement rules"
          />
          <ResourceItem
            icon={<File className="size-3.5" />}
            name="IT Security Guidelines.pdf"
            description="Tech compliance"
          />
        </div>
      </CollapsibleSection>
    </div>
  );
}
