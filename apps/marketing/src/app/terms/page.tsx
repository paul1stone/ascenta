import { PageHeader } from "@/components/page-header";

export default function TermsPage() {
  return (
    <main>
        <PageHeader
          title="Terms of Service"
          description="Last updated: January 2024"
        />

        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate prose-lg">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Ascenta&apos;s services, you agree to be bound by
              these Terms of Service. If you do not agree to these terms, please
              do not use our services.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Ascenta provides AI-powered human resources management software,
              including but not limited to workflow automation, employee
              management, and compliance tracking tools.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities that occur under your
              account. You must notify us immediately of any unauthorized use.
            </p>

            <h2>4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Upload malicious code or content</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>

            <h2>5. Data and Privacy</h2>
            <p>
              Your use of the service is also governed by our Privacy Policy. By
              using Ascenta, you consent to the collection and use of information
              as described in our Privacy Policy.
            </p>

            <h2>6. Intellectual Property</h2>
            <p>
              Ascenta and its original content, features, and functionality are
              owned by Ascenta AI and are protected by international copyright,
              trademark, and other intellectual property laws.
            </p>

            <h2>7. Subscription and Billing</h2>
            <p>
              Paid features require a valid subscription. You agree to pay all
              applicable fees and authorize us to charge your payment method.
              Subscriptions automatically renew unless cancelled.
            </p>

            <h2>8. Termination</h2>
            <p>
              We may terminate or suspend your account at any time for violations
              of these terms. Upon termination, your right to use the service
              ceases immediately.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              Ascenta shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages arising from your use of the
              service.
            </p>

            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will
              notify users of significant changes via email or through the
              service.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have questions about these Terms, please contact us at{" "}
              <a href="mailto:legal@ascenta.ai" className="text-summit">
                legal@ascenta.ai
              </a>
              .
            </p>
          </div>
        </section>
      </main>
  );
}
