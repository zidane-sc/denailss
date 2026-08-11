import { z } from "zod";

const paymentMethodSchema = z.object({
  id: z.string().trim().min(1),
  type: z.enum(["bank", "ewallet", "other"]),
  name: z.string().trim().min(1, "Nama metode wajib diisi."),
  accountNumber: z.string().trim().min(1, "Nomor akun wajib diisi."),
  accountName: z.string().trim().min(1, "Nama pemilik akun wajib diisi."),
});

export const depositConfigSchema = z.object({
  enabled: z.boolean(),
  type: z.enum(["fixed", "percentage"]),
  value: z.number().int().nonnegative("Nilai deposit tidak boleh negatif."),
  bankAccount: z.object({
    bank: z.string().trim().min(1, "Nama bank wajib diisi."),
    accountNumber: z.string().trim().min(1, "Nomor rekening wajib diisi."),
    accountName: z.string().trim().min(1, "Nama pemilik rekening wajib diisi."),
  }),
  eWallet: z.object({
    provider: z.string().trim().min(1, "Nama e-wallet wajib diisi."),
    number: z.string().trim().min(1, "Nomor e-wallet wajib diisi."),
    accountName: z.string().trim().min(1, "Nama pemilik e-wallet wajib diisi."),
  }),
  paymentMethods: z.array(paymentMethodSchema).default([]),
  notes: z.string().trim().default(""),
});

export type DepositConfigInput = z.infer<typeof depositConfigSchema>;
