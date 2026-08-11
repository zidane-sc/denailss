import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { depositConfig } from "@/db/schema";
import type { DepositConfig, PaymentMethod } from "@/types";

const CONFIG_ID = "config";

/** Fallback deposit config when the row has not been seeded. */
const FALLBACK: DepositConfig = {
  enabled: true,
  type: "percentage",
  value: 30,
  bankAccount: { bank: "BCA", accountNumber: "1234567890", accountName: "Dela Denailss" },
  eWallet: { provider: "DANA", number: "0812-3456-7890", accountName: "Dela Denailss" },
  paymentMethods: [],
  notes: "",
};

export async function getDepositConfig(): Promise<DepositConfig> {
  const [row] = await getDb().select().from(depositConfig).where(eq(depositConfig.id, CONFIG_ID));
  if (!row) return FALLBACK;
  return {
    enabled: row.enabled,
    type: row.type as DepositConfig["type"],
    value: row.value,
    bankAccount: row.bankAccount as DepositConfig["bankAccount"],
    eWallet: row.eWallet as DepositConfig["eWallet"],
    paymentMethods: (row.paymentMethods as PaymentMethod[]) ?? [],
    notes: row.notes,
  };
}

export async function saveDepositConfig(input: DepositConfig): Promise<DepositConfig> {
  const db = getDb();
  await db
    .insert(depositConfig)
    .values({
      id: CONFIG_ID,
      enabled: input.enabled,
      type: input.type,
      value: input.value,
      bankAccount: input.bankAccount,
      eWallet: input.eWallet,
      paymentMethods: input.paymentMethods,
      notes: input.notes,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: depositConfig.id,
      set: {
        enabled: input.enabled,
        type: input.type,
        value: input.value,
        bankAccount: input.bankAccount,
        eWallet: input.eWallet,
        paymentMethods: input.paymentMethods,
        notes: input.notes,
        updatedAt: new Date(),
      },
    });
  return getDepositConfig();
}
