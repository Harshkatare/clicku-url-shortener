import type { ReactNode } from "react";
import { LandingNavbar } from "../components/LandingNavbar";

type LandingLayoutProps = {
  children: ReactNode;
};

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <LandingNavbar />
      <main>{children}</main>
    </div>
  );
}