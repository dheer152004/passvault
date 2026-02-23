import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Shield,
  Cloud,
  Fingerprint,
  RefreshCw,
  Users,
  Zap,
  Smartphone,
  Lock,
  Key,
  Eye,
  AlertTriangle,
  History,
  ArrowRight,
} from "lucide-react";

const mainFeatures = [
  {
    icon: Shield,
    title: "Military-Grade Encryption",
    description:
      "Your data is protected with AES-256 bit encryption, the same standard used by governments worldwide.",
  },
  {
    icon: Lock,
    title: "Zero-Knowledge Architecture",
    description:
      "Your master password never leaves your device. We cannot access your data - only you can.",
  },
  {
    icon: Cloud,
    title: "Seamless Cloud Sync",
    description:
      "Access your passwords on any device. Changes sync instantly with end-to-end encryption.",
  },
  {
    icon: Fingerprint,
    title: "Biometric Authentication",
    description:
      "Unlock your vault with Face ID, Touch ID, or fingerprint for quick, secure access.",
  },
  {
    icon: Zap,
    title: "Intelligent Auto-Fill",
    description:
      "DigiLock recognizes login forms and fills credentials automatically.",
  },
  {
    icon: Users,
    title: "Secure Sharing",
    description:
      "Share passwords with family or team members securely with revocable access.",
  },
];

const additionalFeatures = [
  {
    icon: Key,
    title: "Password Generator",
    description: "Create strong, unique passwords instantly.",
  },
  {
    icon: Eye,
    title: "Security Dashboard",
    description: "Monitor password health and detect weak passwords.",
  },
  {
    icon: AlertTriangle,
    title: "Breach Monitoring",
    description: "Get alerts if credentials appear in breaches.",
  },
  {
    icon: History,
    title: "Password History",
    description: "View and restore previous password versions.",
  },
  {
    icon: RefreshCw,
    title: "Auto-Logout",
    description: "Automatic session timeout for security.",
  },
  {
    icon: Smartphone,
    title: "Offline Access",
    description: "Access passwords without internet.",
  },
];

export default function Features() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-24">
        <div className="container-narrow">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-medium text-primary mb-3">Features</p>
            <h1 className="text-4xl font-semibold mb-6 text-foreground">
              Powerful security, effortless access
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover all the features that make DigiLock the trusted choice for millions.
            </p>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-16 bg-muted/50">
        <div className="container-narrow">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-background p-6 rounded-lg border border-border"
              >
                <feature.icon className="w-5 h-5 text-primary mb-4" strokeWidth={1.5} />
                <h3 className="font-medium text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-24">
        <div className="container-narrow">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              And much more
            </h2>
            <p className="text-muted-foreground">
              Every feature is designed with security and usability in mind.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature) => (
              <div
                key={feature.title}
                className="flex gap-4 p-4"
              >
                <feature.icon className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/50">
        <div className="container-narrow text-center">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Ready to experience secure password management?
          </h2>
          <Button asChild>
            <Link to="/signup">
              Start Free Trial <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
