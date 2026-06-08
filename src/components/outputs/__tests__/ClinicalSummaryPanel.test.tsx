import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClinicalSummaryPanel } from "../ClinicalSummaryPanel";

describe("ClinicalSummaryPanel", () => {
  it("renders the card title", () => {
    render(<ClinicalSummaryPanel content="Test content" />);
    expect(screen.getByText("Clinical Discharge Summary")).toBeInTheDocument();
  });

  it("renders the provided content", () => {
    const content = "Diagnosis: Malaria\nTreatment: IV Artesunate";
    render(<ClinicalSummaryPanel content={content} />);
    expect(screen.getByText(/Diagnosis: Malaria/)).toBeInTheDocument();
    expect(screen.getByText(/Treatment: IV Artesunate/)).toBeInTheDocument();
  });

  it("renders empty content without error", () => {
    render(<ClinicalSummaryPanel content="" />);
    expect(screen.getByText("Clinical Discharge Summary")).toBeInTheDocument();
  });
});
