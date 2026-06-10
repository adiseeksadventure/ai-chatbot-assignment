"use client";

import { useChatStore } from "@/store/chatStore";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const searchQuery = useChatStore((s) => s.searchQuery);
  const setSearchQuery = useChatStore((s) => s.setSearchQuery);

  return (
    <input
      type="search"
      placeholder="Search conversations…"
      value={searchQuery}
      onChange={(e) => {
        setSearchQuery(e.target.value);
        onSearch(e.target.value);
      }}
      className={cn(
        "w-full rounded-md border border-brand-fg/20 bg-brand-bg px-3 py-2 text-sm",
        "text-brand-fg placeholder:text-brand-fg/40 outline-none",
        "focus:border-brand-fg/40",
        "dark:border-brand-fg-dark/20 dark:bg-brand-bg-dark dark:text-brand-fg-dark",
        "dark:placeholder:text-brand-fg-dark/40"
      )}
    />
  );
}
