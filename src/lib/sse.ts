export type StreamEvent =
  | { type: "delta"; text: string }
  | { type: "done" }
  | { type: "saved" }
  | { type: "error"; message: string };

export function encodeStreamEvent(event: StreamEvent): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
}

export function parseStreamBuffer(buffer: string): {
  events: StreamEvent[];
  remainder: string;
} {
  const events: StreamEvent[] = [];
  const parts = buffer.split("\n\n");
  const remainder = parts.pop() ?? "";

  for (const part of parts) {
    for (const line of part.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;

      const raw = trimmed.slice(6);
      if (!raw) continue;

      try {
        events.push(JSON.parse(raw) as StreamEvent);
      } catch {
        if (raw === "[DONE]") {
          events.push({ type: "done" });
        } else if (raw.startsWith("[ERROR]")) {
          events.push({ type: "error", message: raw.slice(8).trim() });
        } else {
          events.push({ type: "delta", text: raw });
        }
      }
    }
  }

  return { events, remainder };
}
