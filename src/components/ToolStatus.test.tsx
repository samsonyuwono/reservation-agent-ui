import { render, screen } from "@testing-library/react";
import { ToolStatus } from "./ToolStatus";

describe("ToolStatus", () => {
  it("renders label text", () => {
    render(<ToolStatus label="Searching restaurants…" />);
    expect(screen.getByText("Searching restaurants…")).toBeInTheDocument();
  });

  it("renders 3 pulsing dots when label is present", () => {
    const { container } = render(<ToolStatus label="Working…" />);
    const dots = container.querySelectorAll("[class*='dot']");
    expect(dots).toHaveLength(3);
  });

  it("renders completed tools with checkmarks", () => {
    render(
      <ToolStatus
        label="Checking availability…"
        completedTools={["Searched restaurants", "Browsed by cuisine"]}
      />,
    );
    expect(screen.getByText("Searched restaurants")).toBeInTheDocument();
    expect(screen.getByText("Browsed by cuisine")).toBeInTheDocument();
    const checks = screen.getAllByText("✓");
    expect(checks).toHaveLength(2);
  });

  it("renders arrows between completed steps", () => {
    const { container } = render(
      <ToolStatus
        label="Booking…"
        completedTools={["Searched restaurants", "Checked availability"]}
      />,
    );
    const arrows = container.querySelectorAll("[class*='arrow']");
    // 1 between completed steps + 1 before active label
    expect(arrows).toHaveLength(2);
  });

  it("renders arrow between completed and active step", () => {
    const { container } = render(
      <ToolStatus
        label="Checking availability…"
        completedTools={["Searched restaurants"]}
      />,
    );
    const arrows = container.querySelectorAll("[class*='arrow']");
    expect(arrows).toHaveLength(1);
  });

  it("no dots or label when label is undefined", () => {
    const { container } = render(
      <ToolStatus completedTools={["Searched restaurants"]} />,
    );
    expect(container.querySelectorAll("[class*='dot']")).toHaveLength(0);
    expect(screen.getByText("Searched restaurants")).toBeInTheDocument();
  });

  it("no completed section when array is empty", () => {
    const { container } = render(
      <ToolStatus label="Working…" completedTools={[]} />,
    );
    expect(container.querySelectorAll("[class*='completedLabel']")).toHaveLength(0);
  });
});
