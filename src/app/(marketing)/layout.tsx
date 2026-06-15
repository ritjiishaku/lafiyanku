import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Footer } from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "Lafiyanku — Discharge Documents Your Patients Can Actually Understand",
  description:
    "AI-powered discharge documentation in English, Hausa, Yoruba, and Igbo. Built for Nigerian hospitals. NDPR compliant. Start your free 30-day pilot.",
  openGraph: {
    title: "Lafiyanku — Discharge Documents Your Patients Can Actually Understand",
    description:
      "AI-powered discharge documentation in English, Hausa, Yoruba, and Igbo. Built for Nigerian hospitals.",
    siteName: "Lafiyanku",
    locale: "en_NG",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Lafiyanku — AI-powered discharge documentation for Nigerian hospitals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lafiyanku — Discharge Documents Your Patients Can Actually Understand",
    description:
      "AI-powered discharge documentation in English, Hausa, Yoruba, and Igbo. Built for Nigerian hospitals.",
    images: ["/og-image.svg"],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL,
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
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
