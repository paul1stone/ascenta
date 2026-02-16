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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckIcon } from "@/components/icons";

const benefits = [
  "Personalized product walkthrough",
  "See AI features in action with your use cases",
  "Get pricing tailored to your needs",
  "Q&A with HR technology experts",
  "No commitment required",
];

const nextSteps = [
  {
    step: "1",
    title: "Book a Time",
    description: "Pick a 30-minute slot that works for you.",
  },
  {
    step: "2",
    title: "Meet Your Guide",
    description: "A product expert will tailor the demo to your needs.",
  },
  {
    step: "3",
    title: "See the Summit",
    description: "Experience how Ascenta can transform your HR operations.",
  },
];

const testimonials = [
  {
    quote:
      "The demo was incredibly insightful. Within 30 minutes, I understood exactly how Ascenta could solve our biggest HR challenges.",
    author: "Jennifer Davis",
    role: "HR Director, TechStart Inc.",
    initials: "JD",
  },
  {
    quote:
      "I've sat through dozens of HR tool demos. Ascenta was the only one that felt like it was built by people who actually understand HR.",
    author: "Robert Kim",
    role: "Chief People Officer, ScaleUp Co.",
    initials: "RK",
  },
];

export default function BookDemoPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          badge="Book a Demo"
          title="See Ascenta in Action"
          description="Schedule a personalized demo with our team and discover how AI can transform your HR operations."
        />

        <section className="py-20 bg-glacier">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Benefits */}
              <div>
                <h2 className="text-2xl font-display font-black text-deep-blue mb-6 uppercase">
                  What to Expect
                </h2>
                <ul className="space-y-4 mb-10">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <div className="bg-summit/10 rounded-full p-1">
                        <CheckIcon className="size-5 text-summit" />
                      </div>
                      <span className="text-slate-700 font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* What Happens Next */}
                <div className="mb-10">
                  <h3 className="text-lg font-bold text-deep-blue mb-6">
                    How It Works
                  </h3>
                  <div className="space-y-6">
                    {nextSteps.map((item) => (
                      <div key={item.step} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-deep-blue flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-bold text-deep-blue">
                            {item.title}
                          </h4>
                          <p className="text-slate-500 text-sm">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testimonials */}
                <div className="space-y-6">
                  {testimonials.map((testimonial) => (
                    <div
                      key={testimonial.author}
                      className="bg-deep-blue text-white rounded-2xl p-6"
                    >
                      <p className="text-sm leading-relaxed mb-4 text-slate-200">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-summit/20 rounded-full flex items-center justify-center text-summit font-bold text-sm">
                          {testimonial.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">
                            {testimonial.author}
                          </div>
                          <div className="text-slate-400 text-xs">
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form */}
              <Card className="border-slate-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-deep-blue">
                    Request Your Demo
                  </CardTitle>
                  <CardDescription>
                    Fill out the form and we&apos;ll be in touch within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workEmail">Work Email</Label>
                      <Input
                        id="workEmail"
                        type="email"
                        placeholder="john@company.com"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        placeholder="Acme Inc."
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Your Role</Label>
                      <select
                        id="role"
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Select...</option>
                        <option value="hr-leader">HR Leader / CHRO</option>
                        <option value="hr-manager">HR Manager / Director</option>
                        <option value="hr-specialist">HR Specialist / Coordinator</option>
                        <option value="it">IT / Technical</option>
                        <option value="executive">Executive / C-Suite</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employees">Number of Employees</Label>
                      <select
                        id="employees"
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Select...</option>
                        <option value="1-50">1-50</option>
                        <option value="51-200">51-200</option>
                        <option value="201-500">201-500</option>
                        <option value="501-1000">501-1000</option>
                        <option value="1000+">1000+</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="h-11"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-summit hover:bg-summit-hover text-white font-bold uppercase tracking-wide"
                    >
                      Schedule My Demo
                    </Button>

                    <p className="text-xs text-slate-500 text-center">
                      By submitting this form, you agree to our{" "}
                      <a href="/terms" className="text-summit hover:underline">
                        Terms
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" className="text-summit hover:underline">
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
