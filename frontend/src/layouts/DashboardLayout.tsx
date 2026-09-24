import type { ReactNode } from "react";
import { AppShell } from "../components/layout/AppShell";
import { PageContainer } from "../components/PageContainer";

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <AppShell />
      <div className="relative z-10 pt-16">
        <PageContainer>{children}</PageContainer>
      </div>
    </div>
  );
}