import Link from "next/link";
import { ArrowRight } from "@/components/landing/icons";

const steps = [
  {
    title: "Add your repo.",
    body: "PullRabbit connects to GitHub and works against the repositories you select.",
  },
  {
    title: "Deploy agents.",
    body: "Each review agent gets the PR diff, repository context, and a focused review lane.",
  },
  {
    title: "Review.",
    body: "See what needs attention, what passed, and which pull requests are ready to merge.",
  },
];

const faqs = [
  {
    question: "Does PullRabbit need repository access?",
    answer: "Yes, only for the repositories you select during setup.",
  },
  {
    question: "Which coding agents does PullRabbit support?",
    answer: "PullRabbit runs security, performance, and code quality review agents today.",
  },
  {
    question: "Can I use PullRabbit from the CLI?",
    answer: "Yes. The CLI setup appears inside the app after your repositories are synced.",
  },
];

export function LandingDetails() {
  return (
    <section id="features" className="bg-[#100d0c] px-6 py-24 font-mono text-[#d7cfca] md:px-12">
      <div className="mx-auto max-w-[730px]">
        <Badge>HOW IT WORKS</Badge>
        <ol className="mt-12 space-y-10">
          {steps.map((step, index) => (
            <li key={step.title} className="grid grid-cols-[28px_1fr] gap-4 text-[16px] leading-relaxed">
              <span>{index + 1}.</span>
              <div>
                <h2 className="font-bold text-white">{step.title}</h2>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-28">
          <Badge>FREQUENTLY ASKED QUESTIONS</Badge>
          <div className="mt-12 space-y-9">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-bold text-white">{faq.question}</h3>
                <p className="mt-1 max-w-[620px] text-[16px] leading-relaxed text-[#d7cfca]">
                  L {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div id="cli" className="mt-28 space-y-5">
          <h2 className="font-bold text-white">We built PullRabbit using PullRabbit.</h2>
          <p>We think you will like it as much as we do.</p>
          <Link
            href="/signin"
            className="inline-flex h-[50px] items-center gap-4 rounded-[6px] bg-[#f4f1ef] px-4 font-bold text-[#100d0c] transition-transform hover:-translate-y-0.5"
          >
            Signin to PullRabbit
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-[3px] border border-[#a78986] bg-[#80635f] px-1.5 py-1 text-[14px] uppercase leading-none text-white">
      {children}
    </span>
  );
}
