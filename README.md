# FAQ Assistant — Frontend

A Next.js 14 chat UI for a multi-provider FAQ assistant. It streams responses, persists conversation history, and supports full-text search — but it performs none of that work itself. All LLM calls and MongoDB access live in a **dedicated Express + Socket.io backend** ([`../backend`](../backend)); this app's `app/api/*` routes are thin proxies to it.

## Architecture

**Thin proxy layer** — The browser still calls `/api/chat` (SSE) and `/api/conversations` exactly as before, but those route handlers now forward to the backend instead of doing the work. No business logic, MongoDB driver, or provider SDK ships in this app.

**Socket.io for streaming** — `/api/chat` opens a Socket.io connection to the backend (as a client), receives streamed tokens, and re-encodes them as Server-Sent Events for the browser. The UI never changed — the Socket.io hop is entirely server-to-server.

**Zustand** — Lightweight client state for messages, streaming, dark mode, and provider selection. Granular selectors prevent unnecessary re-renders during token streaming.

**Static model catalog** — [`src/lib/llm/catalog.ts`](src/lib/llm/catalog.ts) lists the selectable providers/models for the picker only. It mirrors the providers registered in the backend; there are no API keys or network calls in this app.

## How a chat flows

```
Browser ──POST /api/chat (SSE)──► app/api/chat (socket.io client) ──socket.io──► backend
        ◄────────── SSE ──────────                                 ◄── streamed tokens ──
```

Conversation reads/writes (`/api/conversations`) follow the same pattern but proxy over plain REST.

## Backend

LLM providers, MongoDB, persistence, and request validation all live in [`../backend`](../backend). To add a provider you register it in the backend **and** add its metadata to [`src/lib/llm/catalog.ts`](src/lib/llm/catalog.ts) so it appears in the model picker — see the [backend README](../backend/README.md).

## Local Setup

Start the backend first — it owns MongoDB and the provider API keys (see [`../backend/README.md`](../backend/README.md)). Then:

```bash
# Install dependencies
npm install

# Configure environment — this app only needs the backend URL
cp .env.local.example .env.local   # BACKEND_URL=http://localhost:4000

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and navigate to **Open Chat**.

> MongoDB and the LLM API keys are configured in the **backend**, not here. This app needs only `BACKEND_URL`.

## Docker

This app ships a standalone [`Dockerfile`](Dockerfile) that builds a self-contained Next.js image. The database and backend are orchestrated independently from [`../backend/docker-compose.yml`](../backend/docker-compose.yml), keeping the two services separately deployable.

```bash
docker build -t faq-frontend .
docker run -p 3000:3000 -e BACKEND_URL=http://host.docker.internal:4000 faq-frontend
```

## API Reference

These endpoints are unchanged from the UI's perspective — each now proxies to the backend.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Stream AI response (SSE). Body: `message`, `sessionId`, `providerId`, `modelId`, `history` |
| `GET` | `/api/conversations` | Paginated history. Query: `search`, `page`, `limit` |
| `GET` | `/api/conversations/[id]` | Load full conversation with messages |
| `DELETE` | `/api/conversations/[id]` | Delete a conversation |

## Assumptions

- LLM API keys are backend-only; the frontend never sees them
- Session IDs are client-generated UUIDs persisted in localStorage
- Conversation titles are auto-generated from the first user message (60 chars)
- The model catalog here is kept in sync with the backend's provider registry by hand

## If I Had More Time

- User authentication and per-user conversation isolation
- Rate limiting per IP and per provider
- Per-provider token usage tracking and cost estimates
- Export conversations (JSON/Markdown)
- Message editing and regeneration
- Optimistic UI for conversation list updates after send
- Source the model catalog live from the backend's `GET /api/models` instead of duplicating it
