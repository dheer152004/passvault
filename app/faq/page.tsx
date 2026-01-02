import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
  const faqs = [
    {
      id: "item-1",
      question: "What is PassVault?",
      answer: "PassVault is a secure, privacy-first password management solution. It helps you store, organize, and manage all your passwords in one secure place with end-to-end encryption."
    },
    {
      id: "item-2",
      question: "How secure is PassVault?",
      answer: "PassVault uses industry-standard AES-256 encryption to protect your passwords. All data is encrypted on your device before being stored, ensuring only you can access your passwords."
    },
    {
      id: "item-3",
      question: "Can I access my passwords from multiple devices?",
      answer: "Yes! Once you set up your PassVault account, you can securely access your passwords from any device where you're logged in. Your encrypted data syncs across devices."
    },
    {
      id: "item-4",
      question: "What if I forget my master password?",
      answer: "Your master password is the key to your vault and cannot be recovered. We recommend storing it in a secure location. However, you can always create a new account and start fresh."
    },
    {
      id: "item-5",
      question: "How does the password generator work?",
      answer: "Our password generator creates strong, random passwords with customizable options including length, uppercase, lowercase, numbers, and special characters. Generated passwords are never stored or logged."
    },
    {
      id: "item-6",
      question: "Is two-factor authentication (2FA) supported?",
      answer: "Yes! PassVault includes a built-in authenticator that supports TOTP-based two-factor authentication for your accounts. You can generate time-based one-time passwords directly in the app."
    },
    {
      id: "item-7",
      question: "Can I store notes in PassVault?",
      answer: "Absolutely! You can securely store sensitive notes, security questions, license keys, and other confidential information. All notes are encrypted just like your passwords."
    },
    {
      id: "item-8",
      question: "Is PassVault free?",
      answer: "PassVault offers a free tier with essential features. Check our pricing page for information about premium plans with additional features and higher storage limits."
    },
    {
      id: "item-9",
      question: "How do I export my passwords?",
      answer: "You can export your passwords in an encrypted format. For security reasons, we recommend keeping exports in a secure location and deleting them once you've backed them up."
    },
    {
      id: "item-10",
      question: "What happens if I delete my account?",
      answer: "Once you delete your account, all your data is permanently removed from our servers within 30 days. This action cannot be undone, so please be careful."
    }
  ]

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-16">
      <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        Find answers to common questions about PassVault. Can't find what you're looking for? <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact us</a>.
      </p>

      <div className="mt-8">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-400">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-12 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100">Still have questions?</h3>
        <p className="mt-2 text-sm text-blue-800 dark:text-blue-200">
          Reach out to our support team at <a href="mailto:support@passvault.example" className="text-blue-600 dark:text-blue-400 hover:underline">support@passvault.example</a> or visit our <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">contact page</a>.
        </p>
      </div>
    </div>
  )
}
