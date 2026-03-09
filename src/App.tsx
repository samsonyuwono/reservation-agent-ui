import { useState, useEffect } from "react";
import { isAuthenticated } from "./api/client";
import { Login } from "./pages/Login";
import { Chat } from "./pages/Chat";

export function App() {
  const [authed, setAuthed] = useState(isAuthenticated);

  useEffect(() => {
    // Re-check if token was cleared (e.g. 401)
    const check = () => setAuthed(isAuthenticated());
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);

  if (!authed) {
    return <Login onSuccess={() => setAuthed(true)} />;
  }
  return <Chat onLogout={() => setAuthed(false)} />;
}
