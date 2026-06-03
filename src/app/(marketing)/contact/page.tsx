import type { Metadata } from "next";
import { ContactSection } from "./ContactSection";

export const metadata: Metadata = {
  title: "Contact — CareFlow",
  description: "Get in touch with the CareFlow team.",
};

export default function ContactPage() {
  return <ContactSection />;
}
