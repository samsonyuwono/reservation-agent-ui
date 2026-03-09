import { render, screen } from "@testing-library/react";
import { SniperJobCard } from "./SniperJobCard";
import type { SniperJobCardData } from "../api/types";

describe("SniperJobCard", () => {
  const baseData: SniperJobCardData = {
    kind: "sniper",
    jobId: 42,
    restaurant: "Carbone",
    date: "2026-03-15",
    preferredTimes: "7-8 PM",
    status: "pending",
    pollCount: 5,
    maxAttempts: 20,
  };

  it("renders job ID, restaurant, date, times, and progress", () => {
    render(<SniperJobCard data={baseData} />);
    expect(screen.getByText("Sniper #42")).toBeInTheDocument();
    expect(screen.getByText("Carbone")).toBeInTheDocument();
    expect(screen.getByText("2026-03-15")).toBeInTheDocument();
    expect(screen.getByText("7-8 PM")).toBeInTheDocument();
    expect(screen.getByText("5 / 20 attempts")).toBeInTheDocument();
  });

  it("renders pending status", () => {
    const { container } = render(<SniperJobCard data={baseData} />);
    const statusEl = screen.getByText("pending");
    expect(statusEl.className).toContain("statusPending");
    expect(container.querySelector("[class*='statusSuccess']")).toBeNull();
  });

  it("renders completed status with success class", () => {
    const { container } = render(
      <SniperJobCard data={{ ...baseData, status: "completed" }} />,
    );
    expect(container.querySelector("[class*='statusSuccess']")).toBeTruthy();
  });

  it("renders failed status with failed class", () => {
    const { container } = render(
      <SniperJobCard data={{ ...baseData, status: "failed" }} />,
    );
    expect(container.querySelector("[class*='statusFailed']")).toBeTruthy();
  });
});
