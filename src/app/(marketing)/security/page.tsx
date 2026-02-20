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
  { name: "SOC 2 Type II", icon: "🛡️", description: "Independently audited controls for security, availability, and confidentiality." },
  { name: "ISO 27001", icon: "🔐", description: "International standard for information security management systems." },
  { name: "GDPR Compliant", icon: "🇪🇺", description: "Full compliance with European data protection regulations." },
  { name: "HIPAA Ready", icon: "🏥", description: "Healthcare-grade data protection for sensitive employee information." },
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

const infrastructure = [
  { label: "Cloud Provider", value: "AWS (Amazon Web Services)" },
  { label: "Data Centers", value: "US East, EU West, AP Southeast" },
  { label: "Uptime SLA", value: "99.99%" },
  { label: "Backup Frequency", value: "Continuous with 30-day retention" },
  { label: "Encryption at Rest", value: "AES-256" },
  { label: "Encryption in Transit", value: "TLS 1.3" },
  { label: "Penetration Testing", value: "Quarterly by third-party firms" },
  { label: "Vulnerability Scanning", value: "Continuous automated scanning" },
];

export default function SecurityPage() {
  return (
    <main>
        <PageHeader
          badge="Security"
          title="Enterprise-Grade Security"
          description="Your trust is our foundation. Learn how we protect your most sensitive HR data with industry-leading security practices."
        />

        {/* Certifications */}
        <section className="py-16 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-display font-black text-deep-blue text-center mb-10 uppercase tracking-tight">
              Certifications & Compliance
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {certifications.map((cert) => (
                <div
                  key={cert.name}
                  className="text-center p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="text-4xl mb-3">{cert.icon}</div>
                  <h3 className="font-bold text-deep-blue mb-2">
                    {cert.name}
                  </h3>
                  <p className="text-sm text-slate-500">{cert.description}</p>
                </div>
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
              Security isn&apos;t an afterthought – it&apos;s built into every
              layer of our platform.
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

        {/* Infrastructure Details */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-black text-deep-blue text-center mb-4 uppercase tracking-tight">
              Infrastructure Details
            </h2>
            <p className="text-slate-500 text-center mb-12">
              A transparent look at how we host and protect your data.
            </p>

            <div className="bg-glacier rounded-3xl border border-slate-100 overflow-hidden">
              {infrastructure.map((item, index) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between px-8 py-5 ${
                    index !== infrastructure.length - 1
                      ? "border-b border-slate-200"
                      : ""
                  }`}
                >
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    {item.label}
                  </span>
                  <span className="text-sm font-medium text-deep-blue">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20 bg-glacier">
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
                  "All employees undergo background checks and security training",
                  "Dedicated security team monitoring 24/7",
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
                  <Link href="/contact">Request Security Documentation</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
  );
}
