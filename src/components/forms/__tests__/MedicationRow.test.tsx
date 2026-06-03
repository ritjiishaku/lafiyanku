import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MedicationRow } from "../MedicationRow";
import type { ReactNode } from "react";

const testSchema = z.object({
  medications: z.array(
    z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      timing: z.string().optional(),
      duration: z.string().optional(),
      notes: z.string().optional(),
    }),
  ),
});

type TestForm = z.infer<typeof testSchema>;

function Wrapper({ children }: { children: ReactNode }) {
  const form = useForm<TestForm>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      medications: [{ name: "", dosage: "", frequency: "" }],
    },
  });
  return <FormProvider {...form}>{children}</FormProvider>;
}

describe("MedicationRow", () => {
  it("renders the medications section title", () => {
    render(
      <Wrapper>
        <MedicationRow />
      </Wrapper>,
    );
    expect(screen.getByText(/Medications/)).toBeInTheDocument();
  });

  it("renders Add Medication button", () => {
    render(
      <Wrapper>
        <MedicationRow />
      </Wrapper>,
    );
    expect(screen.getByText("Add Medication")).toBeInTheDocument();
  });

  it("renders the first medication row with required fields", () => {
    render(
      <Wrapper>
        <MedicationRow />
      </Wrapper>,
    );
    expect(screen.getByText("Medication #1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Amlodipine")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 5mg")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. once daily")).toBeInTheDocument();
  });
});
