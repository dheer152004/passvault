import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, Check } from "lucide-react";

const features = [
  "256-bit encryption",
  "Sync all devices",
  "Zero-knowledge",
];

export function HeroSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="container-narrow">
        <div className="max-w-2xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted mb-8">
            <Shield className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <span className="text-sm text-muted-foreground">
              Trusted by 2M+ users
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-6 text-foreground">
            Your passwords, secured and accessible anywhere
          </h1>

          {/* Subheading */}
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Store, manage, and access your passwords from any device. Military-grade encryption keeps your data safe.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted"
              >
                <Check className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-1" strokeWidth={1.5} />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/features">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
