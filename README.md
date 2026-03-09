# Reservation UI

React chatbot frontend for the [Reservation Agent](https://github.com/samsonyuwono/ai-agents). Dark, refined concierge interface for making restaurant reservations via Resy.

## Setup

```bash
npm install
```

## Development

Requires the backend API running on `localhost:8000`:

```bash
# Terminal 1 — backend (ai-agents repo)
uvicorn api.main:app --reload --port 8000

# Terminal 2 — frontend (this repo)
npm run dev
```

Vite proxies `/api` requests to `localhost:8000` automatically.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL (production only) | Production |

For local development, leave `VITE_API_URL` empty — the Vite proxy handles it.

## Deployment

Deploy to Vercel:

1. Connect this repo to Vercel
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set `VITE_API_URL=https://api.yourdomain.com` in Vercel environment variables
