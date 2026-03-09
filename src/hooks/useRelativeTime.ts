import { useEffect, useState } from "react";

/**
 * Returns a human-friendly relative time string that updates every 30s.
 * "just now" → "2m ago" → "1h ago" → "Mar 8"
 */
export function useRelativeTime(epoch: number): string {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

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
