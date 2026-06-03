import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders without label by default", () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders with custom label", () => {
    render(<LoadingSpinner label="Generating discharge..." />);
    expect(screen.getAllByText("Generating discharge...")).toHaveLength(2);
  });

  it("renders with different sizes without error", () => {
    const { container: sm } = render(<LoadingSpinner size="sm" />);
    expect(sm.querySelector("svg")).toBeInTheDocument();
    const { container: lg } = render(<LoadingSpinner size="lg" />);
    expect(lg.querySelector("svg")).toBeInTheDocument();
  });
});
