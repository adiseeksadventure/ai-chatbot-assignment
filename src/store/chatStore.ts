import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import type { ActiveProvider } from "@/lib/llm";
import {
  DEFAULT_MODEL_ID,
  DEFAULT_PROVIDER_ID,
} from "@/lib/constants";
import type { ConversationSummary, Message } from "@/types";
import { generateId } from "@/lib/utils";

interface ChatStore {
  messages: Message[];
  sessionId: string;
  isLoading: boolean;
  streamingMessageId: string | null;
  isDarkMode: boolean;
  searchQuery: string;
  conversations: ConversationSummary[];
  activeProvider: ActiveProvider;
  toast: { message: string; type: "error" | "info" } | null;
  conversationsRefreshNonce: number;

  addMessage: (msg: Omit<Message, "id">) => string;
  appendStreamChunk: (id: string, delta: string) => void;
  finalizeMessage: (id: string) => void;
  setLoading: (v: boolean) => void;
  setStreamingId: (id: string | null) => void;
  setDarkMode: (v: boolean) => void;
  setSearchQuery: (q: string) => void;
  loadConversation: (messages: Message[], sessionId: string) => void;
  setConversations: (c: ConversationSummary[]) => void;
  setActiveProvider: (p: ActiveProvider) => void;
  clearSession: () => void;
  showToast: (message: string, type?: "error" | "info") => void;
  clearToast: () => void;
  triggerConversationsRefresh: () => void;
}

export const useChatStore = create<ChatStore>()(
  devtools(
    persist(
      (set) => ({
        messages: [],
        sessionId: generateId(),
        isLoading: false,
        streamingMessageId: null,
        isDarkMode: false,
        searchQuery: "",
        conversations: [],
        activeProvider: {
          providerId: DEFAULT_PROVIDER_ID,
          modelId: DEFAULT_MODEL_ID,
        },
        toast: null,
        conversationsRefreshNonce: 0,

        addMessage: (msg) => {
          const id = generateId();
          set((state) => ({
            messages: [
              ...state.messages,
              { ...msg, id, timestamp: msg.timestamp ?? new Date() },
            ],
          }));
          return id;
        },

        appendStreamChunk: (id, delta) => {
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === id ? { ...m, content: m.content + delta } : m
            ),
          }));
        },

        finalizeMessage: (id) => {
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === id ? { ...m, isStreaming: false } : m
            ),
            streamingMessageId:
              state.streamingMessageId === id
                ? null
                : state.streamingMessageId,
          }));
        },

        setLoading: (v) => set({ isLoading: v }),
        setStreamingId: (id) => set({ streamingMessageId: id }),
        setDarkMode: (v) => set({ isDarkMode: v }),
        setSearchQuery: (q) => set({ searchQuery: q }),

        loadConversation: (messages, sessionId) => {
          set({
            messages: messages.map((m) => ({
              ...m,
              timestamp: new Date(m.timestamp),
              isStreaming: false,
            })),
            sessionId,
            streamingMessageId: null,
            isLoading: false,
          });
        },

        setConversations: (c) => set({ conversations: c }),
        setActiveProvider: (p) => set({ activeProvider: p }),

        clearSession: () => {
          set({
            messages: [],
            sessionId: generateId(),
            streamingMessageId: null,
            isLoading: false,
          });
        },

        showToast: (message, type = "error") =>
          set({ toast: { message, type } }),
        clearToast: () => set({ toast: null }),
        triggerConversationsRefresh: () =>
          set((state) => ({
            conversationsRefreshNonce: state.conversationsRefreshNonce + 1,
          })),
      }),
      {
        name: "faq-chat-store",
        // Deliberately NOT persisting sessionId: messages aren't persisted
        // client-side and nothing reloads them on hydrate, so restoring a stale
        // sessionId would silently $push new messages onto the last-used DB
        // conversation. Each load starts a fresh session; resuming an old chat
        // goes through the sidebar (loadConversation sets sessionId + messages).
        partialize: (state) => ({
          isDarkMode: state.isDarkMode,
          activeProvider: state.activeProvider,
        }),
        skipHydration: true,
      }
    ),
    { enabled: process.env.NODE_ENV === "development" }
  )
);

export function useMessage(id: string): Message | undefined {
  return useChatStore(
    useShallow((state) => state.messages.find((m) => m.id === id))
  );
}
