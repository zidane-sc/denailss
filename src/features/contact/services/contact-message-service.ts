import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { contactMessages } from "@/db/schema";
import { ApiError } from "@/lib/api/errors";
import type { ContactMessage } from "@/types";

type ContactMessageRow = typeof contactMessages.$inferSelect;

function rowToContactMessage(row: ContactMessageRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    instagram: row.instagram ?? undefined,
    message: row.message,
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Persist a submission from the public "Kirim Pesan" form. */
export async function createContactMessage(input: {
  name: string;
  phone: string;
  email: string;
  instagram?: string;
  message: string;
}): Promise<ContactMessage> {
  const [inserted] = await getDb()
    .insert(contactMessages)
    .values({
      name: input.name,
      phone: input.phone,
      email: input.email,
      instagram: input.instagram || null,
      message: input.message,
    })
    .returning();
  if (!inserted) throw new ApiError("INTERNAL_ERROR", "Pesan tidak dapat disimpan.", 500);
  return rowToContactMessage(inserted);
}

/** Owner inbox: all messages, newest first. */
export async function listContactMessages(): Promise<ContactMessage[]> {
  const rows = await getDb()
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt));
  return rows.map(rowToContactMessage);
}

/** Mark one message as read (idempotent). */
export async function markContactMessageRead(id: string): Promise<ContactMessage> {
  const [updated] = await getDb()
    .update(contactMessages)
    .set({ isRead: true, updatedAt: new Date() })
    .where(eq(contactMessages.id, id))
    .returning();
  if (!updated) throw new ApiError("NOT_FOUND", "Pesan tidak ditemukan.", 404);
  return rowToContactMessage(updated);
}

/** Number of unread messages — shown as a badge in the backoffice nav. */
export async function countUnreadContactMessages(): Promise<number> {
  const [row] = await getDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(contactMessages)
    .where(eq(contactMessages.isRead, false));
  return row?.count ?? 0;
}
