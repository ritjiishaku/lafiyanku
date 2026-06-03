import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge";

describe("StatusBadge", () => {
  it("renders draft with amber styling", () => {
    const { container } = render(<StatusBadge status="draft" />);
    expect(container.textContent).toBe("Draft");
  });

  it("renders finalised with teal styling", () => {
    const { container } = render(<StatusBadge status="finalised" />);
    expect(container.textContent).toBe("Finalised");
  });

  it("renders archived with grey styling", () => {
    const { container } = render(<StatusBadge status="archived" />);
    expect(container.textContent).toBe("Archived");
  });
});
