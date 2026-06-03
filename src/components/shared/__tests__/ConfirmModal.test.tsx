import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConfirmModal } from "../ConfirmModal";

describe("ConfirmModal", () => {
  it("renders with title and description", () => {
    render(<ConfirmModal open={true} onOpenChange={vi.fn()} title="Test Title" description="Test Description" confirmLabel="Confirm" onConfirm={vi.fn()} />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });
});
