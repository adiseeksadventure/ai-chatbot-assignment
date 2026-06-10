export const dynamic = "force-dynamic";

import { BACKEND_URL } from "@/lib/backend";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

// Intermediary proxy: forwards the list query to the dedicated backend and
// passes its JSON response (and status) straight back to the UI.
export async function GET(req: Request) {
  const { search } = new URL(req.url);

  try {
    const res = await fetch(`${BACKEND_URL}/api/conversations${search}`, {
      cache: "no-store",
    });
    const data = await res.text();

    return new Response(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Conversations proxy error:", error);
    return NextResponse.json(
      { error: "Service temporarily unavailable", code: "BACKEND_UNAVAILABLE" },
      { status: 503 }
    );
  }
}
