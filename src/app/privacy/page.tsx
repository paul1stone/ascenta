import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          title="Privacy Policy"
          description="Last updated: January 2024"
        />

        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate prose-lg">
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us, including:</p>
            <ul>
              <li>Account information (name, email, company)</li>
              <li>Employee data you input into our system</li>
              <li>Usage data and analytics</li>
              <li>Communications with our support team</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and maintain our services</li>
              <li>Improve and personalize your experience</li>
              <li>Send you technical notices and updates</li>
              <li>Respond to your requests and support needs</li>
              <li>Monitor and analyze usage patterns</li>
            </ul>

            <h2>3. Data Sharing</h2>
            <p>
              We do not sell your personal information. We may share information
              with:
            </p>
            <ul>
              <li>Service providers who assist in our operations</li>
              <li>Legal authorities when required by law</li>
              <li>Business partners with your consent</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement industry-standard security measures including
              encryption, access controls, and regular security audits to protect
              your information.
            </p>

            <h2>5. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or
              as needed to provide services. You may request deletion of your
              data at any time.
            </p>

            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of marketing communications</li>
            </ul>

            <h2>7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your experience,
              analyze usage, and assist in our marketing efforts. You can control
              cookie preferences through your browser settings.
            </p>

            <h2>8. International Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries
              other than your own. We ensure appropriate safeguards are in place
              for such transfers.
            </p>

            <h2>9. Children&apos;s Privacy</h2>
            <p>
              Our service is not directed to children under 16. We do not
              knowingly collect information from children.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. We will notify you of
              significant changes via email or through the service.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              For privacy-related inquiries, contact us at{" "}
              <a href="mailto:privacy@ascenta.ai" className="text-summit">
                privacy@ascenta.ai
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
