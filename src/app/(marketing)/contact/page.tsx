import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const contactMethods = [
  {
    title: "Sales",
    description: "Talk to our team about pricing and plans.",
    email: "sales@ascenta.ai",
    icon: "💼",
  },
  {
    title: "Support",
    description: "Get help with your account or technical issues.",
    email: "support@ascenta.ai",
    icon: "🛟",
  },
  {
    title: "Partnerships",
    description: "Explore integration and partnership opportunities.",
    email: "partners@ascenta.ai",
    icon: "🤝",
  },
];

const offices = [
  {
    city: "San Francisco",
    address: "548 Market Street, Suite 300",
    region: "HQ — Americas",
  },
  {
    city: "London",
    address: "71 Beak Street, Soho",
    region: "EMEA",
  },
  {
    city: "Singapore",
    address: "1 Raffles Place, Tower 2",
    region: "APAC",
  },
];

export default function ContactPage() {
  return (
    <main>
        <PageHeader
          badge="SOS Contact"
          title="Get in Touch"
          description="Have questions? We're here to help. Reach out to our team and we'll respond within 24 hours."
        />

        <section className="py-20 bg-glacier">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Methods */}
              <div>
                <h2 className="text-2xl font-display font-black text-deep-blue mb-8 uppercase">
                  Contact Options
                </h2>
                <div className="space-y-6">
                  {contactMethods.map((method) => (
                    <Card key={method.title} className="border-slate-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{method.icon}</span>
                          <CardTitle className="text-lg font-bold text-deep-blue">
                            {method.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-2">
                          {method.description}
                        </CardDescription>
                        <a
                          href={`mailto:${method.email}`}
                          className="text-summit hover:text-summit-hover font-semibold"
                        >
                          {method.email}
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-10 p-6 bg-deep-blue text-white rounded-2xl">
                  <h3 className="text-lg font-bold mb-2">Emergency Support</h3>
                  <p className="text-slate-300 mb-4">
                    For urgent issues affecting your production environment,
                    Enterprise customers can reach our 24/7 support line.
                  </p>
                  <p className="font-mono text-summit">+1 (888) ASCENTA</p>
                </div>
              </div>

              {/* Contact Form */}
              <Card className="border-slate-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-deep-blue">
                    Send Us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form and we&apos;ll get back to you shortly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" className="h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" className="h-11" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <select
                        id="subject"
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Select a topic...</option>
                        <option value="sales">Sales Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="billing">Billing Question</option>
                        <option value="partnership">Partnership</option>
                        <option value="security">Security Question</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <textarea
                        id="message"
                        rows={5}
                        placeholder="Tell us how we can help..."
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-summit hover:bg-summit-hover text-white font-bold uppercase tracking-wide"
                    >
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Offices */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-display font-black text-deep-blue text-center mb-10 uppercase tracking-tight">
              Our Offices
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {offices.map((office) => (
                <div
                  key={office.city}
                  className="text-center p-6 rounded-2xl bg-glacier border border-slate-100"
                >
                  <p className="text-xs font-bold text-summit uppercase tracking-widest mb-2">
                    {office.region}
                  </p>
                  <h3 className="text-xl font-bold text-deep-blue mb-2">
                    {office.city}
                  </h3>
                  <p className="text-slate-500 text-sm">{office.address}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
  );
}
