import { Download, Key, Shield, Globe, LogInIcon } from "lucide-react";

const steps = [
  {
    icon: LogInIcon, //
    step: "1",
    title: "Login",
    description: "Login DigiLock on any device.",
  },
  {
    icon: Key,
    step: "2",
    title: "Create Password",
    description: "Set your master password.",
  },
  {
    icon: Shield,
    step: "3",
    title: "Import & Secure",
    description: "Add your existing passwords.",
  },
  {
    icon: Globe,
    step: "4",
    title: "Access Anywhere",
    description: "Log in from any device.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24">
      <div className="container-narrow">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="text-sm font-medium text-primary mb-3">How It Works</p>
          <h2 className="text-3xl font-semibold mb-4 text-foreground">
            Get started in minutes
          </h2>
          <p className="text-muted-foreground">
            Setting up DigiLock is quick and effortless.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
              <div className="text-xs font-medium text-primary mb-2">
                Step {item.step}
              </div>
              <h3 className="font-medium text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
