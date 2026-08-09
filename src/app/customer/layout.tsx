import { PortalLayout } from "@/features/customer/components/portal-layout";
import { requireCustomer } from "@/lib/supabase/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Portal",
};

export default async function CustomerRootLayout({ children }: { children: React.ReactNode }) {
  await requireCustomer("/customer");
  return <PortalLayout>{children}</PortalLayout>;
}
