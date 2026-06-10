"use client";

import { useChatStore } from "@/store/chatStore";
import { cn } from "@/lib/utils";

const controlClass = cn(
  "h-9 rounded-md border border-brand-fg/20 bg-brand-bg px-3 text-sm",
  "text-brand-fg outline-none focus:border-brand-fg/40",
  "dark:border-brand-fg-dark/20 dark:bg-brand-bg-dark dark:text-brand-fg-dark"
);

export function ThemeToggle() {
  const isDarkMode = useChatStore((s) => s.isDarkMode);
  const setDarkMode = useChatStore((s) => s.setDarkMode);

  return (
    <button
      type="button"
      onClick={() => setDarkMode(!isDarkMode)}
      className={cn(
        controlClass,
        "text-brand-fg/70 hover:text-brand-fg transition-colors",
        "dark:text-brand-fg-dark/70 dark:hover:text-brand-fg-dark"
      )}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? "Light" : "Dark"}
    </button>
  );
}
