import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckIcon } from "@/components/icons";
import Link from "next/link";

const certifications = [
  { name: "SOC 2 Type II", icon: "🛡️" },
  { name: "ISO 27001", icon: "🔐" },
  { name: "GDPR Compliant", icon: "🇪🇺" },
  { name: "HIPAA Ready", icon: "🏥" },
];

const features = [
  {
    title: "End-to-End Encryption",
    description:
      "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Your sensitive HR data is never accessible to unauthorized parties.",
    icon: "🔒",
  },
  {
    title: "Role-Based Access Control",
    description:
      "Granular permissions ensure employees only access data relevant to their role. Audit every access attempt with detailed logging.",
    icon: "👤",
  },
  {
    title: "Data Residency Options",
    description:
      "Choose where your data is stored. We offer regional data centers in North America, Europe, and Asia-Pacific to meet your compliance requirements.",
    icon: "🌍",
  },
  {
    title: "Regular Security Audits",
    description:
      "Independent third-party security assessments are conducted quarterly. We maintain an active bug bounty program with responsible security researchers.",
    icon: "🔍",
  },
  {
    title: "Disaster Recovery",
    description:
      "99.99% uptime SLA with automated failover, real-time data replication, and point-in-time recovery capabilities.",
    icon: "🔄",
  },
  {
    title: "Single Sign-On (SSO)",
    description:
      "Integrate with your existing identity provider including Okta, Azure AD, and Google Workspace. Support for SAML 2.0 and OIDC.",
    icon: "🔑",
  },
];

export default function SecurityPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          badge="Security"
          title="Enterprise-Grade Security"
          description="Your trust is our foundation. Learn how we protect your most sensitive HR data with industry-leading security practices."
        />

        {/* Certifications */}
        <section className="py-12 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-6">
              {certifications.map((cert) => (
                <Badge
                  key={cert.name}
                  variant="outline"
                  className="px-6 py-3 text-base border-slate-300 text-slate-700"
                >
                  <span className="mr-2">{cert.icon}</span>
                  {cert.name}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-20 bg-glacier">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-4 uppercase tracking-tight">
              How We Protect Your Data
            </h2>
            <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto">
              Security isn&apos;t an afterthought – it&apos;s built into every layer of
              our platform.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="border-slate-200 hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <CardTitle className="text-xl font-bold text-deep-blue">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-deep-blue text-white rounded-3xl p-10 md:p-16">
              <h2 className="text-3xl font-display font-black mb-6 uppercase text-center">
                Our Security Commitments
              </h2>
              <ul className="space-y-4 mb-10">
                {[
                  "We will never sell or share your data with third parties",
                  "Your data is never used to train AI models for other customers",
                  "You own your data and can export it anytime",
                  "We notify you within 24 hours of any security incident",
                  "Annual penetration testing by independent security firms",
                ].map((commitment) => (
                  <li key={commitment} className="flex items-start gap-3">
                    <CheckIcon className="size-6 text-summit flex-shrink-0 mt-0.5" />
                    <span className="text-slate-200">{commitment}</span>
                  </li>
                ))}
              </ul>
              <div className="text-center">
                <Button
                  asChild
                  className="bg-summit hover:bg-summit-hover text-white px-10 py-6 h-auto font-black uppercase tracking-wide"
                >
                  <Link href="/book-demo">Request Security Documentation</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
