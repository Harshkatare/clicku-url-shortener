import { Link, useLocation } from "react-router-dom";
import { DashboardLayout } from "../layouts/DashboardLayout";

interface FeaturePreview {
  title: string;
  description: string;
  icon: string;
}

export function ComingSoonPage() {
  const location = useLocation();
  const isAnalytics = location.pathname.startsWith("/analytics");
  const isSettings = location.pathname.startsWith("/settings");

  const pageConfig = isAnalytics
    ? {
        category: "Analytics Studio",
        title: "Deep Traffic Intelligence & Telemetry",
        subtitle:
          "Real-time click streams, referrer attribution, geographical breakdown, and UTM parameter performance tracking are coming soon.",
        accentColor: "from-blue-600 to-cyan-500",
        badgeBg: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
        features: [
          {
            title: "Live Click Stream Telemetry",
            description: "Monitor visitor hits in sub-second real-time with latency and referrer tracking.",
            icon: "M13 10V3L4 14h7v7l9-11h-7z",
          },
          {
            title: "Geo-Location Heatmaps",
            description: "Understand where your audience originates across countries, regions, and cities.",
            icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
          },
          {
            title: "Device & UTM Attribution",
            description: "Break down performance across operating systems, browsers, and marketing campaigns.",
            icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
          },
        ] as FeaturePreview[],
      }
    : isSettings
    ? {
        category: "Workspace Preferences",
        title: "Account & Infrastructure Settings",
        subtitle:
          "Custom vanity domains, programmatic developer API credentials, webhook events, and team security governance are coming soon.",
        accentColor: "from-indigo-600 to-purple-500",
        badgeBg: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60",
        features: [
          {
            title: "Custom Branded Domains",
            description: "Attach apex domains or custom CNAMEs with automated SSL certificate provisioning.",
            icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
          },
          {
            title: "Developer API & Webhooks",
            description: "Generate scoped API keys to shorten, track, and listen for URL events programmatically.",
            icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
          },
          {
            title: "Team Security & Governance",
            description: "Multi-seat workspace collaboration, two-factor authentication, and audit logs.",
            icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
          },
        ] as FeaturePreview[],
      }
    : {
        category: "Module In Progress",
        title: "Feature Under Development",
        subtitle: "We are crafting this capability for your workspace and it will be available soon.",
        accentColor: "from-blue-600 to-indigo-600",
        badgeBg: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
        features: [] as FeaturePreview[],
      };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl py-8 sm:py-12">
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 sm:p-10 shadow-xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/90 transition-colors duration-200">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/15" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/15" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold ${pageConfig.badgeBg} mb-5`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <span>{pageConfig.category} • Coming Soon</span>
            </div>

            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {pageConfig.title}
            </h1>

            {/* Subtitle */}
            <p className="mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
              {pageConfig.subtitle}
            </p>

            {/* Feature Previews Grid */}
            {pageConfig.features.length > 0 && (
              <div className="mt-8 grid w-full gap-4 sm:grid-cols-3 text-left">
                {pageConfig.features.map((feat) => (
                  <div
                    key={feat.title}
                    className="flex flex-col rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800/70 dark:bg-slate-800/50 backdrop-blur-xs transition hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={feat.icon} />
                      </svg>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">{feat.title}</h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Action Return Button */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
              >
                <span>←</span>
                <span>Return to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
