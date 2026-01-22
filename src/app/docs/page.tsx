import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

const categories = [
  {
    title: "Getting Started",
    description: "Learn the basics and set up your first workflow.",
    icon: "🚀",
    articles: ["Quick Start Guide", "Account Setup", "Your First Workflow"],
  },
  {
    title: "Workflow Automation",
    description: "Master the art of creating powerful automated processes.",
    icon: "⚡",
    articles: ["Workflow Basics", "Triggers & Actions", "Conditional Logic"],
  },
  {
    title: "Integrations",
    description: "Connect Ascenta with your existing tools.",
    icon: "🔌",
    articles: ["Slack Integration", "HRIS Connections", "API Overview"],
  },
  {
    title: "Admin & Security",
    description: "Configure settings and manage your organization.",
    icon: "🔐",
    articles: ["User Management", "SSO Setup", "Audit Logs"],
  },
  {
    title: "AI Features",
    description: "Understand how our AI enhances your HR operations.",
    icon: "🤖",
    articles: ["AI Recommendations", "Smart Suggestions", "Training Your AI"],
  },
  {
    title: "API Reference",
    description: "Build custom integrations with our REST API.",
    icon: "📡",
    articles: ["Authentication", "Endpoints", "Webhooks"],
  },
];

export default function DocsPage() {
  return (
    <>
      <Navbar />
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

        {/* Categories */}
        <section className="py-20 bg-glacier">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        <section className="py-16 bg-white">
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
      <Footer />
    </>
  );
}
