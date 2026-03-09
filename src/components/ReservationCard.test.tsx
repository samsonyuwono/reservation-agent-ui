import { render, screen, act, fireEvent } from "@testing-library/react";
import { ReservationCard } from "./ReservationCard";
import type { ReservationCardData } from "../api/types";

const writeText = vi.fn().mockResolvedValue(undefined);

beforeAll(() => {
  Object.defineProperty(window.navigator, "clipboard", {
    value: { writeText },
    writable: false,
    configurable: true,
  });
});

beforeEach(() => {
  writeText.mockClear();
});

describe("ReservationCard", () => {
  const baseData: ReservationCardData = {
    kind: "reservation",
    venue: "Carbone",
    date: "2026-03-10",
    time: "7:00 PM",
    partySize: 2,
    confirmationNumber: "RES-12345",
    status: "Confirmed",
  };

  it("renders venue, date, time, party size, and status", () => {
    render(<ReservationCard data={baseData} />);
    expect(screen.getByText("Carbone")).toBeInTheDocument();
    expect(screen.getByText("2026-03-10")).toBeInTheDocument();
    expect(screen.getByText("7:00 PM")).toBeInTheDocument();
    expect(screen.getByText("2 guests")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
  });

  it("shows confirmation number when present", () => {
    render(<ReservationCard data={baseData} />);
    expect(screen.getByText("#RES-12345")).toBeInTheDocument();
  });

  it("hides confirmation row when no confirmation number", () => {
    const { confirmationNumber: _, ...rest } = baseData;
    render(<ReservationCard data={{ ...rest, confirmationNumber: undefined }} />);
    expect(screen.queryByText("Copy")).not.toBeInTheDocument();
  });

  it("copy button writes to clipboard and shows 'Copied!'", () => {
    render(<ReservationCard data={baseData} />);

    fireEvent.click(screen.getByText("Copy"));

    expect(writeText).toHaveBeenCalledWith("RES-12345");
    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });

  it("copy button resets after 2s", () => {
    vi.useFakeTimers();
    render(<ReservationCard data={baseData} />);

    fireEvent.click(screen.getByText("Copy"));
    expect(screen.getByText("Copied!")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText("Copy")).toBeInTheDocument();
    vi.useRealTimers();
  });
});
