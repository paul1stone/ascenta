import { PageHeader } from "@/components/page-header";
import { CheckIcon } from "@/components/icons";
import { DemoForm } from "@/components/book-demo/demo-form";

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
              <DemoForm />
            </div>
          </div>
        </section>
      </main>
  );
}
