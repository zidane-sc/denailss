import type { Metadata } from "next";
import { MessagesAdminView } from "@/features/contact/components/messages-admin-view";

export const metadata: Metadata = {
  title: "Pesan Masuk | Backoffice Denailss",
  description: "Inbox pesan dari formulir Kirim Pesan di halaman kontak.",
};

export default function BackofficeMessagesPage() {
  return <MessagesAdminView />;
}
