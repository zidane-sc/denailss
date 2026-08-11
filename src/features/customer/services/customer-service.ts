import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { appointments, customers, customerFavorites, customerNotes, reviews, users } from "@/db/schema";
import { ApiError } from "@/lib/api/errors";
import type { UpdateCustomerProfileInput } from "../schemas/api";

/**
 * Link anonymous (user-less) customer rows to a logged-in account, matched by
 * email. Runs on every profile fetch so guest bookings made after a logout get
 * merged in on the next login. The account row is canonical: bookings,
 * favorites, reviews and notes of any other anon rows with the same email are
 * re-pointed to it, then those rows are deleted.
 */
export async function claimAnonymousCustomer(userId: string, email: string) {
  const db = getDb();
  const anonRows = await db
    .select()
    .from(customers)
    .where(and(isNull(customers.userId), eq(customers.email, email)));

  if (anonRows.length === 0) return;

  const [accountRow] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.userId, userId));

  const rowsToMerge = [...anonRows];
  let targetId: string;

  if (accountRow) {
    targetId = accountRow.id;
  } else {
    // First-time claim: adopt the oldest anon row as the account row.
    const [primary] = anonRows.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    await db.update(customers).set({ userId, updatedAt: new Date() }).where(eq(customers.id, primary.id));
    targetId = primary.id;
    rowsToMerge.shift();
  }

  for (const row of rowsToMerge) {
    await db.transaction(async (tx) => {
      await tx.update(appointments).set({ customerId: targetId }).where(eq(appointments.customerId, row.id));
      await tx.update(reviews).set({ customerId: targetId }).where(eq(reviews.customerId, row.id));

      // Favorites: merge the anon row's designs into the target, skipping ones
      // the target already has.
      const anonFavs = await tx
        .select({ customerId: customerFavorites.customerId, designSlug: customerFavorites.designSlug })
        .from(customerFavorites)
        .where(eq(customerFavorites.customerId, row.id));
      for (const fav of anonFavs) {
        const [dup] = await tx
          .select({ customerId: customerFavorites.customerId })
          .from(customerFavorites)
          .where(and(eq(customerFavorites.customerId, targetId), eq(customerFavorites.designSlug, fav.designSlug)));
        if (dup) {
          await tx.delete(customerFavorites).where(and(eq(customerFavorites.customerId, row.id), eq(customerFavorites.designSlug, fav.designSlug)));
        } else {
          await tx.update(customerFavorites).set({ customerId: targetId }).where(eq(customerFavorites.customerId, row.id));
        }
      }

      // Notes: keep the target's note, drop the anon's.
      const [existingNote] = await tx
        .select({ customerId: customerNotes.customerId })
        .from(customerNotes)
        .where(eq(customerNotes.customerId, targetId));
      if (!existingNote) {
        await tx.update(customerNotes).set({ customerId: targetId }).where(eq(customerNotes.customerId, row.id));
      } else {
        await tx.delete(customerNotes).where(eq(customerNotes.customerId, row.id));
      }

      await tx.delete(customers).where(eq(customers.id, row.id));
    });
  }
}

export async function getCustomerProfile(userId: string, email?: string) {
  const db = getDb();
  if (email) await claimAnonymousCustomer(userId, email);

  const [existing] = await db.select().from(customers).where(eq(customers.userId, userId));
  if (existing) return existing;
  if (!email) throw new ApiError("NOT_FOUND", "Profil customer belum tersedia.", 404);

  const [created] = await db
    .insert(customers)
    .values({ userId, name: email.split("@")[0], phone: "", email })
    .returning();
  if (created) return created;
  throw new ApiError("NOT_FOUND", "Profil customer belum tersedia.", 404);
}

export async function updateCustomerProfile(userId: string, input: UpdateCustomerProfileInput) {
  const db = getDb();
  const [profile] = await db
    .update(customers)
    .set({ name: input.name, phone: input.phone, instagram: input.instagram || null, notes: input.notes || null, updatedAt: new Date() })
    .where(eq(customers.userId, userId))
    .returning({ id: customers.id, name: customers.name, phone: customers.phone, email: customers.email, instagram: customers.instagram, notes: customers.notes });
  if (!profile) throw new ApiError("NOT_FOUND", "Profil customer belum tersedia.", 404);
  await db.update(users).set({ name: input.name, phone: input.phone, updatedAt: new Date() }).where(eq(users.id, userId));
  return profile;
}
