import { Layout } from "@/components/layout/Layout";
import { Calendar, Clock, User } from "lucide-react";

const posts = [
  {
    title: "Why You Should Never Reuse Passwords",
    excerpt: "Discover the risks of password reuse and learn how a password manager can protect your accounts.",
    category: "Security Tips",
    author: "Alex Johnson",
    date: "Dec 28, 2025",
    readTime: "5 min",
    featured: true,
  },
  {
    title: "The Complete Guide to Two-Factor Authentication",
    excerpt: "Learn how 2FA adds an extra layer of security to your accounts.",
    category: "Guides",
    author: "Sarah Chen",
    date: "Dec 22, 2025",
    readTime: "8 min",
    featured: false,
  },
  {
    title: "How Zero-Knowledge Architecture Works",
    excerpt: "A deep dive into our security architecture and why your data is safe.",
    category: "Technology",
    author: "Michael Park",
    date: "Dec 18, 2025",
    readTime: "10 min",
    featured: false,
  },
  {
    title: "5 Password Habits That Put You at Risk",
    excerpt: "Common password mistakes that hackers exploit.",
    category: "Security Tips",
    author: "Emily Watson",
    date: "Dec 15, 2025",
    readTime: "4 min",
    featured: false,
  },
  {
    title: "Introducing Family Sharing",
    excerpt: "Our new family plan makes it easy to share passwords securely.",
    category: "Product",
    author: "DigiLock Team",
    date: "Dec 10, 2025",
    readTime: "3 min",
    featured: false,
  },
  {
    title: "The Rise of Passkeys",
    excerpt: "Passkeys are changing authentication. Here's what it means for you.",
    category: "Technology",
    author: "Alex Johnson",
    date: "Dec 5, 2025",
    readTime: "7 min",
    featured: false,
  },
];

export default function Blog() {
  const featuredPost = posts.find((p) => p.featured);
  const regularPosts = posts.filter((p) => !p.featured);

  return (
    <Layout>
      {/* Hero */}
      <section className="py-24">
        <div className="container-narrow">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-medium text-primary mb-3">Blog</p>
            <h1 className="text-4xl font-semibold mb-6 text-foreground">
              Security insights & updates
            </h1>
            <p className="text-lg text-muted-foreground">
              Stay informed about password security and product updates.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="pb-12">
          <div className="container-narrow">
            <div className="bg-muted/50 p-8 rounded-lg max-w-3xl mx-auto cursor-pointer hover:bg-muted transition-colors">
              <span className="inline-block px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium mb-4">
                Featured
              </span>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {featuredPost.title}
              </h2>
              <p className="text-muted-foreground mb-4">
                {featuredPost.excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" strokeWidth={1.5} />
                  {featuredPost.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" strokeWidth={1.5} />
                  {featuredPost.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" strokeWidth={1.5} />
                  {featuredPost.readTime}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Posts Grid */}
      <section className="py-16">
        <div className="container-narrow">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <article
                key={post.title}
                className="bg-background p-6 rounded-lg border border-border cursor-pointer hover:border-primary/50 transition-colors"
              >
                <span className="inline-block px-2 py-1 rounded bg-muted text-muted-foreground text-xs mb-4">
                  {post.category}
                </span>
                <h3 className="font-medium text-foreground mb-2">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{post.author}</span>
                  <span>{post.readTime}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-muted/50">
        <div className="container-narrow">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Subscribe to our newsletter
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Get security tips and updates delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
