import type { ReactNode } from "react";
import { Navbar } from "../components/Navbar";
import { PageContainer } from "../components/PageContainer";

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="hero-grid relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Atmospheric Ambient Glow Blobs */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/8 blur-3xl dark:bg-blue-500/12" />
      <div className="pointer-events-none absolute top-1/3 right-10 h-[450px] w-[450px] rounded-full bg-purple-500/8 blur-3xl dark:bg-purple-500/10" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-[400px] w-[400px] rounded-full bg-pink-500/5 blur-3xl dark:bg-pink-500/8" />

      <Navbar />
      <div className="relative z-10">
        <PageContainer>{children}</PageContainer>
      </div>
    </div>
  );
}