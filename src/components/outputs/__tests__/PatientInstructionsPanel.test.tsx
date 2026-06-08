import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PatientInstructionsPanel } from "../PatientInstructionsPanel";

describe("PatientInstructionsPanel", () => {
  it("renders the card title", () => {
    render(<PatientInstructionsPanel content="Test instructions" />);
    expect(screen.getByText("Patient Discharge Instructions")).toBeInTheDocument();
  });

  it("renders the provided content", () => {
    const content = "Take your medication as prescribed.";
    render(<PatientInstructionsPanel content={content} />);
    expect(screen.getByText(content)).toBeInTheDocument();
  });

  it("renders empty content without error", () => {
    render(<PatientInstructionsPanel content="" />);
    expect(screen.getByText("Patient Discharge Instructions")).toBeInTheDocument();
  });
});
