import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageBubble } from "./MessageBubble";
import type { ChatMessage } from "../api/types";

// Mock react-markdown to avoid ESM issues in test environment
vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));

// Mock useRelativeTime
vi.mock("../hooks/useRelativeTime", () => ({
  useRelativeTime: () => "just now",
}));

function makeMsg(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "msg-1",
    role: "user",
    text: "Hello",
    timestamp: Date.now(),
    ...overrides,
  };
}

describe("MessageBubble", () => {
  it("renders user message as plain <p>", () => {
    render(<MessageBubble message={makeMsg()} onSend={vi.fn()} />);
    const p = screen.getByText("Hello");
    expect(p.tagName).toBe("P");
  });

  it("renders assistant message through ReactMarkdown", () => {
    render(
      <MessageBubble
        message={makeMsg({ role: "assistant", text: "Hi there" })}
        onSend={vi.fn()}
      />,
    );
    expect(screen.getByTestId("markdown")).toHaveTextContent("Hi there");
  });

  it("shows retry button on error with onRetry", () => {
    render(
      <MessageBubble
        message={makeMsg({ role: "assistant", isError: true, text: "Error: fail" })}
        onSend={vi.fn()}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("clicking retry calls onRetry", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <MessageBubble
        message={makeMsg({ role: "assistant", isError: true, text: "Error" })}
        onSend={vi.fn()}
        onRetry={onRetry}
      />,
    );

    await user.click(screen.getByText("Retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("no retry button when onRetry not provided", () => {
    render(
      <MessageBubble
        message={makeMsg({ role: "assistant", isError: true, text: "Error" })}
        onSend={vi.fn()}
      />,
    );
    expect(screen.queryByText("Retry")).not.toBeInTheDocument();
  });

  it("shows timestamp", () => {
    render(<MessageBubble message={makeMsg()} onSend={vi.fn()} />);
    expect(screen.getByText("just now")).toBeInTheDocument();
  });

  it("renders embedded availability card", () => {
    const msg = makeMsg({
      role: "assistant",
      text: "Here are slots",
      cards: [
        {
          kind: "availability",
          date: "2026-03-10",
          partySize: 2,
          slots: [{ time: "7:00 PM", type: "Indoor", configId: "c1" }],
        },
      ],
    });
    render(<MessageBubble message={msg} onSend={vi.fn()} />);
    expect(screen.getByText("7:00 PM")).toBeInTheDocument();
  });
});
