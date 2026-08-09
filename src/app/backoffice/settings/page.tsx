import type { Metadata } from "next";
import { SettingsPageView } from "@/features/settings/components/settings-page";

export const metadata: Metadata = {
  title: "Pengaturan | Backoffice Denailss",
  description: "Atur informasi dan kebijakan yang digunakan Denailss.",
};

export default function BackofficeSettingsPage() {
  return <SettingsPageView />;
}
