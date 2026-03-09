const API_BASE = import.meta.env.VITE_API_URL || "";

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function setToken(token: string) {
  localStorage.setItem("auth_token", token);
}

export function clearToken() {
  localStorage.removeItem("auth_token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function login(password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail || "Login failed");
  }
  const data = (await res.json()) as { token: string };
  setToken(data.token);
  return data.token;
}

export interface SSECallbacks {
  onSession: (sessionId: string) => void;
  onThinking: () => void;
  onToolCall: (tool: string, input: Record<string, unknown>) => void;
  onToolResult: (tool: string, result: Record<string, unknown>) => void;
  onMessage: (text: string) => void;
  onError: (detail: string) => void;
  onDone: () => void;
}

export async function sendMessage(
  message: string,
  sessionId: string | null,
  callbacks: SSECallbacks,
): Promise<void> {
  const token = getToken();
  if (!token) {
    callbacks.onError("Not authenticated");
    return;
  }

  const body: Record<string, unknown> = { message };
  if (sessionId) body.session_id = sessionId;

  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    clearToken();
    callbacks.onError("Session expired");
    return;
  }

  if (!res.ok || !res.body) {
    callbacks.onError("Chat request failed");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    let currentEvent = "";
    for (const line of lines) {
      if (line.startsWith("event: ")) {
        currentEvent = line.slice(7);
      } else if (line.startsWith("data: ") && currentEvent) {
        const data = JSON.parse(line.slice(6)) as Record<string, unknown>;
        switch (currentEvent) {
          case "session":
            callbacks.onSession(data.session_id as string);
            break;
          case "thinking":
            callbacks.onThinking();
            break;
          case "tool_call":
            callbacks.onToolCall(
              data.tool as string,
              data.input as Record<string, unknown>,
            );
            break;
          case "tool_result":
            callbacks.onToolResult(
              data.tool as string,
              data.result as Record<string, unknown>,
            );
            break;
          case "message":
            callbacks.onMessage(data.text as string);
            break;
          case "error":
            callbacks.onError(data.detail as string);
            break;
          case "done":
            callbacks.onDone();
            break;
        }
        currentEvent = "";
      }
    }
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  const token = getToken();
  if (!token) return;
  await fetch(`${API_BASE}/api/chat/session/${sessionId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
