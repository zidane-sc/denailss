import type { DepositConfig } from "@/types";

/**
 * Mock stand-in for the future `settings` deposit configuration (TRD Epic 3,
 * Deposit Configuration, ADR-005: manual verification, no payment gateway in V1).
 */
export const DEPOSIT_CONFIG: DepositConfig = {
  enabled: true,
  type: "percentage",
  value: 30,
  bankAccount: {
    bank: "BCA",
    accountNumber: "1234567890",
    accountName: "Denailss Studio",
  },
  eWallet: {
    provider: "DANA",
    number: "0812-3456-7890",
    accountName: "Denailss Studio",
  },
  notes:
    "Deposit wajib ditransfer dalam 1 jam setelah booking untuk mengamankan slot. Deposit akan dipotong dari total pembayaran di studio.",
};
