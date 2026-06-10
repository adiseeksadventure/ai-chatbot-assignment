export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  providerId?: string;
  modelId?: string;
}

export interface ConversationSummary {
  _id: string;
  sessionId: string;
  title: string;
  updatedAt: string;
  messageCount: number;
  lastModelId?: string;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

export interface ConversationsResponse {
  conversations: ConversationSummary[];
  total: number;
  hasMore: boolean;
}
