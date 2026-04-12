import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "./ChatInput";

describe("ChatInput", () => {
  it("submits trimmed text and clears input", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} disabled={false} />);

    const input = screen.getByPlaceholderText(/ask about/i);
    await user.type(input, "  Find me a table  ");
    await user.keyboard("{Enter}");

    expect(onSend).toHaveBeenCalledWith("Find me a table");
    expect(input).toHaveValue("");
  });

  it("does not submit when empty", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} disabled={false} />);

    await user.keyboard("{Enter}");
    expect(onSend).not.toHaveBeenCalled();
  });

  it("does not submit whitespace-only input", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} disabled={false} />);

    const input = screen.getByPlaceholderText(/ask about/i);
    await user.type(input, "   ");
    await user.keyboard("{Enter}");

    expect(onSend).not.toHaveBeenCalled();
  });

  it("disables input and button when disabled prop is true", () => {
    render(<ChatInput onSend={vi.fn()} disabled={true} />);

    const input = screen.getByPlaceholderText(/ask about/i);
    const button = screen.getByRole("button");

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it("shows typing indicator when streaming", () => {
    render(<ChatInput onSend={vi.fn()} disabled={true} isStreaming={true} />);
    expect(screen.getByPlaceholderText(/agent is typing/i)).toBeInTheDocument();
  });

  it("shows default placeholder when not streaming", () => {
    render(<ChatInput onSend={vi.fn()} disabled={false} isStreaming={false} />);
    expect(screen.getByPlaceholderText(/ask about/i)).toBeInTheDocument();
  });
});
