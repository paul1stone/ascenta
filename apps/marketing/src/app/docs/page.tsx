import { PageHeader } from "@/components/page-header";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ascenta/ui";
import Link from "next/link";

const quickStart = [
  "Create your account and configure your organization settings",
  "Import your employee data (CSV, API, or manual entry)",
  "Set up your first automated workflow using our templates",
  "Invite your team members and assign permissions",
  "Connect your existing tools via the Integrations page",
];

const categories = [
  {
    title: "Getting Started",
    description: "Learn the basics and set up your first workflow.",
    icon: "🚀",
    articles: ["Quick Start Guide", "Account Setup", "Your First Workflow", "Importing Data"],
  },
  {
    title: "Workflow Automation",
    description: "Master the art of creating powerful automated processes.",
    icon: "⚡",
    articles: ["Workflow Basics", "Triggers & Actions", "Conditional Logic", "Templates Library"],
  },
  {
    title: "Integrations",
    description: "Connect Ascenta with your existing tools.",
    icon: "🔌",
    articles: ["Slack Integration", "HRIS Connections", "API Overview", "Webhook Setup"],
  },
  {
    title: "Admin & Security",
    description: "Configure settings and manage your organization.",
    icon: "🔐",
    articles: ["User Management", "SSO Setup", "Audit Logs", "Data Export"],
  },
  {
    title: "AI Features",
    description: "Understand how our AI enhances your HR operations.",
    icon: "🤖",
    articles: ["AI Recommendations", "Smart Suggestions", "Training Your AI", "Confidence Scores"],
  },
  {
    title: "API Reference",
    description: "Build custom integrations with our REST API.",
    icon: "📡",
    articles: ["Authentication", "Endpoints", "Webhooks", "Rate Limits"],
  },
  {
    title: "Compliance",
    description: "Set up compliance tracking and audit-ready documentation.",
    icon: "📋",
    articles: ["Jurisdiction Rules", "Policy Tracking", "Audit Trail", "Regulatory Alerts"],
  },
  {
    title: "Reporting & Analytics",
    description: "Get insights from your HR data with dashboards and exports.",
    icon: "📊",
    articles: ["Dashboard Overview", "Custom Reports", "Data Visualization", "Scheduled Exports"],
  },
];

const popularArticles = [
  { title: "Quick Start Guide", category: "Getting Started", readTime: "5 min" },
  { title: "Setting Up Onboarding Workflows", category: "Workflow Automation", readTime: "8 min" },
  { title: "Connecting Slack & Teams", category: "Integrations", readTime: "4 min" },
  { title: "Understanding AI Recommendations", category: "AI Features", readTime: "6 min" },
  { title: "Configuring SSO with Okta", category: "Admin & Security", readTime: "10 min" },
  { title: "API Authentication Guide", category: "API Reference", readTime: "7 min" },
];

export default function DocsPage() {
  return (
    <main>
        <PageHeader
          badge="Documentation"
          title="Maps & APIs"
          description="Everything you need to know about using Ascenta. From getting started guides to advanced API documentation."
        />

        {/* Search */}
        <section className="py-8 bg-white border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search documentation..."
                className="w-full h-14 px-6 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-lg focus:outline-none focus:ring-2 focus:ring-summit focus:border-transparent"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                ⌘K
              </span>
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-deep-blue text-white rounded-3xl p-8 md:p-12">
              <h2 className="text-2xl font-display font-black mb-2 uppercase">
                Quick Start Guide
              </h2>
              <p className="text-slate-300 mb-8">
                Get up and running with Ascenta in under 30 minutes.
              </p>
              <ol className="space-y-4">
                {quickStart.map((step, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-full bg-summit flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-slate-200 pt-1">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-8">
                <Button className="bg-summit hover:bg-summit-hover text-white font-bold uppercase">
                  Start the Tutorial
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Articles */}
        <section className="py-16 bg-glacier border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-display font-black text-deep-blue mb-8 uppercase tracking-tight">
              Popular Articles
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularArticles.map((article) => (
                <a
                  key={article.title}
                  href="#"
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-summit hover:shadow-md transition-all group"
                >
                  <div>
                    <h3 className="font-semibold text-deep-blue group-hover:text-summit transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {article.category}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                    {article.readTime}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-4 uppercase tracking-tight">
              Browse by Category
            </h2>
            <p className="text-slate-500 text-center mb-12">
              Find what you need organized by topic.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map((category) => (
                <Card
                  key={category.title}
                  className="border-slate-200 hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <CardTitle className="text-xl font-bold text-deep-blue">
                      {category.title}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.articles.map((article) => (
                        <li key={article}>
                          <a
                            href="#"
                            className="text-summit hover:text-summit-hover hover:underline text-sm font-medium"
                          >
                            {article}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Help CTA */}
        <section className="py-16 bg-glacier">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-display font-black text-deep-blue mb-4 uppercase">
              Can&apos;t Find What You Need?
            </h2>
            <p className="text-slate-600 mb-8">
              Our support team is here to help you get the most out of Ascenta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-summit hover:bg-summit-hover text-white font-bold uppercase"
              >
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-deep-blue text-deep-blue hover:bg-deep-blue hover:text-white font-bold uppercase"
              >
                <Link href="/learn-ai">View Tutorials</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
  );
}
