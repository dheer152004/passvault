export default function TermsPage() {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-16">
      <h1 className="text-3xl font-bold">Terms & Conditions</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        Last updated: January 1, 2026
      </p>

      <section className="mt-8 space-y-6 text-slate-600 dark:text-slate-400">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">1. Agreement to Terms</h2>
          <p className="mt-2">
            By accessing and using PassVault, you agree to be bound by these Terms & Conditions. If you do not agree to abide by the above, please do not use this service.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">2. Use License</h2>
          <p className="mt-2">
            Permission is granted to temporarily download one copy of the materials (information or software) on PassVault for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to decompile or reverse engineer any software contained on PassVault</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            <li>Attempt to gain unauthorized access to any portion or feature of PassVault</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">3. Disclaimer</h2>
          <p className="mt-2">
            The materials on PassVault are provided on an 'as is' basis. PassVault makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">4. Limitations</h2>
          <p className="mt-2">
            In no event shall PassVault or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PassVault, even if PassVault or an authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">5. Accuracy of Materials</h2>
          <p className="mt-2">
            The materials appearing on PassVault could include technical, typographical, or photographic errors. PassVault does not warrant that any of the materials on PassVault are accurate, complete, or current. PassVault may make changes to the materials contained on PassVault at any time without notice.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">6. Links</h2>
          <p className="mt-2">
            PassVault has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by PassVault of the site. Use of any such linked website is at the user's own risk.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">7. Modifications</h2>
          <p className="mt-2">
            PassVault may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">8. Governing Law</h2>
          <p className="mt-2">
            These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which PassVault operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Please review these terms periodically for changes. Your continued use of PassVault following the posting of revised terms means that you accept and agree to the changes.
          </p>
        </div>
      </section>
    </div>
  )
}
