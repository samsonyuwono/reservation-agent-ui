import { setToken, clearToken, isAuthenticated, login, deleteSession } from "./client";

// Stub localStorage
const store: Record<string, string> = {};
beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("token management", () => {
  it("setToken stores and isAuthenticated returns true", () => {
    expect(isAuthenticated()).toBe(false);
    setToken("tok-123");
    expect(isAuthenticated()).toBe(true);
    expect(store["auth_token"]).toBe("tok-123");
  });

  it("clearToken removes token", () => {
    setToken("tok-123");
    clearToken();
    expect(isAuthenticated()).toBe(false);
  });
});

describe("login", () => {
  it("sends POST, stores token, returns token", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: "new-token" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const token = await login("secret");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/login"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(token).toBe("new-token");
    expect(store["auth_token"]).toBe("new-token");
  });

  it("throws on error response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ detail: "Invalid password" }),
      }),
    );

    await expect(login("wrong")).rejects.toThrow("Invalid password");
  });
});

describe("deleteSession", () => {
  it("sends DELETE with auth header", async () => {
    setToken("tok-abc");
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    await deleteSession("session-1");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/chat/session/session-1"),
      expect.objectContaining({
        method: "DELETE",
        headers: { Authorization: "Bearer tok-abc" },
      }),
    );
  });

  it("does nothing when no token", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    await deleteSession("session-1");
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
