export default function ServicePage() {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-16">
      <h1 className="text-3xl font-bold">Our Services</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        PassVault offers comprehensive password and security management services designed to keep your digital life secure.
      </p>

      <section className="mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mt-6">🔐 Password Storage</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Securely store and organize your passwords with end-to-end encryption. Access your passwords from any device.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6">⚡ Password Generator</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Generate strong, random passwords with customizable options. Ensure every account has a unique, secure password.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6">🔑 Two-Factor Authentication</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Built-in authenticator support for TOTP-based two-factor authentication. Add an extra layer of security to your accounts.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6">📝 Secure Notes</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Store sensitive notes and information securely. Perfect for security questions, license keys, and other confidential data.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6">🎯 Enterprise Solutions</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            For businesses needing team collaboration and advanced features, contact our sales team for custom solutions.
          </p>
        </div>
      </section>
    </div>
  )
}
