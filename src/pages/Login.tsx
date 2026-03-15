import { FormEvent, useState } from "react";
import { login } from "../api/client";
import { ResyLogo } from "../components/ResyLogo";
import styles from "./Login.module.css";

interface Props {
  onSuccess: () => void;
}

export function Login({ onSuccess }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}><ResyLogo subtitle="Concierge" size="lg" /></h1>
        <p className={styles.subtitle}>Restaurant reservation assistant</p>

        <input
          className={styles.input}
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          disabled={loading}
        />

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Enter"}
        </button>
      </form>
    </div>
  );
}
