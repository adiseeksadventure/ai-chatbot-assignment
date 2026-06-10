// Frontend-only LLM types. The actual provider implementations (streaming,
// API keys, network calls) now live in the dedicated backend. The UI only needs
// to render the model picker and track the active selection.

export interface LLMModel {
  id: string;
  name: string;
  contextWindow?: number;
}

export interface ActiveProvider {
  providerId: string;
  modelId: string;
}
