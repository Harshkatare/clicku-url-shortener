import { useState } from "react";
import {
  AVATAR_PRESETS,
  getStoredAvatarPreset,
  setStoredAvatarPreset,
  type AvatarPreset,
} from "../../features/user/avatar.utils";
import { Avatar } from "../common/Avatar";

interface AvatarCardProps {
  userName?: string;
}

export function AvatarCard({ userName }: AvatarCardProps) {
  const [selectedPreset, setSelectedPreset] = useState<AvatarPreset>(
    getStoredAvatarPreset()
  );

  function handleSelectPreset(preset: AvatarPreset) {
    setSelectedPreset(preset);
    setStoredAvatarPreset(preset);
  }

  const presetsList = Object.values(AVATAR_PRESETS);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 transition-colors">
      <div className="mb-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Avatar Customization
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Choose a gradient style for your profile avatar.
        </p>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* Live Preview */}
        <div className="flex flex-col items-center gap-2 sm:border-r sm:border-slate-200 sm:pr-8 sm:dark:border-slate-800">
          <Avatar name={userName} size="xl" preset={selectedPreset} />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Preview
          </span>
        </div>

        {/* Swatch Selector */}
        <div className="flex-1">
          <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Color Preset
          </span>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {presetsList.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id)}
                  aria-pressed={isSelected}
                  className={`group flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-2.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30"
                      : "border-slate-200 bg-slate-50/50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded-full shadow-xs ${preset.gradientClass} ring-2 ring-offset-2 transition ${
                      isSelected
                        ? "ring-blue-500 ring-offset-white dark:ring-offset-slate-900"
                        : "ring-transparent ring-offset-transparent group-hover:scale-105"
                    }`}
                  />
                  <span
                    className={`text-[11px] font-medium leading-none ${
                      isSelected
                        ? "font-semibold text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
