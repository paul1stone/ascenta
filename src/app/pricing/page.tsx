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
import { Badge } from "@/components/ui/badge";
import { CheckIcon } from "@/components/icons";
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
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-display font-black text-deep-blue mb-4 uppercase tracking-tight">
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
                <Link href="/learn-ai">Compare Features</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
