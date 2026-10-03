import { useState, useEffect } from "react";
import {
  AVATAR_PRESETS,
  getInitials,
  getStoredAvatarPreset,
  type AvatarPreset,
  type AvatarSize,
} from "../../features/user/avatar.utils";

const SIZE_CLASSES: Record<AvatarSize, { box: string; text: string }> = {
  sm: { box: "h-8 w-8", text: "text-xs font-semibold" },
  md: { box: "h-9 w-9", text: "text-xs font-bold" },
  lg: { box: "h-12 w-12", text: "text-sm font-bold" },
  xl: { box: "h-16 w-16", text: "text-xl font-bold" },
};

export interface AvatarProps {
  name?: string | null;
  size?: AvatarSize;
  preset?: AvatarPreset;
  className?: string;
}

export function Avatar({
  name,
  size = "md",
  preset,
  className = "",
}: AvatarProps) {
  const [activePreset, setActivePreset] = useState<AvatarPreset>(
    preset ?? getStoredAvatarPreset()
  );

  useEffect(() => {
    if (preset) {
      setActivePreset(preset);
      return;
    }

    function syncPreset() {
      setActivePreset(getStoredAvatarPreset());
    }

    window.addEventListener("avatar-preset-changed", syncPreset);
    window.addEventListener("storage", syncPreset);

    return () => {
      window.removeEventListener("avatar-preset-changed", syncPreset);
      window.removeEventListener("storage", syncPreset);
    };
  }, [preset]);

  const config = AVATAR_PRESETS[activePreset] ?? AVATAR_PRESETS.ocean;
  const sizeStyles = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  const initials = getInitials(name);

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full text-white shadow-xs select-none shrink-0 ${sizeStyles.box} ${sizeStyles.text} ${config.gradientClass} ${className}`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
