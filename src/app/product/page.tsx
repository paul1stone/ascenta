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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function ProductPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          badge="The Product"
          title="Your Complete HR Command Center"
          description="Ascenta combines AI-powered automation with intuitive design to transform how your HR team operates."
        />

        {/* Features Grid */}
        <section className="py-20 bg-glacier">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="border-slate-200 hover:shadow-lg transition-shadow"
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

        {/* Product Tabs */}
        <section className="py-20 bg-white">
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
              <TabsContent value="onboarding" className="p-6 bg-slate-50 rounded-xl">
                <h3 className="text-xl font-bold text-deep-blue mb-4">
                  Streamlined Onboarding
                </h3>
                <p className="text-slate-600 mb-6">
                  Automate your entire onboarding process from offer letter to first
                  day. Our AI guides new hires through paperwork, training
                  schedules, and team introductions.
                </p>
                <Button className="bg-summit hover:bg-summit-hover text-white">
                  Learn More
                </Button>
              </TabsContent>
              <TabsContent value="performance" className="p-6 bg-slate-50 rounded-xl">
                <h3 className="text-xl font-bold text-deep-blue mb-4">
                  Performance Management
                </h3>
                <p className="text-slate-600 mb-6">
                  Set goals, track progress, and conduct reviews with AI-powered
                  insights. Get real-time visibility into team performance and
                  growth areas.
                </p>
                <Button className="bg-summit hover:bg-summit-hover text-white">
                  Learn More
                </Button>
              </TabsContent>
              <TabsContent value="compliance" className="p-6 bg-slate-50 rounded-xl">
                <h3 className="text-xl font-bold text-deep-blue mb-4">
                  Compliance & Documentation
                </h3>
                <p className="text-slate-600 mb-6">
                  Stay compliant with automated policy management, required training
                  tracking, and comprehensive audit logs for every HR action.
                </p>
                <Button className="bg-summit hover:bg-summit-hover text-white">
                  Learn More
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-deep-blue text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-display font-black mb-6 uppercase">
              Ready to Transform Your HR?
            </h2>
            <p className="text-slate-300 mb-8 text-lg">
              See how Ascenta can streamline your HR operations in a personalized
              demo.
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
