import type { Metadata } from "next";
import { ContactView } from "@/features/contact/components/contact-view";

export const metadata: Metadata = {
  title: "Hubungi Kami & Lokasi Kami | Denailss",
  description:
    "Lokasi Denailss, peta petunjuk arah, kontak WhatsApp resmi, profil Instagram, dan formulir hubungi kami.",
};

export default function ContactPage() {
  return <ContactView />;
}
