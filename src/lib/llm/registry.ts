import { PROVIDER_CATALOG, type ProviderCatalogEntry } from "./catalog";
import type { LLMModel } from "./types";

export function getAllProviders(): ProviderCatalogEntry[] {
  return PROVIDER_CATALOG;
}

export function getAllModels(): Array<LLMModel & { providerId: string }> {
  return PROVIDER_CATALOG.flatMap((p) =>
    p.models.map((m) => ({ ...m, providerId: p.id }))
  );
}
