const API_BASE = import.meta.env.VITE_API_URL || "";

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function setToken(token: string) {
  localStorage.setItem("auth_token", token);
}

export function clearToken() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("resy_email");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// --- Resy email management ---

export function getResyEmail(): string | null {
  return localStorage.getItem("resy_email");
}

export function setResyEmail(email: string) {
  localStorage.setItem("resy_email", email);
}

export function clearResyEmail() {
  localStorage.removeItem("resy_email");
}

// --- Auth ---

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

// --- Resy credential linking ---

export async function linkResy(
  email: string,
  password: string,
): Promise<{ token: string; resy_email: string }> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/api/resy/link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = (body as { detail?: string }).detail;
    const fallback = res.status === 401 ? "Invalid Resy credentials" : "Link failed";
    throw new Error(detail || fallback);
  }

  const data = (await res.json()) as {
    success: boolean;
    token: string;
    resy_email: string;
  };
  setToken(data.token);
  setResyEmail(data.resy_email);
  return data;
}

export async function getResyStatus(): Promise<{
  linked: boolean;
  resy_email: string | null;
}> {
  const token = getToken();
  if (!token) return { linked: false, resy_email: null };

  const res = await fetch(`${API_BASE}/api/resy/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return { linked: false, resy_email: null };

  return (await res.json()) as { linked: boolean; resy_email: string | null };
}

export async function unlinkResy(): Promise<void> {
  const token = getToken();
  if (!token) return;

  const res = await fetch(`${API_BASE}/api/resy/unlink`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    const data = (await res.json()) as { success: boolean; token: string };
    setToken(data.token);
    clearResyEmail();
  }
}

// --- Chat SSE ---

export interface SSECallbacks {
  onSession: (sessionId: string) => void;
  onThinking: () => void;
  onToolCall: (tool: string, input: Record<string, unknown>) => void;
  onToolResult: (tool: string, result: Record<string, unknown>) => void;
  onProgress: (message: string) => void;
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

  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const resetTimeout = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => controller.abort(), 90_000);
  };

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      callbacks.onError("Connection timed out. Please try again.");
    } else {
      callbacks.onError("Connection failed. Please try again.");
    }
    callbacks.onDone();
    return;
  }

  if (res.status === 401) {
    clearToken();
    callbacks.onError("Session expired");
    callbacks.onDone();
    return;
  }

  if (res.status === 403) {
    callbacks.onError("resy_not_linked");
    callbacks.onDone();
    return;
  }

  if (!res.ok || !res.body) {
    callbacks.onError("Chat request failed");
    callbacks.onDone();
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let receivedDone = false;

  resetTimeout();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      resetTimeout();
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      let currentEvent = "";
      for (const line of lines) {
        if (line.startsWith("event: ")) {
          currentEvent = line.slice(7);
        } else if (line.startsWith("data: ") && currentEvent) {
          let data: Record<string, unknown>;
          try {
            data = JSON.parse(line.slice(6)) as Record<string, unknown>;
          } catch {
            currentEvent = "";
            continue;
          }
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
            case "progress":
              callbacks.onProgress(data.message as string);
              break;
            case "message":
              callbacks.onMessage(data.text as string);
              break;
            case "error":
              callbacks.onError(data.detail as string);
              break;
            case "done":
              receivedDone = true;
              callbacks.onDone();
              break;
          }
          currentEvent = "";
        }
      }
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      callbacks.onError("Connection timed out. Please try again.");
    } else {
      callbacks.onError("Connection lost. Please try again.");
    }
  } finally {
    clearTimeout(timeoutId);
    if (!receivedDone) {
      callbacks.onDone();
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
