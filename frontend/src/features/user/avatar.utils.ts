export type AvatarPreset =
  | "ocean"
  | "sunset"
  | "emerald"
  | "lavender"
  | "amber"
  | "slate";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

export interface AvatarPresetConfig {
  id: AvatarPreset;
  label: string;
  gradientClass: string;
}

export const AVATAR_PRESETS: Record<AvatarPreset, AvatarPresetConfig> = {
  ocean: {
    id: "ocean",
    label: "Ocean",
    gradientClass: "bg-gradient-to-br from-blue-500 to-purple-600",
  },
  sunset: {
    id: "sunset",
    label: "Sunset",
    gradientClass: "bg-gradient-to-br from-amber-500 to-rose-500",
  },
  emerald: {
    id: "emerald",
    label: "Emerald",
    gradientClass: "bg-gradient-to-br from-emerald-500 to-teal-600",
  },
  lavender: {
    id: "lavender",
    label: "Lavender",
    gradientClass: "bg-gradient-to-br from-purple-500 to-indigo-500",
  },
  amber: {
    id: "amber",
    label: "Amber",
    gradientClass: "bg-gradient-to-br from-amber-500 to-orange-600",
  },
  slate: {
    id: "slate",
    label: "Slate",
    gradientClass: "bg-gradient-to-br from-slate-600 to-slate-800",
  },
};

export const AVATAR_STORAGE_KEY = "shortlynk_avatar_preset";
export const DEFAULT_AVATAR_PRESET: AvatarPreset = "ocean";

export function getInitials(name?: string | null): string {
  if (!name) return "U";
  const trimmed = name.trim();
  if (!trimmed) return "U";

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function getStoredAvatarPreset(): AvatarPreset {
  try {
    const stored = localStorage.getItem(AVATAR_STORAGE_KEY) as AvatarPreset | null;
    if (stored && stored in AVATAR_PRESETS) {
      return stored;
    }
  } catch {
    // Return default on storage access failures (e.g. private mode)
  }
  return DEFAULT_AVATAR_PRESET;
}

export function setStoredAvatarPreset(preset: AvatarPreset): void {
  try {
    localStorage.setItem(AVATAR_STORAGE_KEY, preset);
    window.dispatchEvent(new Event("avatar-preset-changed"));
  } catch {
    // Ignore storage write failures
  }
}
