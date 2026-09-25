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

    // Standard W3C color-scheme values with 'only' keyword to prevent Chromium auto-darkening shaders while ensuring native OS elements and scrollbars adapt correctly
    const schemeValue = dark ? "only dark" : "only light";
    document.documentElement.style.setProperty("color-scheme", schemeValue);

    try {
      localStorage.setItem("dark", String(dark));
    } catch {
      // Ignore storage access errors in private/restricted environments
    }

    // Synchronize <meta name="color-scheme">
    let colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
    if (!colorSchemeMeta) {
      colorSchemeMeta = document.createElement("meta");
      colorSchemeMeta.setAttribute("name", "color-scheme");
      document.head.appendChild(colorSchemeMeta);
    }
    colorSchemeMeta.setAttribute("content", schemeValue);

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
