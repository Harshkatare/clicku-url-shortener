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
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setDark(e.matches);
      try {
        localStorage.setItem("dark", String(e.matches));
      } catch {
        // Ignore storage access errors in private/restricted environments
      }
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);

    // Standard W3C color-scheme values natively supported across all mobile and desktop engines
    const schemeValue = dark ? "dark" : "light";
    document.documentElement.style.colorScheme = schemeValue;

    try {
      localStorage.setItem("dark", String(dark));
    } catch {
      // Ignore storage access errors in private/restricted environments
    }

    // Synchronize <meta name="theme-color"> for mobile Chrome address bar
    let themeMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeMeta) {
      themeMeta = document.createElement("meta");
      themeMeta.setAttribute("name", "theme-color");
      document.head.appendChild(themeMeta);
    }
    themeMeta.setAttribute("content", dark ? "#020617" : "#ffffff");
  }, [dark]);

  const toggle = useCallback(() => setDark((d) => !d), []);

  return { dark, toggle };
}
