"use client";

import { useCallback } from "react";
import { parseStreamBuffer } from "@/lib/sse";
import { useChatStore } from "@/store/chatStore";

export function useSendMessage() {
  const sendMessage = useCallback(async (content: string) => {
    const {
      addMessage,
      appendStreamChunk,
      finalizeMessage,
      setStreamingId,
      showToast,
      triggerConversationsRefresh,
      messages,
      sessionId,
      activeProvider,
    } = useChatStore.getState();

    addMessage({ role: "user", content, timestamp: new Date() });

    const history = messages
      .filter((m) => !m.isStreaming && m.content.trim())
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    const assistantId = addMessage({
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
      providerId: activeProvider.providerId,
      modelId: activeProvider.modelId,
    });

    setStreamingId(assistantId);

    let streamFinished = false;

    const finishStream = () => {
      if (streamFinished) return;
      streamFinished = true;
      finalizeMessage(assistantId);
      setStreamingId(null);
      requestAnimationFrame(() => {
        document.getElementById("chat-input")?.focus();
      });
    };

    const processEvents = (
      events: ReturnType<typeof parseStreamBuffer>["events"]
    ) => {
      for (const event of events) {
        if (event.type === "delta") {
          appendStreamChunk(assistantId, event.text);
        } else if (event.type === "done") {
          finishStream();
        } else if (event.type === "saved") {
          triggerConversationsRefresh();
        } else if (event.type === "error") {
          showToast(event.message);
          finishStream();
        }
      }
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          sessionId,
          providerId: activeProvider.providerId,
          modelId: activeProvider.modelId,
          history: [...history, { role: "user" as const, content }],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ?? "Request failed"
        );
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const parsed = parseStreamBuffer(buffer);
          buffer = parsed.remainder;
          processEvents(parsed.events);
        }

        if (done) {
          if (buffer.trim()) {
            const parsed = parseStreamBuffer(`${buffer}\n\n`);
            processEvents(parsed.events);
          }
          finishStream();
          break;
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      showToast(message);
      finishStream();
    }
  }, []);

  return { sendMessage };
}
