import { useState } from "react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

interface FAQItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    q: "Is there really a free forever plan?",
    a: "Yes. ShortLynk's Free Forever plan includes unlimited shortened links, direct sub-15ms edge redirects, real-time click tracking, and 3 custom branded aliases. No credit card is required to sign up.",
  },
  {
    q: "What makes ShortLynk faster than traditional shorteners?",
    a: "ShortLynk executes direct 302 edge redirects without intermediate interstitial pages, countdown delays, or third-party ad networks. Your visitors reach the intended destination in sub-15 milliseconds.",
  },
  {
    q: "Can I edit where a short link points after creating it?",
    a: "Yes. Dynamic link destination routing lets you update target URLs directly from your dashboard anytime without breaking existing printed QR codes, social media shares, or marketing campaigns.",
  },
  {
    q: "Can I use custom branded slugs or my own apex domain?",
    a: "Every account includes 3 custom slugs (e.g. short.lynk/your-brand). The upcoming Pro Tier unlocks full apex and subdomain mapping with automated zero-config SSL certificates.",
  },
  {
    q: "What audience analytics and telemetry are tracked?",
    a: "We track real-time click volumes, geographic origins by country, top referrer sources, device categories (mobile, desktop, tablet), and browser distributions with strict privacy protection and zero tracking cookies.",
  },
  {
    q: "What happens to the link I created in the live demo?",
    a: "Links generated in the Hero demo shortener are immediately live on the edge. When you register for an account, your demo link is automatically claimed and added to your personal dashboard so you never lose its telemetry.",
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const headerRef = useScrollReveal<HTMLDivElement>(0);
  const listRef = useScrollReveal<HTMLDivElement>(0.08);

  return (
    <section id="faq" className="relative pt-24 pb-14 px-6">
      <div className="mx-auto max-w-3xl">
        {/* Section Header */}
        <div ref={headerRef} className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400">
            <span className="text-xs">✦</span>
            Frequently Asked Questions
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
            Got questions?{" "}
            <span className="gradient-primary">We&apos;ve got answers.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
            Everything you need to know about our link shortening, custom slugs,
            real-time telemetry, and edge redirect performance.
          </p>
        </div>

        {/* Accordion List */}
        <div ref={listRef} className="space-y-3.5">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={item.q}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5 hover:shadow-md ${
                  isOpen
                    ? "border-blue-500/40 bg-white/95 shadow-sm dark:border-blue-400/30 dark:bg-slate-800/90"
                    : "border-slate-200/80 bg-white/70 hover:border-blue-300/60 dark:border-slate-800/80 dark:bg-slate-800/60 dark:hover:border-blue-500/40"
                }`}
              >
                <button
                  type="button"
                  id={`faq-question-${idx}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="flex w-full cursor-pointer items-center justify-between p-5 text-left transition-colors sm:p-6"
                >
                  <span className="text-base font-semibold text-slate-900 transition-colors duration-200 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 sm:text-lg">
                    {item.q}
                  </span>
                  <span
                    className={`ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ${
                      isOpen
                        ? "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:border-blue-400/30 dark:bg-blue-950/40 dark:text-blue-400 rotate-180"
                        : "border-slate-200/80 bg-slate-100/60 text-slate-500 group-hover:border-blue-300/60 group-hover:bg-blue-50/50 group-hover:text-blue-600 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-400 dark:group-hover:border-blue-500/40 dark:group-hover:bg-blue-950/30 dark:group-hover:text-blue-400"
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>
                <div
                  id={`faq-answer-${idx}`}
                  role="region"
                  aria-labelledby={`faq-question-${idx}`}
                  className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-0 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:px-6 sm:pb-6">
                      <div className="border-t border-slate-100 pt-3.5 dark:border-slate-700/60">
                        {item.a}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
