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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);

    // W3C 'only' keyword instructs Chromium's rendering engine to never apply auto-darkening shaders
    const schemeValue = dark ? "only dark" : "only light";
    document.documentElement.style.colorScheme = schemeValue;

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

  const toggle = useCallback(() => setDark((d) => !d), []);

  return { dark, toggle };
}

