import type { ReactNode } from "react";
import { Navbar } from "../components/Navbar";
import { PageContainer } from "../components/PageContainer";

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <>
      <Navbar />

      <PageContainer>{children}</PageContainer>
    </>
  );
}