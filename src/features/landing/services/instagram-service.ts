import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { instagramPosts } from "@/db/schema";
import { ApiError } from "@/lib/api/errors";

export { INSTAGRAM_POST_URL, parseInstagramShortcode } from "../logic/instagram";

export async function listInstagramPosts(): Promise<string[]> {
  const rows = await getDb()
    .select({ shortcode: instagramPosts.shortcode })
    .from(instagramPosts)
    .orderBy(asc(instagramPosts.sortOrder));
  return rows.map((r) => r.shortcode);
}

export async function addInstagramPost(shortcode: string): Promise<{ list: string[]; added: boolean }> {
  const db = getDb();
  const existing = await db
    .select({ id: instagramPosts.id })
    .from(instagramPosts)
    .where(eq(instagramPosts.shortcode, shortcode));
  if (existing.length > 0) {
    return { list: await listInstagramPosts(), added: false };
  }
  const [row] = await db
    .select({ max: instagramPosts.sortOrder })
    .from(instagramPosts)
    .orderBy(asc(instagramPosts.sortOrder));
  const nextOrder = (row?.max ?? 0) - 1; // newest first
  await db.insert(instagramPosts).values({ shortcode, sortOrder: nextOrder });
  return { list: await listInstagramPosts(), added: true };
}

export async function removeInstagramPost(shortcode: string): Promise<string[]> {
  const db = getDb();
  const [existing] = await db
    .select({ id: instagramPosts.id })
    .from(instagramPosts)
    .where(eq(instagramPosts.shortcode, shortcode));
  if (!existing) throw new ApiError("NOT_FOUND", "Postingan tidak ditemukan.", 404);
  await db.delete(instagramPosts).where(eq(instagramPosts.shortcode, shortcode));
  return listInstagramPosts();
}
