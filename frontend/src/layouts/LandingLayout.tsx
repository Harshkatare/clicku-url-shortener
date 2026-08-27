import type { ReactNode } from "react";
import { LandingNavbar } from "../components/LandingNavbar";

type LandingLayoutProps = {
    children: ReactNode;
};

export function LandingLayout({ children }: LandingLayoutProps) {
    return (
        <>
          <LandingNavbar />
          <main className="min-h-screen bg-gray-50">{children}</main>
        </>
    );
}