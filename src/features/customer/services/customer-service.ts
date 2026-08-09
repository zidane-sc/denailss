import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { customers, users } from "@/db/schema";
import { ApiError } from "@/lib/api/errors";
import type { UpdateCustomerProfileInput } from "../schemas/api";

export async function getCustomerProfile(userId: string, email?: string) {
  const db = getDb();
  const [existing] = await db.select().from(customers).where(eq(customers.userId, userId));
  if (!existing && email) {
    const [created] = await db.insert(customers).values({ userId, name: email.split("@")[0], phone: "", email }).returning();
    if (created) return created;
  }
  const [profile] = await db
    .select({ id: customers.id, name: customers.name, phone: customers.phone, email: customers.email, notes: customers.notes })
    .from(customers)
    .where(eq(customers.userId, userId));
  if (!profile) throw new ApiError("NOT_FOUND", "Profil customer belum tersedia.", 404);
  return profile;
}

export async function updateCustomerProfile(userId: string, input: UpdateCustomerProfileInput) {
  const db = getDb();
  const [profile] = await db
    .update(customers)
    .set({ name: input.name, phone: input.phone, notes: input.notes || null, updatedAt: new Date() })
    .where(eq(customers.userId, userId))
    .returning({ id: customers.id, name: customers.name, phone: customers.phone, email: customers.email, notes: customers.notes });
  if (!profile) throw new ApiError("NOT_FOUND", "Profil customer belum tersedia.", 404);
  await db.update(users).set({ name: input.name, phone: input.phone, updatedAt: new Date() }).where(eq(users.id, userId));
  return profile;
}
