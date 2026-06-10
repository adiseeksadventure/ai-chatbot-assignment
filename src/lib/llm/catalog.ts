import type { LLMModel } from "./types";

export interface ProviderCatalogEntry {
  id: string;
  name: string;
  models: LLMModel[];
}

/**
 * Static catalog of selectable providers/models, used purely to render the
 * model picker. This mirrors the providers registered in the backend
 * (`backend/src/lib/llm/registry.ts`) — keep the two in sync when adding a
 * provider. No API keys or network logic live here; the backend owns all calls
 * to model APIs.
 */
export const PROVIDER_CATALOG: ProviderCatalogEntry[] = [
  {
    id: "gemini",
    name: "Gemini",
    models: [
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
      { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
    ],
  },
  {
    id: "openrouter",
    name: "OpenAI",
    models: [
      { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
      { id: "openai/gpt-4o", name: "GPT-4o" },
      { id: "openai/gpt-4.1-mini", name: "GPT-4.1 Mini" },
    ],
  },
];
