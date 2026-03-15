import { useSyncExternalStore } from "react";

/**
 * Shared 30-second tick so all MessageBubbles re-render together
 * instead of each creating its own setInterval.
 */
let tick = 0;
const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!intervalId) {
    intervalId = setInterval(() => {
      tick++;
      listeners.forEach((fn) => fn());
    }, 30_000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

function getSnapshot() {
  return tick;
}

/**
 * Returns a human-friendly relative time string that updates every 30s.
 * "just now" -> "2m ago" -> "1h ago" -> "Mar 8"
 */
export function useRelativeTime(epoch: number): string {
  useSyncExternalStore(subscribe, getSnapshot);

  const diff = Math.floor((Date.now() - epoch) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

  const d = new Date(epoch);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}
