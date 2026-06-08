import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { OfflineBanner } from "../OfflineBanner";

describe("OfflineBanner", () => {
  beforeEach(() => { vi.stubGlobal("navigator", { onLine: true }); });
  afterEach(() => { vi.restoreAllMocks(); });

  it("renders nothing when online", () => {
    const { container } = render(<OfflineBanner />);
    expect(container.textContent).toBe("");
  });
});
