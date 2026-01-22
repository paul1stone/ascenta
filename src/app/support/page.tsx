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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

const supportOptions = [
  {
    title: "Help Center",
    description: "Browse our knowledge base for answers to common questions.",
    icon: "📚",
    action: "Browse Articles",
    href: "/docs",
  },
  {
    title: "Community Forum",
    description: "Connect with other Ascenta users and share best practices.",
    icon: "👥",
    action: "Join Community",
    href: "#",
  },
  {
    title: "Live Chat",
    description: "Chat with our support team in real-time during business hours.",
    icon: "💬",
    action: "Start Chat",
    href: "#",
  },
  {
    title: "Submit a Ticket",
    description: "Create a support ticket for complex issues or feature requests.",
    icon: "🎫",
    action: "Create Ticket",
    href: "/contact",
  },
];

const faqs = [
  {
    question: "How do I reset my password?",
    answer:
      "Click the 'Forgot password?' link on the login page and enter your email address. We'll send you a secure link to reset your password.",
  },
  {
    question: "Can I export my data?",
    answer:
      "Yes! Go to Settings > Data Management > Export. You can export your data in CSV or JSON format at any time.",
  },
  {
    question: "How do I add a new team member?",
    answer:
      "Navigate to Settings > Team Members > Invite. Enter their email address and assign appropriate permissions.",
  },
  {
    question: "What browsers are supported?",
    answer:
      "Ascenta supports the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using Chrome.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "You can cancel your subscription from Settings > Billing > Manage Subscription. Your access will continue until the end of your billing period.",
  },
];

export default function SupportPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          badge="Summit Support"
          title="How Can We Help?"
          description="Get the support you need to make the most of Ascenta. Our team is here for you."
        />

        {/* Support Options */}
        <section className="py-20 bg-glacier">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportOptions.map((option) => (
                <Card
                  key={option.title}
                  className="border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1 text-center"
                >
                  <CardHeader>
                    <div className="text-5xl mb-4">{option.icon}</div>
                    <CardTitle className="text-lg font-bold text-deep-blue">
                      {option.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {option.description}
                    </CardDescription>
                    <Button
                      asChild
                      variant="outline"
                      className="border-summit text-summit hover:bg-summit hover:text-white"
                    >
                      <Link href={option.href}>{option.action}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-4 uppercase tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-center mb-12">
              Quick answers to common questions.
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

        {/* Contact CTA */}
        <section className="py-16 bg-deep-blue text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl font-display font-black mb-4 uppercase">
              Still Need Help?
            </h2>
            <p className="text-slate-300 mb-8">
              Our support team typically responds within 2 hours during business
              hours.
            </p>
            <Button
              asChild
              className="bg-summit hover:bg-summit-hover text-white px-10 py-6 h-auto font-black uppercase tracking-wide"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
