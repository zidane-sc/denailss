import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { services } from "@/db/schema";
import { rowToService, serviceToRow } from "@/db/dto";
import { removeStorageReference } from "@/lib/storage";
import { ApiError } from "@/lib/api/errors";
import type { Service } from "@/types";
import type { UpdateServiceInput } from "../schemas/api";

/** All services (active + inactive) — admin and provider reads; public surfaces filter `active`. */
export async function listCatalogServicesAll(): Promise<Service[]> {
  const rows = await getDb().select().from(services).orderBy(asc(services.name));
  return rows.map(rowToService);
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const [row] = await getDb().select().from(services).where(eq(services.slug, slug));
  return row ? rowToService(row) : null;
}

export async function getServiceById(id: string): Promise<Service | null> {
  const [row] = await getDb().select().from(services).where(eq(services.id, id));
  return row ? rowToService(row) : null;
}

export async function updateService(id: string, input: UpdateServiceInput): Promise<Service> {
  const db = getDb();
  const [current] = await db.select().from(services).where(eq(services.id, id));
  if (!current) throw new ApiError("NOT_FOUND", "Layanan tidak ditemukan.", 404);

  const service: Service = {
    id: current.id,
    slug: current.slug,
    name: input.name,
    shortDescription: input.shortDescription,
    description: input.description,
    priceFrom: input.priceFrom,
    priceNote: input.priceNote ?? undefined,
    durationMinutes: input.durationMinutes,
    tiers: input.tiers,
    requiresPickup: input.requiresPickup,
    heroImage: input.heroImage,
    gallerySeeds: input.gallerySeeds,
    faq: input.faq,
    depositApplicable: input.depositApplicable,
    active: input.active,
  };

  await db.update(services).set(serviceToRow(service)).where(eq(services.id, id));

  // Clean up the replaced hero if it was a managed Storage object and is no longer used.
  if (current.heroImage !== service.heroImage && service.gallerySeeds.includes(current.heroImage) === false) {
    await removeStorageReference(current.heroImage).catch(() => {});
  }
  return service;
}

export async function setServiceActive(id: string, active: boolean): Promise<Service> {
  const db = getDb();
  const [current] = await db.select().from(services).where(eq(services.id, id));
  if (!current) throw new ApiError("NOT_FOUND", "Layanan tidak ditemukan.", 404);
  const updated = { ...current, active, updatedAt: new Date() };
  await db.update(services).set({ active, updatedAt: new Date() }).where(eq(services.id, id));
  return rowToService(updated);
}
