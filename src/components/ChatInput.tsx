import { FormEvent, useState } from "react";
import styles from "./ChatInput.module.css";

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
  isStreaming?: boolean;
}

export function ChatInput({ onSend, disabled, isStreaming }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <form className={styles.bar} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        placeholder={isStreaming ? "Agent is typing\u2026" : "Ask about restaurants, availability, or bookings\u2026"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        autoFocus
      />
      <button className={styles.send} type="submit" disabled={disabled || !value.trim()}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </form>
  );
}
