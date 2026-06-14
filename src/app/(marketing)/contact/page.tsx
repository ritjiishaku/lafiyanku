import type { Metadata } from "next";
import { ContactSection } from "./ContactSection";

export const metadata: Metadata = {
  title: "Contact — Lafiyanku",
  description: "Get in touch with the Lafiyanku team.",
};

export default function ContactPage() {
  return <ContactSection />;
}
