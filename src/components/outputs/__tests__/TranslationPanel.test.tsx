import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TranslationPanel } from "../TranslationPanel";

describe("TranslationPanel", () => {
  it("renders nothing when content is null", () => {
    const { container } = render(
      <TranslationPanel content={null} language={null} confidence={null} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders Hausa translation", () => {
    render(
      <TranslationPanel
        content="Maganin ciwon kai"
        language="ha"
        confidence="high"
      />,
    );
    expect(screen.getByText(/Translation.*Hausa/)).toBeInTheDocument();
    expect(screen.getByText("Maganin ciwon kai")).toBeInTheDocument();
  });

  it("renders Yoruba translation", () => {
    render(
      <TranslationPanel
        content="Oogun ikori"
        language="yo"
        confidence="high"
      />,
    );
    expect(screen.getByText(/Translation.*Yoruba/)).toBeInTheDocument();
  });

  it("renders Igbo translation", () => {
    render(
      <TranslationPanel
        content="Ọgwụ isi ọwụwa"
        language="ig"
        confidence="high"
      />,
    );
    expect(screen.getByText(/Translation.*Igbo/)).toBeInTheDocument();
  });

  it("shows fallback warning for low confidence", () => {
    render(
      <TranslationPanel
        content="Take your medication"
        language="ha"
        confidence="low"
      />,
    );
    expect(screen.getByText(/Fallback.*low confidence/i)).toBeInTheDocument();
  });

  it("shows failure warning when confidence is failed", () => {
    render(
      <TranslationPanel
        content="Take your medication"
        language="ha"
        confidence="failed"
      />,
    );
    expect(screen.getByText(/Translation failed/i)).toBeInTheDocument();
  });
});
