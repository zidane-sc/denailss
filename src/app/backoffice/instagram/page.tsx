import type { Metadata } from "next";
import { InstagramAdminView } from "@/features/landing/components/instagram-admin-view";

export const metadata: Metadata = {
  title: "Grid Instagram | Backoffice Denailss",
  description: "Kelola postingan Instagram yang tampil di halaman utama Denailss.",
};

export default function BackofficeInstagramPage() {
  return <InstagramAdminView />;
}
