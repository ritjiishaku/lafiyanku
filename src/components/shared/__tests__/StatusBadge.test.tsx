import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge";

describe("StatusBadge", () => {
  it("renders Draft with amber styling", () => {
    const { container } = render(<StatusBadge status="draft" />);
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("bg-warm-amber/10");
  });

  it("renders Finalised with teal styling", () => {
    const { container } = render(<StatusBadge status="finalised" />);
    expect(screen.getByText("Finalised")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("bg-clinical-teal/10");
  });

  it("renders Archived with grey styling", () => {
    const { container } = render(<StatusBadge status="archived" />);
    expect(screen.getByText("Archived")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("bg-cool-grey/10");
  });
});
