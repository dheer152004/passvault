import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      {/* <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/PASSVAULT_blue.png" alt="PassVault" className="h-10 w-auto" />
            <span className="text-xl font-bold text-blue-500">PassVault</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header> */}

      <main className="flex-1">
        <section className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex flex-col items-center justify-center gap-8 py-24 text-center md:py-32 w-full">
          <div className="flex flex-col items-center gap-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/50 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
              Bank-level encryption
            </div>
            <h1 className="text-balance text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-6xl lg:text-7xl">
              Secure your digital life with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                PassVault
              </span>
            </h1>
            <p className="text-pretty text-lg text-slate-600 dark:text-slate-400 md:text-xl max-w-2xl">
              Store, generate, and manage all your passwords in one secure place. Never forget a password again with our
              military-grade encrypted vault.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">Start for free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-24 md:py-32 w-full">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-white"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Secure Storage</h3>
              <p className="text-slate-600 dark:text-slate-400">
                All your passwords encrypted with military-grade AES-256 encryption
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-white"
                >
                  <rect width="14" height="8" x="5" y="2" rx="2" />
                  <rect width="20" height="8" x="2" y="14" rx="2" />
                  <path d="M6 18h2" />
                  <path d="M12 18h6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Password Generator</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Create strong, unique passwords instantly with our advanced generator
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-white"
                >
                  <path d="M3 7V5c0-1.1.9-2 2-2h2" />
                  <path d="M17 3h2c1.1 0 2 .9 2 2v2" />
                  <path d="M21 17v2c0 1.1-.9 2-2 2h-2" />
                  <path d="M7 21H5c-1.1 0-2-.9-2-2v-2" />
                  <rect width="7" height="5" x="7" y="7" rx="1" />
                  <rect width="7" height="5" x="10" y="12" rx="1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Smart Organization</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Organize passwords with categories, favorites, and powerful search
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
