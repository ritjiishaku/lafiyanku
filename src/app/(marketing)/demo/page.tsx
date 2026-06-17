import type { Metadata } from "next";
import { DemoContent } from "./DemoContent";

export const metadata: Metadata = {
  title: "Try Lafiyanku — AI Discharge Documentation Playground",
  description:
    "Experience Lafiyanku first-hand. Edit sample patient data and watch the AI generate a clinical discharge summary and patient-friendly instructions in seconds.",
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return <DemoContent />;
}
