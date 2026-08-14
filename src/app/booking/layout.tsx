import type { ReactNode } from "react";
import { AvailabilityProvider } from "@/features/booking/components/availability-provider";
import { DepositConfigProvider } from "@/features/booking/components/deposit-config-provider";

export default function BookingLayout({ children }: { children: ReactNode }) {
  return (
    <AvailabilityProvider>
      <DepositConfigProvider>{children}</DepositConfigProvider>
    </AvailabilityProvider>
  );
}
