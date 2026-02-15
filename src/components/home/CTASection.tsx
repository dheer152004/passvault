import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24">
      <div className="container-narrow">
        <div className="bg-muted rounded-lg p-8 md:p-12 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground">
            Ready to secure your digital life?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join over 2 million users who trust DigiLock. Start your free trial today.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-1" strokeWidth={1.5} />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            No credit card required · 30-day money-back guarantee
          </p>
        </div>
      </div>
    </section>
  );
}

