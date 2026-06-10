"use client";

import { useChatStore } from "@/store/chatStore";
import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isDarkMode = useChatStore((s) => s.isDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  return <>{children}</>;
}
