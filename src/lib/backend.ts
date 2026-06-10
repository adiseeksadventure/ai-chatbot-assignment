/**
 * Base URL of the dedicated Express + Socket.io backend. The Next.js API routes
 * proxy to this server-side only (never exposed to the browser), so it is a
 * plain server env var — not a NEXT_PUBLIC_* value.
 */
export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";
