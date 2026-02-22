import { PageHeader } from "@/components/page-header";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Badge,
} from "@ascenta/ui";
import Link from "next/link";

const testimonials = [
  {
    quote:
      "Ascenta reduced our onboarding time by 60%. What used to take two weeks now happens in days, with better documentation and happier new hires.",
    author: "Sarah Chen",
    role: "VP of People",
    company: "TechFlow Inc.",
    metric: "60%",
    metricLabel: "Faster Onboarding",
  },
  {
    quote:
      "The AI-powered recommendations have transformed how we handle employee relations. We catch issues before they escalate.",
    author: "Marcus Johnson",
    role: "HR Director",
    company: "Global Retail Co.",
    metric: "85%",
    metricLabel: "Issue Resolution Rate",
  },
  {
    quote:
      "Finally, an HR platform that actually understands compliance. Ascenta keeps us audit-ready without the manual overhead.",
    author: "Emily Rodriguez",
    role: "Chief People Officer",
    company: "FinServe Solutions",
    metric: "100%",
    metricLabel: "Audit Compliance",
  },
];

const logos = [
  "TechFlow",
  "GlobalRetail",
  "FinServe",
  "HealthPlus",
  "EduTech",
  "CloudNine",
  "DataDriven",
  "InnovateCo",
];

const stats = [
  { value: "500+", label: "Companies Trust Ascenta" },
  { value: "2M+", label: "Employees Managed" },
  { value: "98%", label: "Customer Satisfaction" },
  { value: "45%", label: "Average Time Saved" },
];

const caseStudies = [
  {
    company: "TechFlow Inc.",
    industry: "Technology",
    size: "850 employees",
    challenge:
      "Onboarding was taking 14+ days with scattered documents across email, Google Drive, and Slack. New hires reported feeling lost in their first week.",
    solution:
      "Implemented Ascenta's onboarding automation module with custom workflows for engineering, design, and sales roles.",
    results: [
      "Onboarding time reduced from 14 days to 5 days",
      "New hire satisfaction scores increased by 40%",
      "HR team reclaimed 20+ hours per week",
    ],
    quote:
      "The ROI was obvious within the first month. We couldn't go back to the old way if we tried.",
    author: "Sarah Chen, VP of People",
  },
  {
    company: "FinServe Solutions",
    industry: "Financial Services",
    size: "2,400 employees",
    challenge:
      "Maintaining compliance across 12 jurisdictions was a full-time job. Audit prep took weeks, and there was always anxiety about gaps.",
    solution:
      "Deployed Ascenta's compliance tracking and documentation module with jurisdiction-specific rule sets.",
    results: [
      "100% audit compliance maintained for 18 months",
      "Audit prep time reduced from 3 weeks to 2 days",
      "Zero compliance violations since deployment",
    ],
    quote:
      "We sleep better at night knowing Ascenta is watching for compliance gaps 24/7.",
    author: "Emily Rodriguez, Chief People Officer",
  },
  {
    company: "Global Retail Co.",
    industry: "Retail",
    size: "5,200 employees",
    challenge:
      "High turnover and employee relations issues were being caught too late. By the time HR got involved, situations had already escalated.",
    solution:
      "Used Ascenta's AI recommendation engine to surface early-warning signals from performance data and engagement surveys.",
    results: [
      "85% of potential issues caught before escalation",
      "Employee turnover reduced by 25%",
      "Manager satisfaction with HR support up 60%",
    ],
    quote:
      "Ascenta turned our HR team from reactive firefighters into proactive strategic partners.",
    author: "Marcus Johnson, HR Director",
  },
];

const industries = [
  "Technology",
  "Financial Services",
  "Healthcare",
  "Retail",
  "Education",
  "Manufacturing",
];

export default function CustomersPage() {
  return (
    <main>
        <PageHeader
          badge="Customers"
          title="Trusted by Industry Leaders"
          description="See how forward-thinking companies use Ascenta to transform their HR operations and empower their teams."
        />

        {/* Stats */}
        <section className="py-12 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl md:text-5xl font-black text-summit mb-2">
                    {stat.value}
                  </div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Logos */}
        <section className="py-12 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-slate-500 text-sm uppercase tracking-widest font-bold mb-8">
              Trusted By
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {logos.map((logo) => (
                <div
                  key={logo}
                  className="text-2xl font-display font-black text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industry Tags */}
        <section className="py-8 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-sm font-bold text-slate-500 mr-2">
                Industries we serve:
              </span>
              {industries.map((industry) => (
                <Badge
                  key={industry}
                  variant="outline"
                  className="px-4 py-1.5 text-sm border-slate-200 text-slate-600 hover:border-summit hover:text-summit transition-colors"
                >
                  {industry}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-glacier">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-4 uppercase tracking-tight">
              Customer Success Stories
            </h2>
            <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto">
              Real results from real HR teams.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card
                  key={testimonial.author}
                  className="border-slate-200 hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-0">
                    <div className="text-center mb-4">
                      <div className="text-4xl font-black text-summit">
                        {testimonial.metric}
                      </div>
                      <div className="text-sm text-slate-500 uppercase tracking-wide font-bold">
                        {testimonial.metricLabel}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="text-slate-600 italic mb-6 leading-relaxed">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>
                    <div className="border-t border-slate-100 pt-4">
                      <div className="font-bold text-deep-blue">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-slate-500">
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-4 uppercase tracking-tight">
              In-Depth Case Studies
            </h2>
            <p className="text-slate-500 text-center mb-16 max-w-2xl mx-auto">
              A closer look at how Ascenta drives measurable results.
            </p>

            <div className="space-y-16">
              {caseStudies.map((study) => (
                <div
                  key={study.company}
                  className="bg-glacier rounded-3xl p-8 md:p-12 border border-slate-100"
                >
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <h3 className="text-2xl font-black text-deep-blue">
                      {study.company}
                    </h3>
                    <Badge
                      variant="outline"
                      className="border-summit/30 text-summit"
                    >
                      {study.industry}
                    </Badge>
                    <span className="text-sm text-slate-500">
                      {study.size}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                        The Challenge
                      </h4>
                      <p className="text-slate-600 leading-relaxed">
                        {study.challenge}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                        The Solution
                      </h4>
                      <p className="text-slate-600 leading-relaxed">
                        {study.solution}
                      </p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                      Results
                    </h4>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {study.results.map((result) => (
                        <div
                          key={result}
                          className="bg-white rounded-xl p-4 border border-slate-200"
                        >
                          <p className="text-sm font-medium text-deep-blue">
                            {result}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <blockquote className="border-l-4 border-summit pl-6">
                    <p className="text-slate-600 italic mb-2">
                      &ldquo;{study.quote}&rdquo;
                    </p>
                    <cite className="text-sm font-bold text-deep-blue not-italic">
                      — {study.author}
                    </cite>
                  </blockquote>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-deep-blue text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-display font-black mb-6 uppercase">
              Join Our Growing Community
            </h2>
            <p className="text-slate-300 mb-8 text-lg">
              See why hundreds of companies trust Ascenta for their HR
              operations.
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
