import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { gallery, services } from "@/db/schema";

export async function listCatalogServices() {
  return getDb().select().from(services).where(eq(services.active, true)).orderBy(asc(services.name));
}

export async function listCatalogGallery() {
  return getDb().select().from(gallery).orderBy(asc(gallery.title));
}
