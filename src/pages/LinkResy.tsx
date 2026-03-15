import { FormEvent, useState } from "react";
import { linkResy } from "../api/client";
import styles from "./Login.module.css";

interface Props {
  onSuccess: () => void;
  onLogout: () => void;
}

export function LinkResy({ onSuccess, onLogout }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await linkResy(email, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to link account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Link Your Resy Account</h1>
        <p className={styles.subtitle}>
          Enter your Resy credentials to make reservations
        </p>

        <input
          className={styles.input}
          type="email"
          placeholder="Resy email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          disabled={loading}
        />

        <input
          className={styles.input}
          type="password"
          placeholder="Resy password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Linking…" : "Link Account"}
        </button>

        <button
          type="button"
          className={styles.button}
          style={{ background: "transparent", color: "var(--text-muted)" }}
          onClick={onLogout}
          disabled={loading}
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
