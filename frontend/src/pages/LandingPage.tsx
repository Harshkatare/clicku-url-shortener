import { useState } from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../features/auth/auth.storage";
import { HeroSection } from "../components/landing/HeroSection";
import { PlatformStatsProof } from "../components/landing/PlatformStatsProof";
import { TechnicalMetricsStrip } from "../components/landing/TechnicalMetricsStrip";
import { FeaturesGrid } from "../components/landing/FeaturesGrid";
import { Pricing } from "../components/landing/Pricing";
import { FAQ } from "../components/landing/FAQ";
import { CTA } from "../components/landing/CTA";
import { Footer } from "../components/landing/Footer";
import { AuthModal } from "../components/auth/AuthModal";

export function LandingPage() {
  const token = getToken();
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    tab: "login" | "register";
  }>({
    isOpen: false,
    tab: "register",
  });

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleOpenLogin = () => setAuthModal({ isOpen: true, tab: "login" });
  const handleOpenRegister = () => setAuthModal({ isOpen: true, tab: "register" });
  const handleCloseModal = () => setAuthModal((prev) => ({ ...prev, isOpen: false }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased transition-colors duration-200 dark:bg-slate-900 dark:text-slate-100">
      <HeroSection onLogin={handleOpenLogin} onRegister={handleOpenRegister} />
      <PlatformStatsProof />
      <TechnicalMetricsStrip />
      <FeaturesGrid />
      <Pricing onSelectPlan={() => handleOpenRegister()} />
      <FAQ />
      <CTA onCta={handleOpenRegister} />
      <Footer onLogin={handleOpenLogin} onRegister={handleOpenRegister} />

      <AuthModal
        isOpen={authModal.isOpen}
        initialTab={authModal.tab}
        onClose={handleCloseModal}
      />
    </div>
  );
}
