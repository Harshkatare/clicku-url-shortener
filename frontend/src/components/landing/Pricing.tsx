import { Link } from "react-router-dom";
import { useScrollReveal } from "../../hooks/useScrollReveal";

interface PricingPlan {
  id: "free" | "pro";
  name: string;
  badge: string;
  badgeStyle: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  ctaText: string;
  subtext?: string;
  featured?: boolean;
  disabled?: boolean;
}

const PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free Forever",
    badge: "Free Tier",
    badgeStyle:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300",
    price: "₹0",
    period: "/ forever",
    description:
      "Perfect for individuals, developers, and creators getting started with clean, reliable short links.",
    features: [
      "Unlimited shortened links",
      "Direct sub-15ms edge redirects (302)",
      "Real-time atomic click counter",
      "3 custom branded aliases included",
      "Deep audience telemetry for 3 links",
      "1 dynamic destination link edit",
      "1 custom vector QR code download",
      "Zero ads, popups, or countdown delays",
    ],
    ctaText: "Get Started Free",
    subtext: "⚡ 10-second setup · No credit card required",
    featured: false,
    disabled: false,
  },
  {
    id: "pro",
    name: "Pro Tier",
    badge: "Pro Tier",
    badgeStyle:
      "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-400",
    price: "₹499",
    period: "/ month",
    description:
      "For growing brands, marketers, and power users who need complete control and unlimited scale.",
    features: [
      "Everything in Free, plus:",
      "Custom branded domains (with free SSL)",
      "Unlimited custom branded slugs & aliases",
      "Full audience telemetry (referrers, geos, devices)",
      "Unlimited dynamic destination link edits",
      "High-res vector QR codes with logo watermark",
      "UTM campaign builder & parameter preservation",
      "Raw analytics data export (CSV & JSON)",
      "Team workspaces & role-based permissions",
      "99.99% edge routing SLA & priority support",
    ],
    ctaText: "Coming Soon",
    subtext: "Launching soon · Early access privileges",
    featured: true,
    disabled: true,
  },
];

interface PricingProps {
  onSelectPlan?: (planId: "free" | "pro") => void;
}

export function Pricing({ onSelectPlan }: PricingProps) {
  const headerRef = useScrollReveal<HTMLDivElement>(0);
  const cardsRef = useScrollReveal<HTMLDivElement>(0.08);

  return (
    <section id="pricing" className="relative pt-24 pb-14 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div ref={headerRef} className="mx-auto mb-14 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-400">
            <span className="text-xs">✦</span>
            Simple, Transparent Pricing
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
            Start free.{" "}
            <span className="gradient-primary">Scale as you grow.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
            No hidden fees, no credit card required. Everything you need to
            shorten, brand, and track links today.
          </p>
        </div>

        {/* 2-Card Centered Grid */}
        <div
          ref={cardsRef}
          className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2 items-stretch"
        >
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`card-hover relative flex flex-col justify-between rounded-2xl p-8 backdrop-blur-sm transition-all duration-300 ${
                plan.featured
                  ? "border-2 border-blue-500/80 bg-white/90 shadow-md dark:border-blue-500/60 dark:bg-slate-800/80 dark:shadow-blue-950/20"
                  : "border border-slate-200/80 bg-white/80 shadow-sm dark:border-slate-800/80 dark:bg-slate-800/60"
              }`}
            >
              {/* Featured Floating Badge */}
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-0.5 text-[11px] font-semibold tracking-wide text-white shadow-sm">
                  Most Popular
                </div>
              )}

              {/* Decorative Corner Glow Blob for Featured Plan */}
              {plan.featured && (
                <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl dark:bg-blue-400/10" />
              )}

              <div>
                {/* Plan Badge & Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-semibold ${plan.badgeStyle}`}
                  >
                    {plan.badge}
                  </span>
                </div>

                {/* Price Display */}
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {plan.period}
                  </span>
                </div>

                {/* Plan Description */}
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {plan.description}
                </p>

                {/* Divider Line */}
                <div className="my-6 border-t border-slate-200/80 dark:border-slate-700/60" />

                {/* Features Checklist */}
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature) => {
                    const isHeader = feature.endsWith(":");
                    return (
                      <li
                        key={feature}
                        className={`flex items-start gap-2.5 ${
                          isHeader
                            ? "font-semibold text-slate-800 dark:text-slate-200"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {!isHeader && (
                          <svg
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                              plan.featured
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        <span>{feature}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8">
                {plan.disabled ? (
                  <button
                    disabled
                    aria-label="Pro plan coming soon"
                    className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100/90 py-3 text-sm font-semibold text-slate-400 shadow-xs dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-500"
                  >
                    <svg
                      className="h-3.5 w-3.5 opacity-60"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    {plan.ctaText}
                  </button>
                ) : onSelectPlan ? (
                  <button
                    onClick={() => onSelectPlan(plan.id)}
                    className="w-full cursor-pointer rounded-xl bg-blue-600 py-3 text-center text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 hover:shadow-lg dark:bg-blue-600 dark:hover:bg-blue-500"
                  >
                    {plan.ctaText}
                  </button>
                ) : (
                  <Link
                    to="/register"
                    className="block w-full cursor-pointer rounded-xl bg-blue-600 py-3 text-center text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 hover:shadow-lg dark:bg-blue-600 dark:hover:bg-blue-500"
                  >
                    {plan.ctaText}
                  </Link>
                )}

                {plan.subtext && (
                  <p className="mt-2.5 text-center text-xs text-slate-500 dark:text-slate-400">
                    {plan.subtext}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
