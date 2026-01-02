import Link from "next/link"

export default function ContactPage() {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-16">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        Have questions or feedback? We'd love to hear from you.
      </p>

      <section className="mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Email</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            <a href="mailto:support@passvault.example" className="text-blue-600 dark:text-blue-400 hover:underline">
              support@passvault.example
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Support</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            For technical support, security issues, or feature requests, please reach out via email.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Business Inquiries</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            For partnerships, integrations, or enterprise solutions, contact our business team at the email above.
          </p>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Response Times</h3>
          <p className="mt-2 text-sm text-blue-800 dark:text-blue-200">
            We aim to respond to all inquiries within 24-48 hours during business days.
          </p>
        </div>
      </section>
    </div>
  )
}
