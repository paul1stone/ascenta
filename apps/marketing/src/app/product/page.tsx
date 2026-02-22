import { PageHeader } from "@/components/page-header";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@ascenta/ui";
import { CheckIcon } from "@/components/icons";
import Link from "next/link";

const features = [
  {
    title: "Basecamp Guide",
    description:
      "Centralize your HR data in one unified platform. Our AI-powered system organizes and structures your information for maximum efficiency.",
    icon: "🏕️",
  },
  {
    title: "Workflow Maps",
    description:
      "Visual workflow automation that guides your team through complex HR processes with step-by-step precision.",
    icon: "🗺️",
  },
  {
    title: "Oxygen Integrations",
    description:
      "Seamlessly connect with your existing tools. From Slack to Salesforce, we integrate with the platforms you already use.",
    icon: "🔗",
  },
  {
    title: "Logbooks",
    description:
      "Complete audit trails and documentation for every HR action. Never lose track of decisions or communications.",
    icon: "📓",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Connect Your Data",
    description:
      "Import your existing HR data from spreadsheets, HRIS systems, or start fresh. Our migration wizard handles the heavy lifting.",
  },
  {
    step: "02",
    title: "Configure Workflows",
    description:
      "Use our visual workflow builder to create automated processes tailored to your organization's policies and culture.",
  },
  {
    step: "03",
    title: "Let AI Guide You",
    description:
      "Ascenta's AI monitors your workflows, surfaces recommendations, flags risks, and helps your team make better decisions faster.",
  },
];

const stats = [
  { value: "60%", label: "Faster Onboarding" },
  { value: "85%", label: "Less Admin Time" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "3x", label: "Team Productivity" },
];

const integrations = [
  "Slack",
  "Microsoft Teams",
  "Google Workspace",
  "Salesforce",
  "BambooHR",
  "Workday",
  "ADP",
  "Okta",
];

export default function ProductPage() {
  return (
    <main>
        <PageHeader
          badge="The Product"
          title="Your Complete HR Command Center"
          description="Ascenta combines AI-powered automation with intuitive design to transform how your HR team operates."
        />

        {/* Stats Bar */}
        <section className="py-10 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-summit mb-1">
                    {stat.value}
                  </div>
                  <div className="text-slate-500 text-sm font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-glacier">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-4 uppercase tracking-tight">
              Core Capabilities
            </h2>
            <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto">
              Four powerful modules that work together to give your HR team
              superpowers.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <CardTitle className="text-2xl font-black text-deep-blue">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-slate-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-4 uppercase tracking-tight">
              How It Works
            </h2>
            <p className="text-slate-500 text-center mb-16 max-w-2xl mx-auto">
              Getting started with Ascenta is simple. Three steps to transform
              your HR operations.
            </p>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector Line */}
              <div className="hidden md:block absolute top-12 left-[15%] w-[70%] h-0.5 border-t-2 border-dashed border-slate-200" />

              {howItWorks.map((item) => (
                <div key={item.step} className="text-center relative">
                  <div className="w-24 h-24 mx-auto mb-6 bg-deep-blue rounded-2xl flex items-center justify-center text-white font-display font-black text-3xl relative z-10">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-deep-blue mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Tabs */}
        <section className="py-20 bg-glacier">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-12 uppercase tracking-tight">
              Explore Our Modules
            </h2>

            <Tabs defaultValue="onboarding" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
              </TabsList>
              <TabsContent value="onboarding" className="p-8 bg-white rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-deep-blue mb-4">
                  Streamlined Onboarding
                </h3>
                <p className="text-slate-600 mb-6">
                  Automate your entire onboarding process from offer letter to
                  first day. Our AI guides new hires through paperwork, training
                  schedules, and team introductions.
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    "Automated offer letter generation and e-signatures",
                    "Personalized onboarding checklists per role",
                    "IT provisioning and access requests built in",
                    "30/60/90 day check-in scheduling",
                    "New hire feedback surveys and sentiment tracking",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-slate-700"
                    >
                      <CheckIcon className="size-5 text-summit flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="bg-summit hover:bg-summit-hover text-white"
                >
                  <Link href="/book-demo">See It in Action</Link>
                </Button>
              </TabsContent>
              <TabsContent value="performance" className="p-8 bg-white rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-deep-blue mb-4">
                  Performance Management
                </h3>
                <p className="text-slate-600 mb-6">
                  Set goals, track progress, and conduct reviews with AI-powered
                  insights. Get real-time visibility into team performance and
                  growth areas.
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    "OKR and goal-setting frameworks built in",
                    "Continuous feedback loops between managers and reports",
                    "AI-generated performance summaries and talking points",
                    "Calibration tools for fair, consistent reviews",
                    "Skills gap analysis and development recommendations",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-slate-700"
                    >
                      <CheckIcon className="size-5 text-summit flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="bg-summit hover:bg-summit-hover text-white"
                >
                  <Link href="/book-demo">See It in Action</Link>
                </Button>
              </TabsContent>
              <TabsContent value="compliance" className="p-8 bg-white rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-deep-blue mb-4">
                  Compliance & Documentation
                </h3>
                <p className="text-slate-600 mb-6">
                  Stay compliant with automated policy management, required
                  training tracking, and comprehensive audit logs for every HR
                  action.
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    "Auto-generated compliance checklists by jurisdiction",
                    "Policy acknowledgment tracking and reminders",
                    "Required training assignment and completion monitoring",
                    "Full audit trail for every HR action and decision",
                    "Regulatory change alerts and impact analysis",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-slate-700"
                    >
                      <CheckIcon className="size-5 text-summit flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="bg-summit hover:bg-summit-hover text-white"
                >
                  <Link href="/book-demo">See It in Action</Link>
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Integrations */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-display font-black text-deep-blue mb-4 uppercase tracking-tight">
              Connects With Your Stack
            </h2>
            <p className="text-slate-500 mb-12 max-w-2xl mx-auto">
              Ascenta plays well with the tools you already love. No rip and
              replace needed.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {integrations.map((name) => (
                <div
                  key={name}
                  className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl text-deep-blue font-bold hover:border-summit hover:shadow-md transition-all"
                >
                  {name}
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-slate-400">
              ...and 50+ more via our open API and webhook system.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-deep-blue text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-display font-black mb-6 uppercase">
              Ready to Transform Your HR?
            </h2>
            <p className="text-slate-300 mb-8 text-lg">
              See how Ascenta can streamline your HR operations in a
              personalized demo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-summit hover:bg-summit-hover text-white px-10 py-6 h-auto text-lg font-black uppercase tracking-wide"
              >
                <Link href="/book-demo">Book a Demo</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-10 py-6 h-auto text-lg font-bold"
              >
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
  );
}
