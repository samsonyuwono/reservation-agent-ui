import { useCallback, useRef, useState } from "react";
import { sendMessage, deleteSession } from "../api/client";
import type {
  ChatMessage,
  ToolEvent,
  AvailabilityCardData,
  ReservationCardData,
  SniperJobCardData,
  CardData,
} from "../api/types";

let nextId = 0;
function makeId() {
  return `msg-${++nextId}`;
}

/** Map a tool name to a friendly status label. */
export function toolLabel(tool: string): string {
  const labels: Record<string, string> = {
    search_resy_restaurants: "Searching restaurants…",
    search_resy_by_cuisine: "Browsing by cuisine…",
    check_resy_availability: "Checking availability…",
    make_resy_reservation: "Booking reservation…",
    resolve_reservation_conflict: "Resolving conflict…",
    view_my_reservations: "Loading reservations…",
    view_sniper_jobs: "Loading sniper jobs…",
    schedule_sniper: "Scheduling sniper…",
    get_current_time: "Checking time…",
  };
  return labels[tool] ?? "Working…";
}

/** Friendly past-tense label for completed tools. */
export function completedLabel(tool: string): string {
  const labels: Record<string, string> = {
    search_resy_restaurants: "Searched restaurants",
    search_resy_by_cuisine: "Browsed by cuisine",
    check_resy_availability: "Checked availability",
    make_resy_reservation: "Booked reservation",
    resolve_reservation_conflict: "Resolved conflict",
    view_my_reservations: "Loaded reservations",
    view_sniper_jobs: "Loaded sniper jobs",
    schedule_sniper: "Scheduled sniper",
    get_current_time: "Checked time",
  };
  return labels[tool] ?? "Done";
}

/** Try to extract structured card data from a tool_result event. */
export function extractCards(
  tool: string,
  result: Record<string, unknown>,
): CardData[] {
  const cards: CardData[] = [];

  if (
    tool === "check_resy_availability" &&
    result.success &&
    Array.isArray(result.available_times)
  ) {
    const slots = (
      result.available_times as {
        time: string;
        table_type: string;
        config_id: string;
      }[]
    ).map((s) => ({
      time: s.time,
      type: s.table_type,
      configId: s.config_id,
    }));
    cards.push({
      kind: "availability",
      date: result.date as string,
      partySize: result.party_size as number,
      slots,
    } satisfies AvailabilityCardData);
  }

  if (tool === "make_resy_reservation" && result.success) {
    cards.push({
      kind: "reservation",
      venue: (result.venue_slug as string) ?? "Restaurant",
      date: (result.date as string) ?? "",
      time: (result.time_slot as string) ?? "",
      partySize: (result.party_size as number) ?? 0,
      confirmationNumber: result.reservation_id as string | undefined,
      status: result.reservation_id ? "Confirmed" : "Pending",
    } satisfies ReservationCardData);
  }

  if (
    tool === "view_sniper_jobs" &&
    result.success &&
    Array.isArray(result.jobs)
  ) {
    for (const j of result.jobs as Record<string, unknown>[]) {
      cards.push({
        kind: "sniper",
        jobId: j.job_id as number,
        restaurant: j.restaurant as string,
        date: j.date as string,
        preferredTimes: j.preferred_times as string,
        status: j.status as string,
        pollCount: j.poll_count as number,
        maxAttempts: j.max_attempts as number,
      } satisfies SniperJobCardData);
    }
  }

  return cards;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeToolLabel, setActiveToolLabel] = useState<string | null>(null);
  const [completedTools, setCompletedTools] = useState<string[]>([]);
  const sessionIdRef = useRef<string | null>(null);
  const lastUserTextRef = useRef("");

  // Accumulate tool events and cards for the current assistant message
  const pendingToolEvents = useRef<ToolEvent[]>([]);
  const pendingCards = useRef<CardData[]>([]);

  const send = useCallback(async (text: string) => {
    lastUserTextRef.current = text;
    const userMsg: ChatMessage = {
      id: makeId(),
      role: "user",
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);
    setActiveToolLabel(null);
    setCompletedTools([]);
    pendingToolEvents.current = [];
    pendingCards.current = [];

    await sendMessage(text, sessionIdRef.current, {
      onSession(sid) {
        sessionIdRef.current = sid;
      },
      onThinking() {
        setActiveToolLabel("Processing your request…");
      },
      onToolCall(tool, input) {
        setActiveToolLabel(toolLabel(tool));
        pendingToolEvents.current.push({ type: "tool_call", tool, input });
      },
      onToolResult(tool, result) {
        pendingToolEvents.current.push({ type: "tool_result", tool, result });
        const cards = extractCards(tool, result);
        pendingCards.current.push(...cards);
        setCompletedTools((prev) => [...prev, completedLabel(tool)]);
        setActiveToolLabel(null);
      },
      onMessage(msgText) {
        const assistantMsg: ChatMessage = {
          id: makeId(),
          role: "assistant",
          text: msgText,
          timestamp: Date.now(),
          toolEvents: [...pendingToolEvents.current],
          cards:
            pendingCards.current.length > 0
              ? [...pendingCards.current]
              : undefined,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setActiveToolLabel(null);
      },
      onError(detail) {
        const errMsg: ChatMessage = {
          id: makeId(),
          role: "assistant",
          text: `Error: ${detail}`,
          timestamp: Date.now(),
          isError: true,
        };
        setMessages((prev) => [...prev, errMsg]);
        setActiveToolLabel(null);
      },
      onDone() {
        setIsStreaming(false);
        setActiveToolLabel(null);
        setCompletedTools([]);
      },
    });
  }, []);

  const retry = useCallback(() => {
    if (!isStreaming && lastUserTextRef.current) {
      send(lastUserTextRef.current);
    }
  }, [isStreaming, send]);

  const clearChat = useCallback(async () => {
    if (sessionIdRef.current) {
      await deleteSession(sessionIdRef.current);
    }
    sessionIdRef.current = null;
    setMessages([]);
    setIsStreaming(false);
    setActiveToolLabel(null);
    setCompletedTools([]);
  }, []);

  return {
    messages,
    isStreaming,
    activeToolLabel,
    completedTools,
    send,
    retry,
    clearChat,
  };
}
