export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { BACKEND_URL } from "@/lib/backend";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

interface RouteParams {
  params: { id: string };
}

function unavailable() {
  return NextResponse.json(
    { error: "Service temporarily unavailable", code: "BACKEND_UNAVAILABLE" },
    { status: 503 }
  );
}

// Intermediary proxy: forwards single-conversation reads to the backend.
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/conversations/${encodeURIComponent(params.id)}`,
      { cache: "no-store" }
    );
    const data = await res.text();

    return new Response(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Get conversation proxy error:", error);
    return unavailable();
  }
}

// Intermediary proxy: forwards deletes to the backend.
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/conversations/${encodeURIComponent(params.id)}`,
      { method: "DELETE" }
    );
    const data = await res.text();

    return new Response(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Delete conversation proxy error:", error);
    return unavailable();
  }
}
