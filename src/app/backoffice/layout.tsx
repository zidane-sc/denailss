import type { Metadata } from "next";
import { BackofficeLayout } from "@/features/appointment/components/backoffice-layout";
import { requireOwner } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Backoffice Command Center",
  description: "Denailss Owner Dashboard and Calendar Command Center",
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireOwner("/backoffice");
  return <BackofficeLayout>{children}</BackofficeLayout>;
}
