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

const responseTimes = [
  {
    plan: "Basecamp",
    email: "< 24 hours",
    chat: "Business hours",
    phone: "—",
  },
  {
    plan: "Summit",
    email: "< 4 hours",
    chat: "Priority queue",
    phone: "—",
  },
  {
    plan: "Expedition",
    email: "< 1 hour",
    chat: "Dedicated agent",
    phone: "24/7",
  },
];

const faqs = [
  {
    question: "How do I reset my password?",
    answer:
      "Click the 'Forgot password?' link on the login page and enter your email address. We'll send you a secure link to reset your password within minutes.",
  },
  {
    question: "Can I export my data?",
    answer:
      "Yes! Go to Settings > Data Management > Export. You can export your data in CSV or JSON format at any time. For bulk exports or custom formats, contact our support team.",
  },
  {
    question: "How do I add a new team member?",
    answer:
      "Navigate to Settings > Team Members > Invite. Enter their email address and assign appropriate permissions. They'll receive an invitation email with setup instructions.",
  },
  {
    question: "What browsers are supported?",
    answer:
      "Ascenta supports the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using Chrome. Mobile browsers are supported for read-only access.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "You can cancel your subscription from Settings > Billing > Manage Subscription. Your access will continue until the end of your billing period. We'll retain your data for 90 days in case you want to reactivate.",
  },
  {
    question: "Can I connect Ascenta to my existing HRIS?",
    answer:
      "Yes, Ascenta integrates with major HRIS platforms including BambooHR, Workday, ADP, and more. Go to Settings > Integrations to set up a connection, or contact support for custom integrations.",
  },
  {
    question: "How do I set up SSO for my organization?",
    answer:
      "SSO is available on the Expedition plan. Navigate to Settings > Security > SSO Configuration. We support SAML 2.0 and OIDC with providers like Okta, Azure AD, and Google Workspace. Our team can assist with setup.",
  },
  {
    question: "Where can I find my invoices?",
    answer:
      "All invoices are available at Settings > Billing > Invoice History. You can download individual invoices as PDFs or set up automatic email delivery to your finance team.",
  },
];

const statusItems = [
  { service: "Web Application", status: "Operational", color: "bg-green-500" },
  { service: "API", status: "Operational", color: "bg-green-500" },
  { service: "AI Engine", status: "Operational", color: "bg-green-500" },
  { service: "Integrations", status: "Operational", color: "bg-green-500" },
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

        {/* System Status */}
        <section className="py-6 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <span className="text-sm font-bold text-slate-500">
                System Status:
              </span>
              {statusItems.map((item) => (
                <div
                  key={item.service}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-slate-600">{item.service}</span>
                </div>
              ))}
              <span className="text-xs text-green-600 font-semibold">
                All systems operational
              </span>
            </div>
          </div>
        </section>

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

        {/* Response Times */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-4 uppercase tracking-tight">
              Support Response Times
            </h2>
            <p className="text-slate-500 text-center mb-12">
              Response times by plan. All times are business hours unless noted.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-4 px-4 text-sm font-bold text-slate-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-bold text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-bold text-slate-500 uppercase tracking-wider">
                      Live Chat
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-bold text-slate-500 uppercase tracking-wider">
                      Phone
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {responseTimes.map((row) => (
                    <tr
                      key={row.plan}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-4 px-4 font-bold text-deep-blue">
                        {row.plan}
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-slate-600">
                        {row.email}
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-slate-600">
                        {row.chat}
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-slate-600">
                        {row.phone}
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-summit hover:bg-summit-hover text-white px-10 py-6 h-auto font-black uppercase tracking-wide"
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-10 py-6 h-auto font-bold"
              >
                <Link href="/docs">Browse Docs</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
