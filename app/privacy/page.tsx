export default function PrivacyPage() {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-16">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        Last updated: January 1, 2026
      </p>

      <section className="mt-8 space-y-6 text-slate-600 dark:text-slate-400">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Introduction</h2>
          <p className="mt-2">
            PassVault ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">1. Information We Collect</h2>
          <p className="mt-2">
            We may collect information about you in a variety of ways. The information we may collect on the site includes:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.</li>
            <li><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Site.</li>
            <li><strong>Data From Beacons:</strong> Our Site may use electronic image requests (called a "web beacon") that allow us to collect certain information from you, check whether you have viewed a particular web page or email message, and determine the domains our customers use to access our Site.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">2. Use of Your Information</h2>
          <p className="mt-2">
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Generate a personal profile about you so that future visits to the Site can be personalized to your preferences</li>
            <li>Increase the efficiency and operation of the Site</li>
            <li>Monitor and analyze usage and trends to improve your experience with the Site</li>
            <li>Notify you of important changes to the Site, if applicable</li>
            <li>Offer new products, services, and/or recommendations to you</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">3. Disclosure of Your Information</h2>
          <p className="mt-2">
            We may share or disclose your information in the following situations:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to comply with the law, enforce our Site policies, or protect ours or others' rights, property, or safety.</li>
            <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
            <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">4. Security of Your Information</h2>
          <p className="mt-2">
            We use administrative, technical, and physical security measures to protect your personal information. However, perfect security does not exist on the Internet. You are responsible for maintaining the confidentiality of any passwords you create and for all activities that occur under your account.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">5. Contact Us</h2>
          <p className="mt-2">
            If you have questions or comments about this Privacy Policy, please contact us at:
          </p>
          <p className="mt-2">
            <strong>Email:</strong> <a href="mailto:privacy@passvault.example" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@passvault.example</a>
          </p>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            PassVault is committed to your privacy. This policy may be updated periodically to reflect changes in our practices or relevant laws. Your continued use of PassVault following any changes means you accept those changes.
          </p>
        </div>
      </section>
    </div>
  )
}
