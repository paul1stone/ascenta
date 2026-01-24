"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  TrendingUp,
  Search,
  Clock,
  Users,
  Shield,
  FileText,
  Calendar,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { WorkflowListItem, WorkflowCategory, RiskLevel } from "@/lib/workflows/types";

// Icon mapping for workflows
const categoryIcons: Record<WorkflowCategory, React.ReactNode> = {
  corrective: <AlertTriangle className="size-5" />,
  performance: <TrendingUp className="size-5" />,
  investigation: <Search className="size-5" />,
  scheduling: <Calendar className="size-5" />,
  compliance: <Shield className="size-5" />,
  communication: <FileText className="size-5" />,
};

const riskColors: Record<RiskLevel, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const audienceLabels: Record<string, string> = {
  manager: "Managers",
  hr: "HR Team",
  hr_only: "HR Only",
};

const categoryLabels: Record<WorkflowCategory, string> = {
  corrective: "Corrective Action",
  performance: "Performance",
  investigation: "Investigation",
  scheduling: "Scheduling",
  compliance: "Compliance",
  communication: "Communication",
};

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    async function loadWorkflows() {
      try {
        const res = await fetch("/api/workflows");
        const data = await res.json();
        setWorkflows(data.workflows || []);
      } catch (error) {
        console.error("Failed to load workflows:", error);
      } finally {
        setLoading(false);
      }
    }

    loadWorkflows();
  }, []);

  // Filter workflows based on search and category
  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch =
      searchQuery === "" ||
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || workflow.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Get unique categories from workflows
  const categories = Array.from(new Set(workflows.map((w) => w.category)));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-glacier">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-summit" />
          <p className="text-muted-foreground">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-glacier">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-deep-blue">
                HR Workflows
              </h1>
              <p className="mt-1 text-muted-foreground">
                Guided workflows for compliant, standardized HR documentation
              </p>
            </div>
            <Link href="/chat">
              <Button variant="outline">
                <FileText className="mr-2 size-4" />
                Back to Chat
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search and Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="mb-8"
        >
          <TabsList className="bg-white">
            <TabsTrigger value="all">All Workflows</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {categoryLabels[category as WorkflowCategory] || category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {filteredWorkflows.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-white p-12 text-center">
                <Search className="mx-auto size-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-display font-semibold text-deep-blue">
                  No workflows found
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "No workflows available in this category"}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredWorkflows.map((workflow) => (
                  <WorkflowCard key={workflow.id} workflow={workflow} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="mt-12 rounded-lg border bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-deep-blue">
            How Workflows Work
          </h2>
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-summit/10 p-2">
                <FileText className="size-5 text-summit" />
              </div>
              <div>
                <h3 className="font-medium text-deep-blue">Guided Input</h3>
                <p className="text-sm text-muted-foreground">
                  Answer structured questions to capture all required information
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-summit/10 p-2">
                <Shield className="size-5 text-summit" />
              </div>
              <div>
                <h3 className="font-medium text-deep-blue">Guardrails</h3>
                <p className="text-sm text-muted-foreground">
                  Automatic compliance checks and risk detection
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-summit/10 p-2">
                <Clock className="size-5 text-summit" />
              </div>
              <div>
                <h3 className="font-medium text-deep-blue">Audit Trail</h3>
                <p className="text-sm text-muted-foreground">
                  Complete documentation for compliance and legal defense
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function WorkflowCard({ workflow }: { workflow: WorkflowListItem }) {
  return (
    <Link href={`/workflows/${workflow.slug}`}>
      <Card className="group h-full cursor-pointer transition-all hover:border-summit/50 hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="rounded-lg bg-summit/10 p-2 text-summit">
              {categoryIcons[workflow.category]}
            </div>
            <div className="flex gap-2">
              <Badge
                variant="secondary"
                className={riskColors[workflow.riskLevel]}
              >
                {workflow.riskLevel}
              </Badge>
            </div>
          </div>
          <CardTitle className="mt-4 font-display text-deep-blue group-hover:text-summit">
            {workflow.name}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {workflow.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-muted-foreground">
              {workflow.estimatedMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {workflow.estimatedMinutes} min
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="size-3.5" />
                {audienceLabels[workflow.audience] || workflow.audience}
              </span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-summit" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
