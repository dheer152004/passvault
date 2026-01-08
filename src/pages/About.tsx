import { Layout } from "@/components/layout/Layout";
import { Shield, Users, Globe, Award } from "lucide-react";

const stats = [
  { value: "2M+", label: "Active Users" },
  { value: "2019", label: "Founded" },
  { value: "180+", label: "Countries" },
  { value: "50+", label: "Team Members" },
];

const values = [
  {
    icon: Shield,
    title: "Security First",
    description: "Every decision prioritizes your security and privacy.",
  },
  {
    icon: Users,
    title: "User-Centric",
    description: "We build features that solve real problems simply.",
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Secure password management for everyone.",
  },
  {
    icon: Award,
    title: "Transparency",
    description: "Open about our practices and how we protect your data.",
  },
];

const team = [
  { name: "David Chen", role: "CEO & Co-Founder", avatar: "DC" },
  { name: "Maria Garcia", role: "CTO & Co-Founder", avatar: "MG" },
  { name: "James Wilson", role: "Head of Security", avatar: "JW" },
  { name: "Lisa Thompson", role: "Head of Product", avatar: "LT" },
];

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-24">
        <div className="container-narrow">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-medium text-primary mb-3">About Us</p>
            <h1 className="text-4xl font-semibold mb-6 text-foreground">
              Making digital security accessible to all
            </h1>
            <p className="text-lg text-muted-foreground">
              We believe everyone deserves easy access to powerful security tools.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-muted/50">
        <div className="container-narrow">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-semibold text-foreground mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24">
        <div className="container-narrow">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center text-foreground">
              Our Story
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                DigiLock was born from a simple frustration: existing password managers were either too complex or lacked proper security features.
              </p>
              <p>
                Founded in 2019 by security researchers and UX designers, we set out to create a password manager that's both secure and easy to use.
              </p>
              <p>
                Today, over 2 million users trust DigiLock to protect their digital lives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-muted/50">
        <div className="container-narrow">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Our Values</h2>
            <p className="text-muted-foreground">
              The principles that guide everything we do.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-background p-6 rounded-lg border border-border text-center">
                <value.icon className="w-5 h-5 text-primary mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="font-medium text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24">
        <div className="container-narrow">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Meet the Team
            </h2>
            <p className="text-muted-foreground">
              The people behind DigiLock.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <span className="text-sm font-medium text-foreground">
                    {member.avatar}
                  </span>
                </div>
                <h4 className="font-medium text-foreground text-sm">
                  {member.name}
                </h4>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-muted/50">
        <div className="container-narrow text-center">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Have questions?
          </h2>
          <p className="text-muted-foreground mb-6">
            We'd love to hear from you.
          </p>
          <a
            href="mailto:hello@digilock.com"
            className="inline-flex px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>
    </Layout>
  );
}
