import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, CloseIcon } from "@/components/icons";
import Link from "next/link";

const plans = [
  {
    name: "Basecamp",
    price: "$49",
    period: "/user/month",
    description: "Perfect for small teams starting their HR automation journey.",
    features: [
      "Up to 50 employees",
      "Core HR workflows",
      "Basic onboarding automation",
      "Email support",
      "5 custom workflows",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Summit",
    price: "$99",
    period: "/user/month",
    description: "For growing companies that need advanced automation and insights.",
    features: [
      "Up to 500 employees",
      "Advanced AI recommendations",
      "Full workflow automation",
      "Priority support",
      "Unlimited custom workflows",
      "API access",
      "Custom integrations",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Expedition",
    price: "Custom",
    period: "",
    description: "Enterprise-grade solution with dedicated support and customization.",
    features: [
      "Unlimited employees",
      "White-glove onboarding",
      "Dedicated success manager",
      "24/7 phone support",
      "Custom AI training",
      "On-premise deployment option",
      "SLA guarantees",
      "Advanced security controls",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const comparisonFeatures = [
  { feature: "Employees", basecamp: "Up to 50", summit: "Up to 500", expedition: "Unlimited" },
  { feature: "Custom Workflows", basecamp: "5", summit: "Unlimited", expedition: "Unlimited" },
  { feature: "AI Recommendations", basecamp: false, summit: true, expedition: true },
  { feature: "Onboarding Automation", basecamp: "Basic", summit: "Advanced", expedition: "Custom" },
  { feature: "Performance Reviews", basecamp: false, summit: true, expedition: true },
  { feature: "Compliance Tracking", basecamp: false, summit: true, expedition: true },
  { feature: "API Access", basecamp: false, summit: true, expedition: true },
  { feature: "Custom Integrations", basecamp: false, summit: true, expedition: true },
  { feature: "SSO / SAML", basecamp: false, summit: false, expedition: true },
  { feature: "Dedicated Account Manager", basecamp: false, summit: false, expedition: true },
  { feature: "On-Premise Deployment", basecamp: false, summit: false, expedition: true },
  { feature: "Custom AI Training", basecamp: false, summit: false, expedition: true },
];

const faqs = [
  {
    question: "Is there a free trial?",
    answer:
      "Yes! All plans come with a 14-day free trial with full access to features. No credit card required to start.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle, and we'll prorate any differences.",
  },
  {
    question: "What happens when I hit my employee limit?",
    answer:
      "We'll notify you when you're approaching your limit and recommend an upgrade path. You won't lose access to any data—we'll work with you to find the right plan.",
  },
  {
    question: "Do you offer discounts for nonprofits or startups?",
    answer:
      "Yes, we offer special pricing for registered nonprofits and early-stage startups (under 2 years, less than $5M ARR). Contact our sales team to learn more.",
  },
  {
    question: "What's included in the Enterprise SLA?",
    answer:
      "Our Expedition plan includes a 99.99% uptime SLA, dedicated infrastructure, priority incident response, and quarterly business reviews with your success manager.",
  },
  {
    question: "How does billing work?",
    answer:
      "We offer both monthly and annual billing. Annual plans come with a 20% discount. All plans are billed per active user per month.",
  },
];

function ComparisonCell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <CheckIcon className="size-5 text-summit mx-auto" />
    ) : (
      <CloseIcon className="size-5 text-slate-300 mx-auto" />
    );
  }
  return <span className="text-sm font-medium text-slate-700">{value}</span>;
}

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          badge="Pricing"
          title="Simple, Transparent Pricing"
          description="Choose the plan that fits your team's needs. All plans include a 14-day free trial."
        />

        {/* Pricing Cards */}
        <section className="py-20 bg-glacier">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative flex flex-col ${
                    plan.popular
                      ? "border-summit shadow-xl scale-105 z-10"
                      : "border-slate-200"
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-summit text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-black text-deep-blue uppercase tracking-wide">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-4">
                      <span className="text-5xl font-black text-deep-blue">
                        {plan.price}
                      </span>
                      <span className="text-slate-500">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <CardDescription className="text-center mb-6 text-slate-600">
                      {plan.description}
                    </CardDescription>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-3 text-slate-700"
                        >
                          <CheckIcon className="size-5 text-summit flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      className={`w-full py-6 h-auto font-bold uppercase tracking-wide ${
                        plan.popular
                          ? "bg-summit hover:bg-summit-hover text-white"
                          : "bg-deep-blue hover:bg-slate-800 text-white"
                      }`}
                    >
                      <Link href="/book-demo">{plan.cta}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <p className="text-center text-slate-500 mt-8 text-sm">
              All prices in USD. Annual billing saves 20%.
            </p>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-4 uppercase tracking-tight">
              Compare Plans
            </h2>
            <p className="text-slate-500 text-center mb-12">
              A detailed look at what&apos;s included in each plan.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-4 px-4 text-sm font-bold text-slate-500 uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-bold text-slate-500 uppercase tracking-wider">
                      Basecamp
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-bold text-summit uppercase tracking-wider">
                      Summit
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-bold text-slate-500 uppercase tracking-wider">
                      Expedition
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-4 px-4 text-sm font-medium text-deep-blue">
                        {row.feature}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <ComparisonCell value={row.basecamp} />
                      </td>
                      <td className="py-4 px-4 text-center bg-summit/5">
                        <ComparisonCell value={row.summit} />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <ComparisonCell value={row.expedition} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-glacier">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-4 uppercase tracking-tight">
              Pricing FAQ
            </h2>
            <p className="text-slate-500 text-center mb-12">
              Answers to common questions about our plans and billing.
            </p>

            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-semibold text-deep-blue hover:text-summit">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Trust */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              {["SOC 2 Type II", "ISO 27001", "GDPR", "HIPAA Ready"].map(
                (cert) => (
                  <Badge
                    key={cert}
                    variant="outline"
                    className="px-4 py-2 text-sm border-slate-300 text-slate-600"
                  >
                    {cert}
                  </Badge>
                )
              )}
            </div>
            <h2 className="text-2xl font-display font-black text-deep-blue mb-4 uppercase tracking-tight">
              Questions About Pricing?
            </h2>
            <p className="text-slate-600 mb-8">
              Our team is happy to help you find the right plan for your
              organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-summit hover:bg-summit-hover text-white px-8 py-6 h-auto font-bold uppercase"
              >
                <Link href="/book-demo">Talk to Sales</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-deep-blue text-deep-blue hover:bg-deep-blue hover:text-white px-8 py-6 h-auto font-bold uppercase"
              >
                <Link href="/product">Compare Features</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
