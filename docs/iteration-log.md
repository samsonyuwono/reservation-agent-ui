# Reservation UI — Product Iteration Log

## Overview

The Reservation Agent existed as a CLI chatbot. The goal was to wrap it in a web-based chat interface so it can be used by anyone without terminal access — while preserving the full agent capability (search, availability, booking, sniping).

---

## Iteration 1: Backend API Layer

**Goal:** Expose the existing agent over HTTP so a frontend can communicate with it.

**What we built:**
- FastAPI server with JWT-based password authentication
- SSE (Server-Sent Events) streaming endpoint so the frontend receives real-time progress during multi-tool agent turns (which can take 10-20 seconds)
- Server-side session management — each user session gets its own agent instance with persistent conversation history

**Key decision — SSE over WebSockets:** The communication is unidirectional (server → client). SSE is simpler, requires no connection management, and works through standard HTTP infrastructure (proxies, CDNs).

**Key decision — Server-side sessions:** The agent maintains conversation context in memory. Keeping agent instances on the server avoids the complexity of serializing/deserializing conversation state on every request.

**Outcome:** 4 API endpoints, 12 unit tests, all passing. Backend can be started with a single command.

---

## Iteration 2: Frontend Chatbot UI

**Goal:** A dark, refined concierge-style chat interface. Not a generic chatbot — this is for high-end restaurant reservations.

**What we built:**
- Two-view app: full-screen login → chat interface
- Rich inline cards that render when the agent returns structured data:
  - **Availability cards** — time slots as clickable pill buttons (clicking sends "Book the 8:00 PM slot" as a message)
  - **Reservation cards** — confirmation tickets with venue, date, time, party size
  - **Sniper job cards** — scheduled snipe status with progress
- Tool status indicators ("Searching restaurants…", "Checking availability…") during agent processing
- Dark palette with warm gold accents, editorial serif headings (DM Serif Display), clean sans-serif body (Inter)

**Key decision — Clickable time slots send chat messages:** Rather than building a separate booking flow, clicking a time slot pill sends a natural language message back to the agent. This keeps the interaction conversational and leverages the agent's existing booking logic.

**Key decision — CSS Modules, no framework:** Zero runtime cost, no extra dependency. All design tokens (colors, spacing, typography) live in a single `global.css` file as CSS custom properties.

**Key decision — fetch + ReadableStream over EventSource:** The browser's native `EventSource` API only supports GET requests. We need POST with a JSON body and Authorization header, so we use `fetch` with manual SSE line parsing.

**Outcome:** TypeScript compiles clean, production build is 64KB gzipped. Two-terminal local dev setup (backend + frontend) works via Vite proxy.

---

## Iteration 3: Local Testing & Bug Fixes

### Issue: Playwright threading crash

**Symptom:** `greenlet.error: cannot switch to a different thread` when the agent tried to use the Resy browser client.

**Root cause:** The chat endpoint ran the agent in a background thread for real-time streaming. Playwright uses greenlets which cannot cross thread boundaries.

**Resolution:** Set `RESY_CLIENT_MODE=api` in environment config to use the API-based Resy client instead of browser automation. This is the correct mode for a server environment anyway — browser automation was designed for local/VPS CLI use.

### Issue: SQLite threading crash

**Symptom:** `SQLite objects created in a thread can only be used in that same thread` when the agent tried to access the reservation database.

**Root cause:** Same background thread issue. The agent's SQLite connection was created in the main thread but used in the worker thread.

**Resolution:** Rewrote the chat endpoint to run the agent synchronously in the SSE generator instead of spawning a background thread. Both SQLite and the agent now execute in the same thread.

**Tradeoff accepted:** Events are now batched — the frontend receives all tool status updates and the final message at once after the agent completes, rather than progressively. The user sees a loading state, then the full response. Real-time progressive streaming is deferred to a future iteration (requires async rewrite).

---

## Current State

**Working:**
- Login → chat → search → availability → booking flow end-to-end
- Conversation persistence across messages within a session
- Rich card rendering for availability, reservations, and sniper jobs
- "New chat" clears session and starts fresh

**Outstanding:**
- Real-time progressive streaming (tool indicators appear as agent works, not after)
- Session expiry for idle agent instances (currently lives in memory forever)
- Frontend reconnection if SSE connection drops
- Production deployment (Caddy + systemd for backend, Vercel for frontend)

---

## Architecture

```
[reservation-ui]                    [ai-agents]
React Chatbot  ──SSE/HTTPS──▸  FastAPI  ──▸  ReservationAgent.run()
  (Vercel)                     (VPS:8000)       ├── search_resy_restaurants
                                    ↑           ├── check_resy_availability
                                Caddy TLS       ├── make_resy_reservation
                                                ├── schedule_sniper
                                                ├── view_my_reservations
                                                ├── view_sniper_jobs
                                                └── ...
```
