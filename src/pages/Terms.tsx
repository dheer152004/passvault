import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing and using DigiLock's services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.`,
  },
  {
    title: "2. Description of Service",
    content: `DigiLock provides a password management service that allows you to securely store, manage, and access your passwords across multiple devices. Our service uses industry-standard encryption to protect your data.`,
  },
  {
    title: "3. User Responsibilities",
    content: `You are responsible for maintaining the confidentiality of your master password, all activities under your account, and ensuring your information is accurate. You agree not to use our service for any unlawful purpose.`,
  },
  {
    title: "4. Data Security & Privacy",
    content: `We employ a zero-knowledge security architecture, meaning we cannot access your encrypted data. Your passwords are encrypted on your device before transmission. See our Privacy Policy for details.`,
  },
  {
    title: "5. Payment & Subscriptions",
    content: `Premium features require a paid subscription.`,
  },
  {
    title: "6. Service Availability",
    content: `While we strive for 99.99% uptime, we do not guarantee uninterrupted access. We reserve the right to modify or suspend any part of our service with reasonable notice.`,
  },
  {
    title: "7. Limitation of Liability",
    content: `DigiLock shall not be liable for any indirect, incidental, or consequential damages. Our total liability shall not exceed the amount paid for our service in the 12 months preceding any claim.`,
  },
  {
    title: "8. Termination",
    content: `You may terminate your account at any time. We reserve the right to terminate accounts that violate these terms. Upon termination, your data will be deleted within 30 days.`,
  },
  {
    title: "9. Contact",
    content: `Questions about these Terms? Contact us at @dheer152004.`,
  },
];

export default function Terms() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-24">
        <div className="container-narrow">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-semibold mb-4 text-foreground">
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Last updated: January 1, 2026
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24">
        <div className="container-narrow">
          <div className="max-w-2xl mx-auto space-y-10">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-medium text-foreground mb-3">
                  {section.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="py-12 bg-muted/50">
        <div className="container-narrow text-center">
          <p className="text-sm text-muted-foreground mb-4">
            See also:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="#" className="text-primary hover:underline">Privacy Policy</Link>
            <Link to="#" className="text-primary hover:underline">Cookie Policy</Link>
            <Link to="#" className="text-primary hover:underline">GDPR</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

