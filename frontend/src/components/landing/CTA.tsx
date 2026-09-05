import { Link } from "react-router-dom";
import { Logo } from "../common/Logo";
import { useScrollReveal } from "../../hooks/useScrollReveal";

interface CTAProps {
  onCta?: () => void;
}

export function CTA({ onCta }: CTAProps) {
  const ref = useScrollReveal<HTMLDivElement>(0);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div
        ref={ref}
        className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 px-8 py-16 text-center text-white shadow-2xl"
      >
        {/* Watermark Brand Mark */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 select-none scale-[0.55] sm:scale-75 md:scale-100 transition-transform duration-200">
          <Logo size={420} variant="tilt" color="white" />
        </div>

        {/* Prototype Clean Geometric Circles */}
        <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 sm:h-64 sm:w-64 translate-x-8 -translate-y-8 sm:translate-x-16 sm:-translate-y-16 rounded-full bg-white/10 transition-all duration-200" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 sm:h-48 sm:w-48 -translate-x-6 translate-y-6 sm:-translate-x-8 sm:translate-y-8 rounded-full bg-white/10 transition-all duration-200" />

        {/* Foreground Content */}
        <div className="relative z-10 mx-auto max-w-3xl">
          {/* Section Tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            <span className="text-xs">✦</span>
            Instant Deployment
          </div>

          <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
            Ready to shorten smarter?
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-blue-100">
            Join thousands of creators, developers, and growing teams who
            trust ShortLynk for sub-15ms edge redirects and real-time telemetry.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3">
            {onCta ? (
              <button
                type="button"
                onClick={onCta}
                className="cursor-pointer rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-blue-600 shadow-lg shadow-black/15 transition hover:bg-blue-50 active:scale-[0.98]"
              >
                Get Started Free
              </button>
            ) : (
              <Link
                to="/register"
                className="cursor-pointer rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-blue-600 shadow-lg shadow-black/15 transition hover:bg-blue-50 active:scale-[0.98]"
              >
                Get Started Free
              </Link>
            )}

            {/* Friction-Reduction Guarantee Subtext */}
            <p className="text-sm font-medium text-blue-100">
              ⚡ 10-second setup · No credit card required
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
