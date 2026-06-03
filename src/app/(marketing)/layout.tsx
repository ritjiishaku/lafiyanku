import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CareFlow — Clinical Discharge Assistant for Nigerian Hospitals",
  description:
    "AI-powered clinical discharge documentation with Hausa, Yoruba, and Igbo translation. NDPR compliant. Built for Nigerian hospitals.",
  openGraph: {
    title: "CareFlow — Clinical Discharge Assistant for Nigerian Hospitals",
    description:
      "AI-powered clinical discharge documentation with Hausa, Yoruba, and Igbo translation. NDPR compliant. Built for Nigerian hospitals.",
    siteName: "CareFlow",
    locale: "en_NG",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CareFlow — Clinical Discharge Assistant" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CareFlow — Clinical Discharge Assistant for Nigerian Hospitals",
    description:
      "AI-powered discharge documentation in Hausa, Yoruba, and Igbo. NDPR compliant. Built for Nigerian hospitals.",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
