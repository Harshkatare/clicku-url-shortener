import type { ReactNode } from "react";
import { Navbar } from "../components/Navbar";
import { PageContainer } from "../components/PageContainer";

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <PageContainer>{children}</PageContainer>
    </div>
  );
}