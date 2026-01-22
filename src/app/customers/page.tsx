import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
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

export default function CustomersPage() {
  return (
    <>
      <Navbar />
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

        {/* CTA */}
        <section className="py-20 bg-deep-blue text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-display font-black mb-6 uppercase">
              Join Our Growing Community
            </h2>
            <p className="text-slate-300 mb-8 text-lg">
              See why hundreds of companies trust Ascenta for their HR operations.
            </p>
            <Button
              asChild
              className="bg-summit hover:bg-summit-hover text-white px-10 py-6 h-auto text-lg font-black uppercase tracking-wide"
            >
              <Link href="/book-demo">Book a Demo</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
