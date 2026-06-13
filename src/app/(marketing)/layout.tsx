import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Footer } from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "CareFlow — Discharge Documents Your Patients Can Actually Understand",
  description:
    "AI-powered discharge documentation in English, Hausa, Yoruba, and Igbo. Built for Nigerian hospitals. NDPR compliant. Start your free 30-day pilot.",
  openGraph: {
    title: "CareFlow — Discharge Documents Your Patients Can Actually Understand",
    description:
      "AI-powered discharge documentation in English, Hausa, Yoruba, and Igbo. Built for Nigerian hospitals.",
    siteName: "CareFlow",
    locale: "en_NG",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "CareFlow — Discharge Documents Your Patients Can Actually Understand",
    description:
      "AI-powered discharge documentation in English, Hausa, Yoruba, and Igbo. Built for Nigerian hospitals.",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
