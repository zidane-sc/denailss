import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { customerFavorites } from "@/db/schema";

export async function listFavoriteDesignSlugs(customerId: string): Promise<string[]> {
  const rows = await getDb()
    .select({ designSlug: customerFavorites.designSlug })
    .from(customerFavorites)
    .where(eq(customerFavorites.customerId, customerId))
    .orderBy(customerFavorites.createdAt);
  return rows.map((r) => r.designSlug);
}

/** Idempotent: a duplicate favorite is a no-op (composite PK). */
export async function addFavorite(customerId: string, designSlug: string) {
  await getDb()
    .insert(customerFavorites)
    .values({ customerId, designSlug })
    .onConflictDoNothing();
}

export async function removeFavorite(customerId: string, designSlug: string) {
  await getDb()
    .delete(customerFavorites)
    .where(and(eq(customerFavorites.customerId, customerId), eq(customerFavorites.designSlug, designSlug)));
}
