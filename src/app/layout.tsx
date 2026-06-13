import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "CareFlow — Clinical Discharge Documentation",
  description:
    "AI-powered clinical discharge documentation assistant for Nigerian hospitals.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CareFlow",
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  description:
    "AI-powered clinical discharge documentation assistant for Nigerian hospitals. Generates clinical summaries and patient-friendly instructions in English, Hausa, Yoruba, and Igbo.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "NGN",
    description: "30-day free pilot",
  },
  creator: {
    "@type": "Organization",
    name: "CareFlow",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex min-h-full flex-col font-sans" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
