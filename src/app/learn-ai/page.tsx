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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const learningPaths = [
  {
    title: "HR Leader",
    description: "For VPs, Directors, and CHROs who need strategic AI literacy.",
    duration: "4 hours total",
    modules: 6,
    color: "bg-summit",
  },
  {
    title: "HR Operator",
    description:
      "For coordinators and specialists who will use Ascenta day-to-day.",
    duration: "6 hours total",
    modules: 10,
    color: "bg-deep-blue",
  },
  {
    title: "IT Admin",
    description:
      "For technical teams managing integrations, SSO, and API setup.",
    duration: "3 hours total",
    modules: 5,
    color: "bg-slate-700",
  },
];

const resources = [
  {
    title: "AI Fundamentals for HR",
    description:
      "Learn how AI transforms traditional HR workflows and decision-making. Covers key concepts without the jargon.",
    duration: "15 min read",
    type: "Article",
    level: "Beginner",
  },
  {
    title: "Building Your First Workflow",
    description:
      "Step-by-step guide to creating automated HR processes in Ascenta. Includes screenshots and common templates.",
    duration: "25 min",
    type: "Tutorial",
    level: "Beginner",
  },
  {
    title: "Data Privacy & AI Ethics",
    description:
      "Understanding responsible AI use in human resources. Covers bias, transparency, and GDPR implications.",
    duration: "20 min read",
    type: "Guide",
    level: "Intermediate",
  },
  {
    title: "Advanced Automation Patterns",
    description:
      "Master complex workflow designs for enterprise HR operations including conditional logic and multi-step approvals.",
    duration: "45 min",
    type: "Course",
    level: "Advanced",
  },
  {
    title: "Performance Review Automation",
    description:
      "Configure AI-assisted reviews, calibration workflows, and 360 feedback collection at scale.",
    duration: "30 min",
    type: "Tutorial",
    level: "Intermediate",
  },
  {
    title: "Compliance Workflow Masterclass",
    description:
      "Set up jurisdiction-specific compliance tracking, policy acknowledgments, and automated audit trails.",
    duration: "50 min",
    type: "Course",
    level: "Advanced",
  },
  {
    title: "Integrating with Your HRIS",
    description:
      "Connect BambooHR, Workday, ADP, and other systems to Ascenta for seamless data sync.",
    duration: "20 min",
    type: "Tutorial",
    level: "Intermediate",
  },
  {
    title: "Understanding AI Confidence Scores",
    description:
      "Learn how to interpret AI recommendation confidence levels and when to override automated suggestions.",
    duration: "10 min read",
    type: "Article",
    level: "Beginner",
  },
];

const faqs = [
  {
    question: "How does Ascenta's AI make decisions?",
    answer:
      "Ascenta's AI uses a combination of machine learning models and rule-based systems to provide recommendations. All final decisions remain in human hands – our AI guides and suggests, but you maintain full control over approvals and actions.",
  },
  {
    question: "Is my company's data used to train AI models?",
    answer:
      "No. Your data is never used to train our general AI models. We use your data solely to provide personalized recommendations within your organization, and it remains completely isolated from other customers.",
  },
  {
    question: "Can I customize how the AI behaves?",
    answer:
      "Absolutely. Ascenta provides extensive customization options including custom rules, approval thresholds, escalation paths, and communication templates that adapt the AI to your specific policies and culture.",
  },
  {
    question: "What happens if the AI makes a mistake?",
    answer:
      "All AI recommendations include confidence scores and reasoning. Our system is designed with multiple checkpoints and human review stages. If an error occurs, our audit logs make it easy to identify, correct, and prevent similar issues.",
  },
  {
    question: "How long does it take to see results?",
    answer:
      "Most teams see measurable improvements within the first 30 days. Onboarding automation often shows results immediately, while more complex workflows like compliance tracking typically reach full impact within 60-90 days.",
  },
  {
    question: "Do I need technical skills to use Ascenta?",
    answer:
      "Not at all. Ascenta is designed for HR professionals, not engineers. Our visual workflow builder uses drag-and-drop, and our AI assistant guides you through setup. Technical teams only get involved for advanced API integrations.",
  },
];

function getLevelColor(level: string) {
  switch (level) {
    case "Beginner":
      return "bg-green-100 text-green-700";
    case "Intermediate":
      return "bg-blue-100 text-blue-700";
    case "Advanced":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function LearnAIPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          badge="Learn AI"
          title="Master AI-Powered HR"
          description="Explore resources, tutorials, and best practices for leveraging artificial intelligence in your HR operations."
        />

        {/* Learning Paths */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-4 uppercase tracking-tight">
              Learning Paths
            </h2>
            <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto">
              Structured learning tracks designed for your role.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {learningPaths.map((path) => (
                <div
                  key={path.title}
                  className="rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className={`${path.color} px-6 py-4`}>
                    <h3 className="text-xl font-bold text-white">
                      {path.title} Path
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="text-slate-600 mb-4">{path.description}</p>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>{path.modules} modules</span>
                      <span>{path.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Resources */}
        <section className="py-20 bg-glacier">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-4 uppercase tracking-tight">
              Learning Resources
            </h2>
            <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto">
              From beginner guides to advanced courses, find the right resources
              for your journey.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {resources.map((resource) => (
                <Card
                  key={resource.title}
                  className="border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-summit uppercase tracking-wider">
                          {resource.type}
                        </span>
                        <Badge
                          className={`text-xs ${getLevelColor(resource.level)}`}
                        >
                          {resource.level}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-400">
                        {resource.duration}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold text-deep-blue">
                      {resource.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600">
                      {resource.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                variant="outline"
                className="border-deep-blue text-deep-blue hover:bg-deep-blue hover:text-white"
              >
                View All Resources
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-4 uppercase tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-center mb-12">
              Get answers to common questions about AI in HR.
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

        {/* CTA */}
        <section className="py-20 bg-deep-blue text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-display font-black mb-6 uppercase">
              Ready to Get Started?
            </h2>
            <p className="text-slate-300 mb-8 text-lg">
              Join our training program and become an AI-powered HR expert.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-summit hover:bg-summit-hover text-white px-8 py-6 h-auto text-lg font-black uppercase tracking-wide"
              >
                <Link href="/book-demo">Start Learning</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-6 h-auto text-lg font-bold"
              >
                <Link href="/product">Explore Product</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
