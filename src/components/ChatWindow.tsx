"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/chatStore";
import { useShallow } from "zustand/react/shallow";
import { MessageBubble } from "./MessageBubble";

export function ChatWindow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const messageIds = useChatStore(
    useShallow((s) => s.messages.map((m) => m.id))
  );
  const streamingContentLength = useChatStore((s) => {
    if (!s.streamingMessageId) return 0;
    return (
      s.messages.find((m) => m.id === s.streamingMessageId)?.content.length ?? 0
    );
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messageIds.length, streamingContentLength]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      aria-label="Conversation messages"
    >
      {messageIds.length === 0 ? (
        <p className="text-center text-sm text-brand-fg/50 dark:text-brand-fg-dark/50 mt-12">
          Ask anything. Your conversation history lives in the sidebar.
        </p>
      ) : (
        messageIds.map((id) => <MessageBubble key={id} messageId={id} />)
      )}
    </div>
  );
}
