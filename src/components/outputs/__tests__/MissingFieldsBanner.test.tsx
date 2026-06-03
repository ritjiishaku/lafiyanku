import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MissingFieldsBanner } from "../MissingFieldsBanner";

describe("MissingFieldsBanner", () => {
  it("renders nothing when fields array is empty", () => {
    const { container } = render(<MissingFieldsBanner fields={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders missing fields list", () => {
    render(
      <MissingFieldsBanner
        fields={["Diagnosis was not provided", "Medications were not provided"]}
      />,
    );
    expect(screen.getByText("Missing Information")).toBeInTheDocument();
    expect(screen.getByText("Diagnosis was not provided")).toBeInTheDocument();
    expect(screen.getByText("Medications were not provided")).toBeInTheDocument();
  });

  it("renders a single missing field", () => {
    render(<MissingFieldsBanner fields={["Discharged by was not provided"]} />);
    expect(screen.getByText("Discharged by was not provided")).toBeInTheDocument();
  });
});
