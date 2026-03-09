import { renderHook } from "@testing-library/react";
import { useRelativeTime } from "./useRelativeTime";

describe("useRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-08T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for <60s ago", () => {
    const now = Date.now();
    const { result } = renderHook(() => useRelativeTime(now - 30_000));
    expect(result.current).toBe("just now");
  });

  it("returns 'Xm ago' for 60-3599s", () => {
    const now = Date.now();
    const { result } = renderHook(() => useRelativeTime(now - 120_000));
    expect(result.current).toBe("2m ago");
  });

  it("returns 'Xh ago' for 3600-86399s", () => {
    const now = Date.now();
    const { result } = renderHook(() => useRelativeTime(now - 7200_000));
    expect(result.current).toBe("2h ago");
  });

  it("returns 'Mon D' for >=86400s (1+ days)", () => {
    const now = Date.now();
    // 2 days ago = Mar 6
    const { result } = renderHook(() => useRelativeTime(now - 172800_000));
    expect(result.current).toBe("Mar 6");
  });
});
