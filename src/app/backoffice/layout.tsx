import type { Metadata } from "next";
import { BackofficeLayout } from "@/features/appointment/components/backoffice-layout";

export const metadata: Metadata = {
  title: "Backoffice Command Center",
  description: "Denailss Owner Dashboard and Calendar Command Center",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <BackofficeLayout>{children}</BackofficeLayout>;
}
