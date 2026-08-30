import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 dark:bg-slate-950 transition-colors duration-200">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-10 shadow-md dark:border-slate-800 dark:bg-slate-900 transition-colors duration-200">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <img src="/logo.svg" alt="Shortlynk" className="h-9 w-9 select-none" />
            <h1 className="select-none text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              Shortlynk
            </h1>
          </div>

          <h2 className="mt-5 text-3xl font-semibold text-gray-900 dark:text-slate-100">
            {title}
          </h2>

          <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-gray-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}