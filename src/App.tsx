import { useState, useEffect } from "react";
import {
  isAuthenticated,
  getResyEmail,
  getResyStatus,
  clearResyEmail,
} from "./api/client";
import { Login } from "./pages/Login";
import { LinkResy } from "./pages/LinkResy";
import { Chat } from "./pages/Chat";

export function App() {
  const [authed, setAuthed] = useState(() => isAuthenticated());
  const [resyLinked, setResyLinked] = useState(() => !!getResyEmail());

  useEffect(() => {
    // Re-check if token was cleared (e.g. 401)
    const check = () => {
      setAuthed(isAuthenticated());
      setResyLinked(!!getResyEmail());
    };
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);

  // Verify server-side link status on mount when authed
  useEffect(() => {
    if (!authed) return;
    getResyStatus()
      .then((status) => {
        if (!status.linked) {
          clearResyEmail();
          setResyLinked(false);
        }
      })
      .catch(() => {});
  }, [authed]);

  if (!authed) {
    return <Login onSuccess={() => setAuthed(true)} />;
  }

  if (!resyLinked) {
    return (
      <LinkResy onSuccess={() => setResyLinked(true)} />
    );
  }

  return <Chat />;
}
