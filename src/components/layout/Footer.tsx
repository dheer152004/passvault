import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const footerLinks = {
  product: {
    title: "Product",
    links: [
      { name: "Features", href: "/features" },
      { name: "Pricing", href: "/pricing" },
      { name: "Security", href: "/features" },
      { name: "Download", href: "/features" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { name: "Blog", href: "/blog" },
      { name: "Help Center", href: "/about" },
      { name: "Documentation", href: "/about" },
      { name: "API", href: "/about" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { name: "About", href: "/about" },
      { name: "Careers", href: "/about" },
      { name: "Press", href: "/about" },
      { name: "Contact", href: "/about" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { name: "Privacy", href: "/terms" },
      { name: "Terms", href: "/terms" },
      { name: "Cookies", href: "/terms" },
      { name: "GDPR", href: "/terms" },
    ],
  },
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container-narrow py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <span className="text-lg font-semibold text-foreground">
                DigiLock
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Secure password management for everyone. Access your passwords from anywhere.
            </p>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-medium text-foreground mb-4 text-sm">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DigiLock. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
