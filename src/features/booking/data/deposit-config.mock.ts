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
    accountName: "Dela Denailss",
  },
  eWallet: {
    provider: "DANA",
    number: "0812-3456-7890",
    accountName: "Dela Denailss",
  },
  paymentMethods: [
    {
      id: "pm-1",
      type: "bank",
      name: "Mandiri",
      accountNumber: "987-654-3210",
      accountName: "Dela Denailss",
    },
    {
      id: "pm-2",
      type: "ewallet",
      name: "DANA",
      accountNumber: "0812-3456-7890",
      accountName: "Dela Denailss",
    },
  ],
  notes:
    "Deposit wajib ditransfer dalam 1 jam setelah booking untuk mengamankan slot. Deposit akan dipotong dari total pembayaran setelah treatment selesai.",
};
