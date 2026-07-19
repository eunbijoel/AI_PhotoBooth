"use client";

import { useEffect } from "react";
import { useBoothStore } from "@/store/booth-store";

/** Apply persisted theme class before paint flicker settles. */
export function ThemeBoot() {
  const theme = useBoothStore((s) => s.theme);
  const hydratePreferences = useBoothStore((s) => s.hydratePreferences);

  useEffect(() => {
    hydratePreferences();
  }, [hydratePreferences]);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return null;
}
