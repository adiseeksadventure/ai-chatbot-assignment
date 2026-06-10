"use client";

import { useChatStore } from "@/store/chatStore";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function Toast() {
  const toast = useChatStore((s) => s.toast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      useChatStore.getState().clearToast();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      role="alert"
      className={cn(
        "fixed bottom-4 right-4 z-50 max-w-sm rounded-md border px-4 py-3 text-sm",
        "border-brand-fg/20 bg-brand-bg text-brand-fg",
        "dark:border-brand-fg-dark/20 dark:bg-brand-bg-dark dark:text-brand-fg-dark",
        toast.type === "error" && "border-brand-danger/40"
      )}
    >
      {toast.message}
    </div>
  );
}
