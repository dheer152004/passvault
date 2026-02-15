import { 
  Shield, 
  Smartphone, 
  Lock, 
  RefreshCw, 
  Users, 
  Fingerprint,
  Cloud,
  Zap
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Military-Grade Encryption",
    description: "256-bit AES encryption keeps your data secure.",
  },
  {
    icon: Cloud,
    title: "Cloud Sync",
    description: "Access passwords across all your devices.",
  },
  {
    icon: Fingerprint,
    title: "Biometric Login",
    description: "Unlock with fingerprint or face recognition.",
  },
  {
    icon: RefreshCw,
    title: "Auto-Fill",
    description: "Automatically fill login forms for you.",
  },
  {
    icon: Users,
    title: "Secure Sharing",
    description: "Share passwords with family or team.",
  },
  {
    icon: Zap,
    title: "Password Generator",
    description: "Create strong, unique passwords instantly.",
  },
  {
    icon: Smartphone,
    title: "Cross-Platform",
    description: "Works on all devices and browsers.",
  },
  {
    icon: Lock,
    title: "Zero-Knowledge",
    description: "Only you can access your data.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container-narrow">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="text-sm font-medium text-primary mb-3">Features</p>
          <h2 className="text-3xl font-semibold mb-4 text-foreground">
            Everything you need to stay secure
          </h2>
          <p className="text-muted-foreground">
            Powerful features designed to protect your digital identity.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-background p-6 rounded-lg border border-border"
            >
              <feature.icon className="w-5 h-5 text-primary mb-4" strokeWidth={1.5} />
              <h3 className="font-medium text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

