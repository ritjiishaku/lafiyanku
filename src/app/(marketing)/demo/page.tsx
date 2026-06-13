import type { Metadata } from "next";
import { DemoContent } from "./DemoContent";

export const metadata: Metadata = {
  title: "See CareFlow in Action — AI Playground",
  description:
    "See how CareFlow turns clinical input into a discharge summary and patient instructions — in seconds. Uses sample patient data.",
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return <DemoContent />;
}
