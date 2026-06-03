import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FlaggedIssuesBanner } from "../FlaggedIssuesBanner";

describe("FlaggedIssuesBanner", () => {
  it("renders nothing when issues array is empty", () => {
    const { container } = render(<FlaggedIssuesBanner issues={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders issues list", () => {
    render(
      <FlaggedIssuesBanner
        issues={[
          "Dosage not provided for Amoxicillin",
          "Discharge date before admission date",
        ]}
      />,
    );
    expect(screen.getByText("Issues Detected")).toBeInTheDocument();
    expect(
      screen.getByText("Dosage not provided for Amoxicillin"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Discharge date before admission date"),
    ).toBeInTheDocument();
  });
});
