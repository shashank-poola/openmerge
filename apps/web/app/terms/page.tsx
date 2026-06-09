import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";

export const metadata = { title: "Terms of Service — PullRabbit" };

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using PullRabbit ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. PullRabbit Labs reserves the right to update these terms at any time. Continued use of the Service after changes constitutes acceptance of the updated terms.`,
  },
  {
    title: "2. Description of Service",
    body: `PullRabbit provides an AI-powered pull request review service that integrates with GitHub via a GitHub App. The Service analyzes code changes and posts automated review comments on pull requests.`,
  },
  {
    title: "3. GitHub Integration",
    body: `To use PullRabbit, you must authorize the PullRabbit GitHub App on your repositories. You grant PullRabbit read access to your code for the purpose of generating automated reviews. PullRabbit does not store your source code beyond what is required to process individual review jobs.`,
  },
  {
    title: "4. Acceptable Use",
    body: `You agree not to use the Service to review code that contains malware, to attempt to reverse-engineer or bypass rate limits, or to resell or redistribute the Service without written permission. Abuse of the Service may result in immediate account termination.`,
  },
  {
    title: "5. Disclaimer of Warranties",
    body: `The Service is provided "as is" without warranties of any kind. PullRabbit does not guarantee that automated reviews will catch all bugs, security vulnerabilities, or performance issues. AI-generated review comments may contain errors. You are responsible for all code that ships to production.`,
  },
  {
    title: "6. Limitation of Liability",
    body: `To the maximum extent permitted by law, PullRabbit Labs shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the preceding twelve months.`,
  },
  {
    title: "7. Termination",
    body: `You may terminate your account at any time by uninstalling the GitHub App and deleting your account. We may suspend or terminate accounts that violate these terms. On termination, your review history will be deleted within 30 days.`,
  },
  {
    title: "8. Governing Law",
    body: `These terms are governed by the laws of the State of Delaware, United States. Any disputes shall be resolved in the courts of Delaware.`,
  },
  {
    title: "9. Contact",
    body: `For questions about these terms, contact us at legal@pullrabbit.dev.`,
  },
];

export default function TermsPage() {
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
        <h1 className="mb-2 text-[28px] font-bold text-white">Terms of Service</h1>
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
          <Link href="/terms" className="text-white">Terms</Link>
          <Link href="/privacy" className="hover:text-[#888]">Privacy</Link>
        </div>
      </footer>
    </PageShell>
  );
}
