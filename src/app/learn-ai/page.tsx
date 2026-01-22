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

const resources = [
  {
    title: "AI Fundamentals for HR",
    description: "Learn how AI transforms traditional HR workflows and decision-making.",
    duration: "15 min read",
    type: "Article",
  },
  {
    title: "Building Your First Workflow",
    description: "Step-by-step guide to creating automated HR processes in Ascenta.",
    duration: "25 min",
    type: "Tutorial",
  },
  {
    title: "Data Privacy & AI Ethics",
    description: "Understanding responsible AI use in human resources.",
    duration: "20 min read",
    type: "Guide",
  },
  {
    title: "Advanced Automation Patterns",
    description: "Master complex workflow designs for enterprise HR operations.",
    duration: "45 min",
    type: "Course",
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
];

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

        {/* Learning Resources */}
        <section className="py-20 bg-glacier">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-4 uppercase tracking-tight">
              Learning Resources
            </h2>
            <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto">
              From beginner guides to advanced courses, find the right resources for
              your journey.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {resources.map((resource) => (
                <Card
                  key={resource.title}
                  className="border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-summit uppercase tracking-wider">
                        {resource.type}
                      </span>
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
