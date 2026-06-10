"use client";

import { memo } from "react";
import { useMessage } from "@/store/chatStore";
import { cn, formatDate } from "@/lib/utils";

interface MessageBubbleProps {
  messageId: string;
}

function StreamingLoader() {
  return (
    <div
      className="flex min-h-[20px] items-center gap-2.5 py-0.5"
      role="status"
      aria-label="Assistant is responding"
    >
      <div className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-accent [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-accent [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-accent" />
      </div>
      <span className="text-xs text-brand-fg/50 dark:text-brand-fg-dark/50">
        Thinking…
      </span>
    </div>
  );
}

function MessageBubbleComponent({ messageId }: MessageBubbleProps) {
  const message = useMessage(messageId);

  if (!message) return null;

  const isUser = message.role === "user";
  const isWaitingForStream =
    message.isStreaming && message.content.trim().length === 0;

  return (
    <div
      className={cn(
        "flex max-w-[85%] flex-col gap-1",
        isUser ? "ml-auto items-end" : "mr-auto items-start"
      )}
    >
      <span className="text-[10px] uppercase tracking-wide text-brand-fg/40 dark:text-brand-fg-dark/40">
        {isUser ? "You" : "Assistant"}
      </span>
      <div
        className={cn(
          "min-w-[120px] rounded-md border border-brand-fg/10 px-3 py-2 text-sm leading-relaxed select-text",
          "dark:border-brand-fg-dark/10",
          isUser
            ? "bg-brand-fg/5 dark:bg-brand-fg-dark/5"
            : "bg-brand-bg dark:bg-brand-bg-dark",
          isWaitingForStream && "py-3"
        )}
      >
        {isWaitingForStream ? (
          <StreamingLoader />
        ) : (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )}
      </div>
      <span className="text-[10px] text-brand-fg/30 dark:text-brand-fg-dark/30">
        {formatDate(message.timestamp)}
      </span>
      {!isUser && !message.isStreaming && message.modelId && (
        <span className="font-mono text-[10px] text-brand-fg/30 dark:text-brand-fg-dark/30">
          {message.modelId}
        </span>
      )}
    </div>
  );
}

export const MessageBubble = memo(MessageBubbleComponent);
