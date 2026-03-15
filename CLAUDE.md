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

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
