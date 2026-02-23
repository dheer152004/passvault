import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For personal use",
    features: [
      "Up to 50 passwords",
      "1 device",
      "Password generator",
      "Basic security alerts",
      "Browser extension",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Premium",
    price: "$4.99",
    period: "per month",
    description: "For power users",
    features: [
      "Unlimited passwords",
      "Unlimited devices",
      "Priority cloud sync",
      "Secure file storage",
      "Dark web monitoring",
      "Password sharing",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Family",
    price: "$7.99",
    period: "per month",
    description: "Up to 6 members",
    features: [
      "Everything in Premium",
      "6 premium accounts",
      "Family dashboard",
      "Shared folders",
      "Activity monitoring",
      "Account recovery",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
];

const faqs = [
  {
    question: "Can I try Premium before paying?",
    answer: "Yes! All plans come with a 30-day free trial. No credit card required.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and cryptocurrency.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. Cancel anytime and keep access until the end of your billing period.",
  },
  {
    question: "Is there a business plan?",
    answer: "Yes! Contact our sales team for custom enterprise pricing.",
  },
];

export default function Pricing() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-24">
        <div className="container-narrow">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-medium text-primary mb-3">Pricing</p>
            <h1 className="text-4xl font-semibold mb-6 text-foreground">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose the plan that fits your needs. 30-day money-back guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="container-narrow">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-background p-6 rounded-lg border relative ${
                  plan.popular ? "border-primary" : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="font-medium text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-1">
                    <span className="text-3xl font-semibold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /{plan.period}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full"
                  asChild
                >
                  <Link to="/signup">
                    {plan.cta}
                    {plan.popular && <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section className="py-16 bg-muted/50">
        <div className="container-narrow">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Need a solution for your team?
            </h2>
            <p className="text-muted-foreground mb-6">
              Get admin controls, SSO, and dedicated support.
            </p>
            <Button>Contact Sales</Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="container-narrow">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-semibold text-foreground">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {faqs.map((faq) => (
              <div key={faq.question} className="p-6 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">
                  {faq.question}
                </h4>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
