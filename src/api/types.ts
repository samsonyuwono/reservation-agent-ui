export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  toolEvents?: ToolEvent[];
  cards?: CardData[];
}

export interface ToolEvent {
  type: "tool_call" | "tool_result";
  tool: string;
  input?: Record<string, unknown>;
  result?: Record<string, unknown>;
}

export type CardData =
  | AvailabilityCardData
  | ReservationCardData
  | SniperJobCardData;

export interface AvailabilityCardData {
  kind: "availability";
  date: string;
  partySize: number;
  slots: { time: string; type: string; configId: string }[];
}

export interface ReservationCardData {
  kind: "reservation";
  venue: string;
  date: string;
  time: string;
  partySize: number;
  confirmationNumber?: string;
  status: string;
}

export interface SniperJobCardData {
  kind: "sniper";
  jobId: number;
  restaurant: string;
  date: string;
  preferredTimes: string;
  status: string;
  pollCount: number;
  maxAttempts: number;
}

export interface SSEEvent {
  event: string;
  data: Record<string, unknown>;
}
