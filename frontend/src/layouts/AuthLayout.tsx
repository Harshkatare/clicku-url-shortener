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
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-10 shadow-lg">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-blue-600">
            ClickU
          </h1>

          <h2 className="mt-6 text-2xl font-semibold text-gray-900">
            {title}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {subtitle}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}