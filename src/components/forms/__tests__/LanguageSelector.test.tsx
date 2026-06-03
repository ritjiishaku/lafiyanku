import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LanguageSelector } from "../LanguageSelector";
import type { ReactNode } from "react";

const testSchema = z.object({
  languageRequested: z.enum(["en", "ha", "yo", "ig"]).optional(),
});

type TestForm = z.infer<typeof testSchema>;

function Wrapper({ children }: { children: ReactNode }) {
  const form = useForm<TestForm>({
    resolver: zodResolver(testSchema),
    defaultValues: { languageRequested: "en" },
  });
  return <FormProvider {...form}>{children}</FormProvider>;
}

describe("LanguageSelector", () => {
  it("renders the language selector label", () => {
    render(
      <Wrapper>
        <LanguageSelector />
      </Wrapper>,
    );
    expect(screen.getByText(/Translation Language/i)).toBeInTheDocument();
  });

  it("shows the current value in the select trigger", () => {
    render(
      <Wrapper>
        <LanguageSelector />
      </Wrapper>,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("en");
  });

  it("renders a select combobox", () => {
    render(
      <Wrapper>
        <LanguageSelector />
      </Wrapper>,
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
