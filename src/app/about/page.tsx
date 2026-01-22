import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const values = [
  {
    title: "Human-First AI",
    description:
      "Technology should empower people, not replace them. Our AI enhances human decision-making while keeping control where it belongs.",
    icon: "🤝",
  },
  {
    title: "Radical Transparency",
    description:
      "From our pricing to our algorithms, we believe in openness. You'll always know how and why decisions are made.",
    icon: "🔍",
  },
  {
    title: "Security by Design",
    description:
      "HR data is sacred. We build security into every layer, never as an afterthought.",
    icon: "🛡️",
  },
  {
    title: "Continuous Improvement",
    description:
      "Like climbers pushing toward the summit, we're constantly learning and evolving to serve you better.",
    icon: "📈",
  },
];

const team = [
  { name: "Alex Rivera", role: "CEO & Co-founder", avatar: "AR" },
  { name: "Jordan Chen", role: "CTO & Co-founder", avatar: "JC" },
  { name: "Sam Williams", role: "VP of Product", avatar: "SW" },
  { name: "Morgan Taylor", role: "VP of Engineering", avatar: "MT" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          badge="About the Range"
          title="Our Mission"
          description="We're building the future of HR—where artificial intelligence and human insight work together to create thriving workplaces."
        />

        {/* Story */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg prose-slate mx-auto">
              <p className="text-xl text-slate-600 leading-relaxed">
                Ascenta was born from a simple observation: HR teams are drowning
                in administrative work while the strategic, human-centered work
                they love takes a backseat.
              </p>
              <p className="text-slate-600">
                Founded in 2022 by a team of HR leaders and AI engineers, we set
                out to build something different—a platform that doesn&apos;t just
                automate tasks but genuinely understands the complexity of human
                resources.
              </p>
              <p className="text-slate-600">
                Today, we serve hundreds of companies worldwide, helping them
                navigate the challenges of modern HR with confidence. Our name,
                Ascenta, reflects our belief that every organization can reach
                new heights when equipped with the right tools.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-glacier">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-12 uppercase tracking-tight">
              Our Values
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => (
                <div key={value.title} className="text-center">
                  <div className="text-5xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold text-deep-blue mb-3">
                    {value.title}
                  </h3>
                  <p className="text-slate-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-12 uppercase tracking-tight">
              Leadership Team
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {team.map((member) => (
                <div key={member.name} className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-deep-blue rounded-full flex items-center justify-center text-white font-display font-black text-2xl">
                    {member.avatar}
                  </div>
                  <h3 className="font-bold text-deep-blue">{member.name}</h3>
                  <p className="text-slate-500 text-sm">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-deep-blue text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-display font-black mb-6 uppercase">
              Join Our Expedition
            </h2>
            <p className="text-slate-300 mb-8 text-lg">
              We&apos;re always looking for passionate people to join our team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-summit hover:bg-summit-hover text-white px-8 py-6 h-auto font-black uppercase tracking-wide"
              >
                <Link href="/book-demo">View Open Positions</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-6 h-auto font-bold"
              >
                <Link href="/customers">Our Story</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
