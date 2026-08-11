import "server-only";
import { asc, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { promotions } from "@/db/schema";
import { promotionToRow, rowToPromotion } from "@/db/dto";
import { ApiError } from "@/lib/api/errors";
import type { Promotion } from "@/types";
import type { CreatePromotionInput, UpdatePromotionInput } from "../schemas/api";

export async function listPromotions(): Promise<Promotion[]> {
  const rows = await getDb().select().from(promotions).orderBy(desc(promotions.startDate));
  return rows.map(rowToPromotion);
}

export async function getPromotionById(id: string): Promise<Promotion | null> {
  const [row] = await getDb().select().from(promotions).where(eq(promotions.id, id));
  return row ? rowToPromotion(row) : null;
}

/** Case-insensitive, trim-normalized code lookup. */
export async function getPromotionByCode(code: string): Promise<Promotion | null> {
  const normalized = code.trim().toLowerCase();
  const rows = await getDb().select().from(promotions).where(sql`lower(${promotions.code}) = ${normalized}`);
  return rows[0] ? rowToPromotion(rows[0]) : null;
}

export async function createPromotion(input: CreatePromotionInput): Promise<Promotion> {
  const db = getDb();
  const normalizedCode = input.code.toUpperCase().trim();
  const existing = await db.select({ id: promotions.id }).from(promotions).where(sql`lower(${promotions.code}) = ${normalizedCode.toLowerCase()}`);
  if (existing.length > 0) {
    throw new ApiError("CONFLICT", "Kode promo sudah dipakai. Gunakan kode yang berbeda.", 409);
  }

  const promotion: Promotion = {
    id: input.id,
    code: normalizedCode,
    title: input.title,
    description: input.description,
    discountType: input.discountType,
    discountValue: input.discountValue,
    maximumDiscount: input.maximumDiscount ?? undefined,
    startDate: input.startDate,
    endDate: input.endDate,
    usageLimit: input.usageLimit,
    usedCount: 0,
    minimumSpend: input.minimumSpend ?? undefined,
    applicableServiceSlugs: input.applicableServiceSlugs,
    imageSeed: input.imageSeed ?? undefined,
    active: input.active,
  };

  await db.insert(promotions).values(promotionToRow(promotion));
  return promotion;
}

export async function updatePromotion(id: string, input: UpdatePromotionInput): Promise<Promotion> {
  const db = getDb();
  const [current] = await db.select().from(promotions).where(eq(promotions.id, id));
  if (!current) throw new ApiError("NOT_FOUND", "Promo tidak ditemukan.", 404);

  const promotion: Promotion = {
    id,
    code: current.code,
    title: input.title,
    description: input.description,
    discountType: input.discountType,
    discountValue: input.discountValue,
    maximumDiscount: input.maximumDiscount ?? undefined,
    startDate: input.startDate,
    endDate: input.endDate,
    usageLimit: input.usageLimit,
    usedCount: current.usedCount,
    minimumSpend: input.minimumSpend ?? undefined,
    applicableServiceSlugs: input.applicableServiceSlugs,
    imageSeed: input.imageSeed ?? undefined,
    active: input.active,
  };

  await db.update(promotions).set(promotionToRow(promotion)).where(eq(promotions.id, id));
  return promotion;
}

export async function setPromotionActive(id: string, active: boolean): Promise<Promotion> {
  const db = getDb();
  const [current] = await db.select().from(promotions).where(eq(promotions.id, id));
  if (!current) throw new ApiError("NOT_FOUND", "Promo tidak ditemukan.", 404);
  await db.update(promotions).set({ active, updatedAt: new Date() }).where(eq(promotions.id, id));
  return rowToPromotion({ ...current, active });
}

/** Atomic quota increment — called inside the booking transaction. */
export async function incrementPromotionUsage(code: string) {
  const normalized = code.trim().toLowerCase();
  await getDb()
    .update(promotions)
    .set({ usedCount: sql`${promotions.usedCount} + 1`, updatedAt: new Date() })
    .where(sql`lower(${promotions.code}) = ${normalized}`);
}

export async function listActivePromotions(): Promise<Promotion[]> {
  const rows = await getDb().select().from(promotions).where(eq(promotions.active, true)).orderBy(asc(promotions.startDate));
  return rows.map(rowToPromotion);
}
