# CLAUDE.md — reservation-ui

React chatbot frontend for the Reservation Agent.

## Development Commands

```bash
npm install         # Install dependencies
npm run dev         # Start Vite dev server on :5173 (proxies /api to localhost:8000)
npm run build       # TypeScript check + production build
npm run preview     # Preview production build
```

## Architecture

Single-page app with two views: **Login** and **Chat**. No router needed.

### Key Files

- `src/api/client.ts` — Auth token management + SSE stream reader for `/api/chat`
- `src/api/types.ts` — TypeScript types for messages, tool events, card data
- `src/hooks/useChat.ts` — Chat state: messages, streaming status, SSE callbacks, card extraction
- `src/pages/Login.tsx` — Full-screen password input
- `src/pages/Chat.tsx` — Message list, tool status indicator, chat input
- `src/components/` — MessageBubble, AvailabilityCard, ReservationCard, SniperJobCard, ToolStatus, ChatInput

### SSE Event Flow

The backend streams Server-Sent Events for each agent turn:
1. `session` — session ID for conversation continuity
2. `thinking` — agent is processing
3. `tool_call` — agent invoked a tool (name + input)
4. `tool_result` — tool returned results (parsed into cards)
5. `message` — final text response
6. `done` — turn complete

### Rich Cards

`useChat.ts` extracts structured card data from `tool_result` events:
- `check_resy_availability` → `AvailabilityCard` with clickable time slot pills
- `make_resy_reservation` → `ReservationCard` confirmation ticket
- `view_sniper_jobs` → `SniperJobCard` status cards

Clicking a time slot pill sends `"Book the {time} slot"` as a new chat message.

## Conventions

- **CSS Modules** — co-located `.module.css` files, all design tokens in `src/styles/global.css`
- **No external CSS framework** — custom properties for colors, fonts, spacing
- **TypeScript strict mode** — no `any`, no unused variables
- **Minimal dependencies** — React, ReactDOM, TypeScript, Vite only
- **API base URL** — uses Vite proxy in dev (`/api` → `localhost:8000`), `VITE_API_URL` env var in production

## Deployment

Vercel: connect repo, root `/`, build command `npm run build`, output `dist`.
Set env var `VITE_API_URL=https://api.yourdomain.com` in Vercel project settings.
