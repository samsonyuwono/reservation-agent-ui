import { render, screen } from "@testing-library/react";
import { ToolStatus } from "./ToolStatus";

describe("ToolStatus", () => {
  it("renders label text", () => {
    render(<ToolStatus label="Searching restaurants…" />);
    expect(screen.getByText("Searching restaurants…")).toBeInTheDocument();
  });

  it("renders 3 pulsing dots", () => {
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
    // Checkmark character ✓
    const checks = screen.getAllByText("✓");
    expect(checks).toHaveLength(2);
  });

  it("no completed section when array is empty", () => {
    const { container } = render(
      <ToolStatus label="Working…" completedTools={[]} />,
    );
    expect(container.querySelectorAll("[class*='completed']")).toHaveLength(0);
  });
});
