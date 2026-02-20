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
  {
    name: "Alex Rivera",
    role: "CEO & Co-founder",
    avatar: "AR",
    bio: "Former VP of People at a Fortune 500. Passionate about making HR strategic, not administrative.",
  },
  {
    name: "Jordan Chen",
    role: "CTO & Co-founder",
    avatar: "JC",
    bio: "Ex-Google ML engineer. Built recommendation systems at scale before turning to HR tech.",
  },
  {
    name: "Sam Williams",
    role: "VP of Product",
    avatar: "SW",
    bio: "Product leader with 15 years in enterprise SaaS. Believes the best tools are invisible.",
  },
  {
    name: "Morgan Taylor",
    role: "VP of Engineering",
    avatar: "MT",
    bio: "Infrastructure expert who led platform engineering teams at Stripe and Datadog.",
  },
  {
    name: "Priya Patel",
    role: "Head of AI",
    avatar: "PP",
    bio: "PhD in NLP from Stanford. Pioneered responsible AI practices in HR applications.",
  },
  {
    name: "Derek Olson",
    role: "Head of Customer Success",
    avatar: "DO",
    bio: "Built support orgs from 0 to 50 at two unicorn startups. Customer obsessed.",
  },
];

const milestones = [
  { year: "2022", event: "Founded in San Francisco by Alex & Jordan" },
  { year: "2022", event: "Seed funding of $4M from Baseline Ventures" },
  { year: "2023", event: "Launch of v1.0 with first 50 customers" },
  { year: "2023", event: "Series A of $18M led by Elevation Partners" },
  { year: "2024", event: "500+ companies on the platform, SOC 2 certified" },
  { year: "2025", event: "2M+ employees managed, Series B of $45M" },
];

const stats = [
  { value: "85+", label: "Team Members" },
  { value: "12", label: "Countries Represented" },
  { value: "500+", label: "Customers Worldwide" },
  { value: "4.9/5", label: "Glassdoor Rating" },
];

export default function AboutPage() {
  return (
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
              <p className="text-slate-600">
                We&apos;re not building another HRIS. We&apos;re building the
                intelligent layer that sits on top of your people operations—
                guiding decisions, automating the mundane, and freeing your HR
                team to focus on what actually matters: your people.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-glacier border-y border-slate-200">
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

        {/* Values */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-4 uppercase tracking-tight">
              Our Values
            </h2>
            <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto">
              These aren&apos;t just words on a wall. They guide every product
              decision, every hire, and every customer interaction.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="text-center p-6 rounded-2xl bg-glacier border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="text-5xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold text-deep-blue mb-3">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 bg-glacier">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-4 uppercase tracking-tight">
              Our Journey
            </h2>
            <p className="text-slate-500 text-center mb-12">
              Key milestones on our path to the summit.
            </p>

            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200" />

              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-start gap-6 relative">
                    <div className="w-16 flex-shrink-0 text-right">
                      <span className="text-sm font-black text-summit">
                        {milestone.year}
                      </span>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-summit border-4 border-white shadow-sm flex-shrink-0 mt-0.5 relative z-10" />
                    <p className="text-slate-700 font-medium pb-2">
                      {milestone.event}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-4 uppercase tracking-tight">
              Leadership Team
            </h2>
            <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto">
              Experienced operators and builders who&apos;ve been in your shoes.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {team.map((member) => (
                <div
                  key={member.name}
                  className="text-center p-6 rounded-2xl hover:bg-glacier transition-colors"
                >
                  <div className="w-20 h-20 mx-auto mb-4 bg-deep-blue rounded-full flex items-center justify-center text-white font-display font-black text-xl">
                    {member.avatar}
                  </div>
                  <h3 className="font-bold text-deep-blue">{member.name}</h3>
                  <p className="text-summit text-sm font-semibold mb-2">
                    {member.role}
                  </p>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {member.bio}
                  </p>
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
              Come build the future of HR with us.
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
                <Link href="/customers">Customer Stories</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
  );
}
