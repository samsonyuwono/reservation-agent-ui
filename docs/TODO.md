# Reservation UI — Todo List

- [x] **Sign-in flow** — Allow users to provide their Resy credentials (username/password) through the UI instead of requiring manual `.env` configuration
- [ ] **Sniper job dashboard** — Web view for monitoring sniper job status, poll counts, and outcomes instead of tailing journalctl
- [ ] **Session Chat Storage**
- [x] **Quick prompt chips** — Tappable suggestion chips on empty chat state (e.g. "Best sushi in West Village", "What's open tonight?") that send the message directly on tap
- [x] **Auto-scroll on streaming** — Scroll to bottom on `completedTools` and `activeToolLabel` changes, not just `messages.length`
- [x] **Typing indicator** — Show "Agent is typing…" in input placeholder while streaming instead of just graying out the input
- [x] **Dark/light mode toggle** — Theme switcher in header using existing CSS variables
- [x] **New chat transition** — Animate empty state back in after clicking "New chat" instead of hard cut
