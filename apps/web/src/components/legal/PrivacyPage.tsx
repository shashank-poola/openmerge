import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";

const sections = [
  {
    title: "1. Information We Collect",
    body: `When you sign in with GitHub, we receive your GitHub username, email address, name, and avatar URL. We store this to identify your account and display it in the dashboard. We also collect installation data: which repositories you have authorized PullRabbit to review.`,
  },
  {
    title: "2. Code Access",
    body: `To generate pull request reviews, PullRabbit temporarily reads the diff of each pull request from GitHub via the GitHub API. We do not store your source code. Diff content is processed in memory, passed to the AI agents, and discarded after the review job completes.`,
  },
  {
    title: "3. Review Data",
    body: `We store review session metadata (PR number, review status, comment count, timestamps) associated with your account. This data is used to power the PullRabbit dashboard. You can delete your account and all associated data at any time from Settings.`,
  },
  {
    title: "4. Third-Party Services",
    body: `PullRabbit uses the GitHub API to read diffs and post review comments. AI agents may use third-party model APIs (e.g., Google Gemini). Diff excerpts may be sent to these providers solely for the purpose of generating review content. We do not sell your data to third parties.`,
  },
  {
    title: "5. Data Security",
    body: `We use HTTPS for all data in transit. Secrets (GitHub App private keys, JWT secrets) are stored as environment variables and never committed to source control. JWT tokens expire after 7 days and are not stored server-side.`,
  },
  {
    title: "6. Cookies and Session",
    body: `We use session cookies managed by NextAuth.js to maintain your authenticated session in the dashboard. We do not use tracking cookies or analytics cookies.`,
  },
  {
    title: "7. Data Retention",
    body: `Account data is retained until you delete your account. Review session metadata is retained for up to 90 days and then purged. If you uninstall the GitHub App, your installation data is removed within 30 days.`,
  },
  {
    title: "8. Your Rights",
    body: `You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at privacy@pullrabbit.dev. We will respond within 30 days.`,
  },
  {
    title: "9. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice in the dashboard. Continued use of the Service after notification constitutes acceptance.`,
  },
  {
    title: "10. Contact",
    body: `For privacy-related questions, contact us at privacy@pullrabbit.dev.`,
  },
];

export function PrivacyPage() {
  return (
    <PageShell>
      <header className="flex h-14 items-center justify-between border-b border-white/8 px-10 text-[13px]">
        <Link href="/" className="font-bold text-white tracking-tight">
          pullrabbit
        </Link>
        <Link href="/" className="text-[#555] hover:text-white">
          ← Back to home
        </Link>
      </header>

      <article className="px-10 py-14">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#555]">Legal</p>
        <h1 className="mb-2 text-[28px] font-bold text-white">Privacy Policy</h1>
        <p className="mb-12 text-[12px] text-[#444]">Last updated: June 2026</p>

        <div className="space-y-10 max-w-[700px]">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="mb-3 text-[14px] font-bold text-white">{s.title}</h2>
              <p className="text-[13px] leading-relaxed text-[#777]">{s.body}</p>
            </div>
          ))}
        </div>
      </article>

      <footer className="border-t border-white/8 px-10 py-5 text-[12px] text-[#444]">
        <div className="flex gap-5">
          <Link href="/terms" className="hover:text-[#888]">Terms</Link>
          <Link href="/privacy" className="text-white">Privacy</Link>
        </div>
      </footer>
    </PageShell>
  );
}
