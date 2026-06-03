import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuditLogTable } from "../AuditLogTable";

describe("AuditLogTable", () => {
  it("renders empty state when no logs", () => {
    render(<AuditLogTable logs={[]} page={1} totalPages={1} onPageChange={vi.fn()} />);
    expect(screen.getByText("No audit log entries found for this record.")).toBeInTheDocument();
  });
});
