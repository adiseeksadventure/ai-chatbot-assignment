"use client";

import { useState } from "react";
import type { LLMModel } from "@/lib/llm";
import { useSendMessage } from "@/hooks/useSendMessage";
import { cn } from "@/lib/utils";
import { ChatInput } from "./ChatInput";
import { ChatWindow } from "./ChatWindow";
import { ConversationSidebar } from "./ConversationSidebar";
import { ModelSelector } from "./ModelSelector";
import { ThemeToggle } from "./ThemeToggle";

interface ChatLayoutProps {
  models: Array<LLMModel & { providerId: string; providerName: string }>;
}

export function ChatLayout({ models }: ChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sendMessage } = useSendMessage();

  return (
    <div className="flex h-screen bg-brand-bg dark:bg-brand-bg-dark">
      <ConversationSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex flex-1 flex-col min-w-0">
        <header
          className={cn(
            "flex h-14 shrink-0 items-center justify-between gap-4",
            "border-b border-brand-fg/10 px-4",
            "dark:border-brand-fg-dark/10"
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className={cn(
                "h-9 shrink-0 rounded-md border border-brand-fg/20 px-3 text-sm lg:hidden",
                "dark:border-brand-fg-dark/20"
              )}
              aria-label="Open sidebar"
            >
              Menu
            </button>
            <h1 className="truncate text-sm font-medium">FAQ Assistant</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ModelSelector models={models} />
            <ThemeToggle />
          </div>
        </header>
        <ChatWindow />
        <ChatInput onSend={sendMessage} />
      </main>
    </div>
  );
}
