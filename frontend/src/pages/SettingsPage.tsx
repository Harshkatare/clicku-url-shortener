import { useQuery } from "@tanstack/react-query";
import { getMe } from "../features/auth/auth.api";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ProfileCard } from "../components/settings/ProfileCard";
import { AvatarCard } from "../components/settings/AvatarCard";
import { SecurityCard } from "../components/settings/SecurityCard";

export function SettingsPage() {
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
      </div>
    </DashboardLayout>
  );
}
