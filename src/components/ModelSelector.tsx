"use client";

import { useEffect, useRef } from "react";
import type { LLMModel } from "@/lib/llm";
import {
  DEFAULT_MODEL_ID,
  DEFAULT_PROVIDER_ID,
} from "@/lib/constants";
import { useChatStore } from "@/store/chatStore";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";

interface ModelSelectorProps {
  models: Array<LLMModel & { providerId: string; providerName: string }>;
}

const controlClass = cn(
  "h-9 rounded-md border border-brand-fg/20 bg-brand-bg px-3 text-sm",
  "text-brand-fg outline-none focus:border-brand-fg/40",
  "dark:border-brand-fg-dark/20 dark:bg-brand-bg-dark dark:text-brand-fg-dark",
  "disabled:opacity-50"
);

export function ModelSelector({ models }: ModelSelectorProps) {
  const activeProvider = useChatStore(useShallow((s) => s.activeProvider));
  const isSending = useChatStore((s) => s.streamingMessageId !== null);
  const validatedRef = useRef(false);

  useEffect(() => {
    if (validatedRef.current) return;
    const isValid = models.some(
      (m) =>
        m.providerId === activeProvider.providerId &&
        m.id === activeProvider.modelId
    );
    if (!isValid) {
      useChatStore.getState().setActiveProvider({
        providerId: DEFAULT_PROVIDER_ID,
        modelId: DEFAULT_MODEL_ID,
      });
    }
    validatedRef.current = true;
  }, [models, activeProvider]);

  const providers = Array.from(
    models.reduce((map, m) => {
      if (!map.has(m.providerId)) {
        map.set(m.providerId, m.providerName);
      }
      return map;
    }, new Map<string, string>())
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [providerId, modelId] = e.target.value.split("::");
    useChatStore.getState().setActiveProvider({ providerId, modelId });
  };

  return (
    <select
      value={`${activeProvider.providerId}::${activeProvider.modelId}`}
      onChange={handleChange}
      disabled={isSending}
      aria-label="Select model"
      className={controlClass}
    >
      {providers.map(([providerId, providerName]) => (
        <optgroup key={providerId} label={providerName}>
          {models
            .filter((m) => m.providerId === providerId)
            .map((model) => (
              <option
                key={`${providerId}::${model.id}`}
                value={`${providerId}::${model.id}`}
              >
                {model.name}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
}
