import { ChatLayout } from "@/components/ChatLayout";
import { getAllModels, getAllProviders } from "@/lib/llm";

export default function ChatPage() {
  const providers = getAllProviders();
  const providerNames = new Map(providers.map((p) => [p.id, p.name]));

  const models = getAllModels().map((m) => ({
    ...m,
    providerName: providerNames.get(m.providerId) ?? m.providerId,
  }));

  return <ChatLayout models={models} />;
}
