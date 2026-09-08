import { useState, useEffect, useCallback } from "react";

export function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("dark");
      if (stored !== null) return stored === "true";
    } catch {
      // Ignore storage access errors in private/restricted environments
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Listen for device or browser system theme changes in real time
  // but prioritize explicit user selection if they have manually toggled the theme
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      try {
        const userManual = localStorage.getItem("theme_user_selected");
        if (userManual === "true") return;
      } catch {
        // Ignore storage access errors
      }
      setDark(e.matches);
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);

    // Explicitly opt out of Chromium's Auto-Darkening shader across all states
    document.documentElement.style.setProperty("color-scheme", "only light");

    try {
      localStorage.setItem("dark", String(dark));
    } catch {
      // Ignore storage access errors in private/restricted environments
    }

    // Keep <meta name="color-scheme" content="only light"> locked
    let colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
    if (!colorSchemeMeta) {
      colorSchemeMeta = document.createElement("meta");
      colorSchemeMeta.setAttribute("name", "color-scheme");
      document.head.appendChild(colorSchemeMeta);
    }
    colorSchemeMeta.setAttribute("content", "only light");

    // Synchronize <meta name="theme-color"> for mobile Chrome address bar
    let themeMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeMeta) {
      themeMeta = document.createElement("meta");
      themeMeta.setAttribute("name", "theme-color");
      document.head.appendChild(themeMeta);
    }
    themeMeta.setAttribute("content", dark ? "#020617" : "#ffffff");
  }, [dark]);

  const toggle = useCallback(() => {
    try {
      localStorage.setItem("theme_user_selected", "true");
    } catch {
      // Ignore storage access errors
    }
    setDark((d) => !d);
  }, []);

  return { dark, toggle };
}
