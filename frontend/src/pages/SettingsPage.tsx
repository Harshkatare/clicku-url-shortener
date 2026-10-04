import { useQuery } from "@tanstack/react-query";
import { getMe } from "../features/auth/auth.api";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ProfileCard } from "../components/settings/ProfileCard";
import { AvatarCard } from "../components/settings/AvatarCard";
import { SecurityCard } from "../components/settings/SecurityCard";
import { DangerZoneCard } from "../components/settings/DangerZoneCard";
import { useOnboarding } from "../hooks/useOnboarding";
import { OnboardingModal } from "../components/onboarding/OnboardingModal";

export function SettingsPage() {
  const {
    isOpen: isTourOpen,
    step: tourStep,
    nextStep: onTourNext,
    prevStep: onTourPrev,
    closeTour: onTourClose,
    restartTour,
  } = useOnboarding();

  const { data: meData } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
  });

  const user = meData?.data;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your personal profile, appearance preferences, and security credentials.
          </p>
        </div>

        <ProfileCard user={user} />
        <AvatarCard userName={user?.name} />
        <SecurityCard />

        {/* Product Tour Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Product Tour
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Need a refresher on core features? Relaunch the 3-step guided walkthrough.
          </p>
          <button
            type="button"
            onClick={restartTour}
            className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Restart Product Tour
          </button>
        </div>

        <DangerZoneCard />
      </div>

      {/* Onboarding Tour Modal */}
      <OnboardingModal
        isOpen={isTourOpen}
        step={tourStep}
        onNext={onTourNext}
        onPrev={onTourPrev}
        onClose={onTourClose}
      />
    </DashboardLayout>
  );
}
