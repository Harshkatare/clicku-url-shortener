import { useEffect } from "react";
import { Link } from "react-router-dom";
import { LegalPageNavbar } from "../components/common/LegalPageNavbar";
import { Footer } from "../components/landing/Footer";

export interface TocItem {
  id: string;
  label: string;
}

export interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  tocItems: TocItem[];
  seeAlso: {
    label: string;
    to: string;
  };
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  lastUpdated,
  tocItems,
  seeAlso,
  children,
}: LegalPageLayoutProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 print:bg-white print:text-black">
      <div>
        <LegalPageNavbar />

        {/* Hero Header & Breadcrumb */}
        <div className="border-b border-slate-200/80 bg-white/50 py-8 dark:border-slate-800/80 dark:bg-slate-900/40 print:bg-transparent print:border-none print:py-0">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 print:hidden">
              <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-white">{title}</span>
            </nav>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl print:text-2xl print:mt-0">
              {title}
            </h1>
            <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              Last updated: {lastUpdated}
            </p>

            {/* Mobile Horizontal Jump Links */}
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1 text-xs lg:hidden print:hidden scrollbar-none">
              {tocItems.map((item, idx) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-600 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
                >
                  {idx + 1}. {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Content Body with Sticky TOC on Desktop */}
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-12 print:max-w-none print:p-0">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            {/* Desktop Sticky Sidebar TOC */}
            <aside className="hidden lg:col-span-4 lg:block print:hidden">
              <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white/70 p-5 backdrop-blur-xs dark:border-slate-800/80 dark:bg-slate-900/60">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Contents
                </h2>
                <nav className="mt-4 space-y-1.5 text-xs">
                  {tocItems.map((item, idx) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block rounded-lg px-2.5 py-1.5 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                    >
                      {idx + 1}. {item.label}
                    </a>
                  ))}
                </nav>

                <div className="mt-6 border-t border-slate-200/70 pt-4 dark:border-slate-800/70">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Related Document:
                  </span>
                  <Link
                    to={seeAlso.to}
                    className="mt-1 block text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {seeAlso.label} &rarr;
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main Content Column */}
            <main className="lg:col-span-8">
              <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-slate-600 dark:text-slate-300 space-y-10 print:text-black">
                {children}

                {/* Footer Cross-Link & Related Notice */}
                <div className="border-t border-slate-200/80 pt-8 dark:border-slate-800/80 print:hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300">
                    <div>
                      <p className="font-semibold">Looking for the other legal document?</p>
                      <p className="text-blue-700 dark:text-blue-400">
                        Read our {seeAlso.label} for complete terms governing the ShortLynk platform.
                      </p>
                    </div>
                    <Link
                      to={seeAlso.to}
                      className="shrink-0 rounded-lg bg-blue-600 px-3.5 py-2 font-medium text-white shadow-xs transition hover:bg-blue-700 text-center"
                    >
                      View {seeAlso.label}
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
