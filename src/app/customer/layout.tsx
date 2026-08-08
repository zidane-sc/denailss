import { PortalLayout } from "@/features/customer/components/portal-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Portal",
};

export default function CustomerRootLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>;
}
