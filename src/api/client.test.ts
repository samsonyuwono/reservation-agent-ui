import {
  setToken,
  clearToken,
  isAuthenticated,
  login,
  deleteSession,
  getResyEmail,
  setResyEmail,
  clearResyEmail,
  linkResy,
  unlinkResy,
  getResyStatus,
} from "./client";

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

  it("clearToken removes token and resy_email", () => {
    setToken("tok-123");
    setResyEmail("user@resy.com");
    clearToken();
    expect(isAuthenticated()).toBe(false);
    expect(getResyEmail()).toBeNull();
  });
});

describe("resy email management", () => {
  it("setResyEmail stores and getResyEmail retrieves", () => {
    expect(getResyEmail()).toBeNull();
    setResyEmail("user@resy.com");
    expect(getResyEmail()).toBe("user@resy.com");
  });

  it("clearResyEmail removes stored email", () => {
    setResyEmail("user@resy.com");
    clearResyEmail();
    expect(getResyEmail()).toBeNull();
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

describe("linkResy", () => {
  it("sends POST, stores new token and email", async () => {
    setToken("old-token");
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          success: true,
          token: "new-jwt",
          resy_email: "me@resy.com",
        }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await linkResy("me@resy.com", "pass");

    expect(result.resy_email).toBe("me@resy.com");
    expect(store["auth_token"]).toBe("new-jwt");
    expect(store["resy_email"]).toBe("me@resy.com");
  });

  it("throws on 401 (bad Resy creds)", async () => {
    setToken("tok");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ detail: "Invalid Resy credentials" }),
      }),
    );

    await expect(linkResy("bad@resy.com", "wrong")).rejects.toThrow(
      "Invalid Resy credentials",
    );
  });
});

describe("getResyStatus", () => {
  it("returns linked status", async () => {
    setToken("tok");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ linked: true, resy_email: "me@resy.com" }),
      }),
    );

    const status = await getResyStatus();
    expect(status.linked).toBe(true);
    expect(status.resy_email).toBe("me@resy.com");
  });

  it("returns not linked when no token", async () => {
    const status = await getResyStatus();
    expect(status.linked).toBe(false);
  });
});

describe("unlinkResy", () => {
  it("calls DELETE, stores new token, clears email", async () => {
    setToken("old-tok");
    setResyEmail("me@resy.com");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, token: "no-resy-jwt" }),
      }),
    );

    await unlinkResy();

    expect(store["auth_token"]).toBe("no-resy-jwt");
    expect(store["resy_email"]).toBeUndefined();
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
