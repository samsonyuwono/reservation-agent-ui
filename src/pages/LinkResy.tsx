import { FormEvent, useState } from "react";
import { linkResy } from "../api/client";
import { ResyLogo } from "../components/ResyLogo";
import styles from "./Login.module.css";

interface Props {
  onSuccess: () => void;
}

export function LinkResy({ onSuccess }: Props) {
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
        <h1 className={styles.title}><ResyLogo size="lg" /></h1>
        <p className={styles.subtitle}>
          Enter your Resy credentials to make reservations
        </p>

        <p className={styles.hint}>
          Reservations are made through your personal Resy account. Your
          credentials are encrypted and only used to book tables on your behalf.
        </p>
        <p className={styles.hint}>
          Don&apos;t have a Resy account?{" "}
          <a href="https://resy.com" target="_blank" rel="noopener noreferrer">
            Sign up at resy.com
          </a>
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

      </form>
    </div>
  );
}
