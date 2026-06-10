"use client";

import { useCallback, useEffect, useRef } from "react";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import { useChatStore } from "@/store/chatStore";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { ConversationsResponse } from "@/types";
import { SearchBar } from "./SearchBar";

interface ConversationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConversationSidebar({
  isOpen,
  onClose,
}: ConversationSidebarProps) {
  const conversations = useChatStore((s) => s.conversations);
  const refreshNonce = useChatStore((s) => s.conversationsRefreshNonce);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchConversations = useCallback(async (search = "") => {
    try {
      const params = new URLSearchParams({ search, page: "1", limit: "20" });
      const res = await fetch(`/api/conversations?${params}`);
      if (!res.ok) throw new Error("Failed to load conversations");
      const data = (await res.json()) as ConversationsResponse;
      useChatStore.getState().setConversations(data.conversations);
    } catch {
      useChatStore.getState().showToast("Could not load conversation history");
    }
  }, []);

  useEffect(() => {
    fetchConversations(useChatStore.getState().searchQuery);
  }, [fetchConversations, refreshNonce]);

  const handleSearch = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchConversations(query);
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleLoad = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (!res.ok) throw new Error("Failed to load conversation");
      const data = await res.json();
      useChatStore.getState().loadConversation(data.messages, data.sessionId);
      onClose();
    } catch {
      useChatStore.getState().showToast("Could not load conversation");
    }
  };

  const handleDelete = async (id: string) => {
    const { streamingMessageId, sessionId, conversations: current } =
      useChatStore.getState();

    if (streamingMessageId) {
      useChatStore.getState().showToast("Wait for the current response to finish");
      return;
    }

    if (!confirm("Delete this conversation?")) return;

    const target = current.find((c) => c._id === id);
    const isActiveChat = target?.sessionId === sessionId;

    try {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Failed to delete");
      }

      useChatStore
        .getState()
        .setConversations(current.filter((c) => c._id !== id));

      if (isActiveChat) {
        useChatStore.getState().clearSession();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not delete conversation";
      useChatStore.getState().showToast(message);
      fetchConversations(useChatStore.getState().searchQuery);
    }
  };

  const handleNew = () => {
    useChatStore.getState().clearSession();
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-brand-fg/20 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-30 flex w-[280px] flex-col",
          "border-r border-brand-fg/10 bg-brand-bg dark:border-brand-fg-dark/10 dark:bg-brand-bg-dark",
          "transform transition-transform lg:transform-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-brand-fg/10 p-4 dark:border-brand-fg-dark/10">
          <h2 className="text-sm font-medium">History</h2>
          <button
            type="button"
            onClick={handleNew}
            className="rounded-md bg-brand-accent px-2 py-1 text-xs text-brand-bg"
          >
            New
          </button>
        </div>
        <div className="p-3">
          <SearchBar onSearch={handleSearch} />
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-brand-fg/40 dark:text-brand-fg-dark/40">
              No conversations yet
            </p>
          ) : (
            <ul>
              {conversations.map((conv) => (
                <li
                  key={conv._id}
                  className="group border-b border-brand-fg/5 dark:border-brand-fg-dark/5 hover:bg-brand-fg/5 dark:hover:bg-brand-fg-dark/5"
                >
                  <button
                    type="button"
                    onClick={() => handleLoad(conv._id)}
                    className={cn(
                      "w-full px-4 py-3 text-left text-sm")}
                  >
                    <p className="truncate font-medium">{conv.title}</p>
                    <p className="mt-1 truncate text-[10px] text-brand-fg/40 dark:text-brand-fg-dark/40">
                      {formatRelativeTime(conv.updatedAt)} · {conv.messageCount}{" "}
                      msgs
                      {conv.lastModelId && ` · ${conv.lastModelId}`}
                    </p>
                  </button>
                  <div className="px-4 pb-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(conv._id)}
                      className={cn(
                        "rounded-md bg-brand-danger px-2 py-0.5 text-[10px] text-brand-bg",
                        "opacity-0 transition-opacity group-hover:opacity-100",
                        "focus:opacity-100"
                      )}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
