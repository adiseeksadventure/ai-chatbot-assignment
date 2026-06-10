export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { io, type Socket } from "socket.io-client";
import { BACKEND_URL } from "@/lib/backend";
import { encodeStreamEvent, type StreamEvent } from "@/lib/sse";
import { logger } from "@/lib/logger";

/**
 * Intermediary proxy: the browser still POSTs here and reads an SSE stream
 * (UI untouched). Under the hood this route is a Socket.io *client* to the
 * dedicated backend — it emits the chat request, receives streamed `stream`
 * events, and re-encodes them as Server-Sent Events for the browser. A
 * `stream-end` control event signals completion so we can close the response.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let socket: Socket | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;

      const enqueue = (event: StreamEvent) => {
        if (!closed) controller.enqueue(encodeStreamEvent(event));
      };

      const close = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          // controller already closed
        }
        socket?.disconnect();
      };

      socket = io(BACKEND_URL, {
        transports: ["websocket", "polling"],
        reconnection: false,
        forceNew: true,
        timeout: 10000,
      });

      socket.on("connect", () => {
        socket?.emit("chat", body);
      });

      socket.on("stream", (event: StreamEvent) => {
        enqueue(event);
      });

      socket.on("stream-end", () => {
        close();
      });

      socket.on("connect_error", (error: Error) => {
        logger.error("Backend socket connect error:", error.message);
        enqueue({ type: "error", message: "Backend service unavailable" });
        close();
      });

      socket.on("disconnect", () => {
        close();
      });
    },

    cancel() {
      // Browser aborted the request — tear down the upstream socket.
      socket?.disconnect();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
