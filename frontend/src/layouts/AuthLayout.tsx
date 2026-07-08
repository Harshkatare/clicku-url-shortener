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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-10 shadow-md">
        <div className="mb-8 text-center">
          <h1 className="select-none text-4xl font-bold tracking-tight text-blue-600">
            ClickU
          </h1>

          <h2 className="mt-5 text-3xl font-semibold text-gray-900">
            {title}
          </h2>

          <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-gray-500">
            {subtitle}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}