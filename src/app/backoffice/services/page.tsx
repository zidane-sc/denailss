import type { Metadata } from "next";
import { ServiceAdminListView } from "@/features/services/components/service-admin-list-view";

export const metadata: Metadata = {
  title: "Kelola Layanan | Backoffice Denailss",
  description: "Atur layanan yang bisa dibooking customer di Denailss.",
};

export default function BackofficeServicesPage() {
  return <ServiceAdminListView />;
}
