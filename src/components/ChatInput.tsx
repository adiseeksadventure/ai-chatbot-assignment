"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { MAX_MESSAGE_LENGTH, CHAR_COUNTER_THRESHOLD } from "@/lib/constants";
import { useChatStore } from "@/store/chatStore";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
}

const INPUT_HEIGHT = "h-10";

function SendSpinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-bg/30 border-t-brand-bg"
      aria-hidden="true"
    />
  );
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const streamingMessageId = useChatStore((s) => s.streamingMessageId);
  const isSending = streamingMessageId !== null;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const showCounter =
    value.length >= MAX_MESSAGE_LENGTH * CHAR_COUNTER_THRESHOLD;

  const resetHeight = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "";
  };

  const adjustHeight = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "";
    const maxHeight = 120;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isSending || trimmed.length > MAX_MESSAGE_LENGTH) return;
    onSend(trimmed);
    setValue("");
    resetHeight();
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (isSending) {
      e.preventDefault();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="shrink-0 border-t border-brand-fg/10 p-4 dark:border-brand-fg-dark/10">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            id="chat-input"
            ref={inputRef}
            value={value}
            onChange={(e) => {
              if (isSending) return;
              setValue(e.target.value.slice(0, MAX_MESSAGE_LENGTH));
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question…"
            aria-busy={isSending}
            className={cn(
              INPUT_HEIGHT,
              "box-border w-full resize-none overflow-y-auto rounded-md",
              "border border-brand-fg/20 bg-brand-bg px-3 text-sm leading-5",
              "text-brand-fg placeholder:text-brand-fg/40 outline-none focus:border-brand-fg/40",
              "dark:border-brand-fg-dark/20 dark:bg-brand-bg-dark dark:text-brand-fg-dark",
              "dark:placeholder:text-brand-fg-dark/40",
              isSending && "opacity-70",
            )}
            style={{ maxHeight: 120 }}
          />
          {showCounter && (
            <span
              className={cn(
                "absolute bottom-1.5 right-2 text-[10px]",
                value.length >= MAX_MESSAGE_LENGTH
                  ? "text-brand-danger"
                  : "text-brand-fg/40 dark:text-brand-fg-dark/40",
              )}
            >
              {value.length}/{MAX_MESSAGE_LENGTH}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={isSending || !value.trim()}
          aria-label={isSending ? "Sending message" : "Send message"}
          className={cn(
            INPUT_HEIGHT,
            "inline-flex w-[72px] items-center justify-center rounded-md",
            "bg-brand-accent text-sm font-medium text-brand-bg",
            "hover:opacity-90 transition-opacity disabled:opacity-50",
          )}
        >
          {isSending ? <SendSpinner /> : "Send"}
        </button>
      </div>
    </div>
  );
}
