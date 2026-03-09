import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AvailabilityCard } from "./AvailabilityCard";
import type { AvailabilityCardData } from "../api/types";

const data: AvailabilityCardData = {
  kind: "availability",
  date: "2026-03-10",
  partySize: 4,
  slots: [
    { time: "7:00 PM", type: "Indoor", configId: "cfg-1" },
    { time: "8:30 PM", type: "Outdoor", configId: "cfg-2" },
  ],
};

describe("AvailabilityCard", () => {
  it("renders date and party size", () => {
    render(<AvailabilityCard data={data} onBook={vi.fn()} />);
    expect(screen.getByText(/2026-03-10/)).toBeInTheDocument();
    expect(screen.getByText(/4 guests/)).toBeInTheDocument();
  });

  it("renders all time slot pills", () => {
    render(<AvailabilityCard data={data} onBook={vi.fn()} />);
    expect(screen.getByText("7:00 PM")).toBeInTheDocument();
    expect(screen.getByText("8:30 PM")).toBeInTheDocument();
  });

  it("first click changes pill to 'Confirm?'", async () => {
    const user = userEvent.setup();
    render(<AvailabilityCard data={data} onBook={vi.fn()} />);

    await user.click(screen.getByText("7:00 PM"));
    expect(screen.getByText("Confirm?")).toBeInTheDocument();
    // Other pill unaffected
    expect(screen.getByText("8:30 PM")).toBeInTheDocument();
  });

  it("second click on same pill calls onBook", async () => {
    const user = userEvent.setup();
    const onBook = vi.fn();
    render(<AvailabilityCard data={data} onBook={onBook} />);

    await user.click(screen.getByText("7:00 PM"));
    await user.click(screen.getByText("Confirm?"));

    expect(onBook).toHaveBeenCalledWith("Book the 7:00 PM slot");
  });

  it("clicking different pill resets previous confirmation", async () => {
    const user = userEvent.setup();
    render(<AvailabilityCard data={data} onBook={vi.fn()} />);

    await user.click(screen.getByText("7:00 PM"));
    expect(screen.getByText("Confirm?")).toBeInTheDocument();

    await user.click(screen.getByText("8:30 PM"));
    // First pill resets to its time, second shows Confirm
    expect(screen.getByText("7:00 PM")).toBeInTheDocument();
    expect(screen.getByText("Confirm?")).toBeInTheDocument();
  });

  it("auto-resets confirmation after 3s", () => {
    vi.useFakeTimers();
    render(<AvailabilityCard data={data} onBook={vi.fn()} />);

    // Use fireEvent instead of userEvent to avoid async timer issues
    const pill = screen.getByText("7:00 PM");
    act(() => {
      pill.click();
    });
    expect(screen.getByText("Confirm?")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText("7:00 PM")).toBeInTheDocument();
    expect(screen.queryByText("Confirm?")).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
