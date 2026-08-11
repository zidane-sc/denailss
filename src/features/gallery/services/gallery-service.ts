import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { gallery, galleryImages } from "@/db/schema";
import { galleryDesignToRow, rowToGalleryDesign } from "@/db/dto";
import { removeStorageReference } from "@/lib/storage";
import { ApiError } from "@/lib/api/errors";
import type { GalleryDesign } from "@/types";
import type { CreateGalleryDesignInput, UpdateGalleryDesignInput } from "../schemas/api";

/** Public catalog read: gallery metadata + images ordered by `sortOrder`. */
export async function listCatalogGalleryWithImages(): Promise<GalleryDesign[]> {
  const db = getDb();
  const rows = await db.select().from(gallery).orderBy(asc(gallery.title));
  const imageRows = await db.select().from(galleryImages).orderBy(asc(galleryImages.sortOrder));
  const byId = new Map<string, typeof galleryImages.$inferSelect[]>();
  for (const image of imageRows) {
    const list = byId.get(image.galleryId) ?? [];
    list.push(image);
    byId.set(image.galleryId, list);
  }
  return rows.map((row) => rowToGalleryDesign(row, byId.get(row.id) ?? []));
}

export async function getGalleryDesignById(id: string): Promise<GalleryDesign | null> {
  const db = getDb();
  const [row] = await db.select().from(gallery).where(eq(gallery.id, id));
  if (!row) return null;
  const images = await db
    .select()
    .from(galleryImages)
    .where(eq(galleryImages.galleryId, id))
    .orderBy(asc(galleryImages.sortOrder));
  return rowToGalleryDesign(row, images);
}

export async function getGalleryDesignBySlug(slug: string): Promise<GalleryDesign | null> {
  const db = getDb();
  const [row] = await db.select().from(gallery).where(eq(gallery.slug, slug));
  if (!row) return null;
  const images = await db
    .select()
    .from(galleryImages)
    .where(eq(galleryImages.galleryId, row.id))
    .orderBy(asc(galleryImages.sortOrder));
  return rowToGalleryDesign(row, images);
}

export async function createGalleryDesign(input: CreateGalleryDesignInput): Promise<GalleryDesign> {
  const db = getDb();
  const existing = await db.select({ id: gallery.id }).from(gallery).where(eq(gallery.slug, input.slug));
  if (existing.length > 0) {
    throw new ApiError("CONFLICT", "Slug desain sudah dipakai. Gunakan judul yang berbeda.", 409);
  }

  const design: GalleryDesign = {
    id: input.id,
    slug: input.slug,
    title: input.title,
    description: input.description,
    imageSeeds: input.imageSeeds,
    aspect: input.aspect,
    style: input.style,
    color: input.color,
    occasion: input.occasion,
    shape: input.shape,
    difficulty: input.difficulty,
    price: input.price,
  };

  await db.transaction(async (tx) => {
    await tx.insert(gallery).values(galleryDesignToRow(design));
    if (design.imageSeeds.length > 0) {
      await tx.insert(galleryImages).values(
        design.imageSeeds.map((storagePath, index) => ({ galleryId: design.id, storagePath, sortOrder: index }))
      );
    }
  });

  return design;
}

export async function updateGalleryDesign(id: string, input: UpdateGalleryDesignInput): Promise<GalleryDesign> {
  const db = getDb();
  const [current] = await db.select().from(gallery).where(eq(gallery.id, id));
  if (!current) throw new ApiError("NOT_FOUND", "Desain tidak ditemukan.", 404);

  const design: GalleryDesign = {
    id,
    slug: current.slug,
    title: input.title,
    description: input.description,
    imageSeeds: input.imageSeeds,
    aspect: input.aspect,
    style: input.style,
    color: input.color,
    occasion: input.occasion,
    shape: input.shape,
    difficulty: input.difficulty,
    price: input.price,
  };

  let currentPaths: string[] = [];
  await db.transaction(async (tx) => {
    const currentImages = await tx
      .select({ storagePath: galleryImages.storagePath })
      .from(galleryImages)
      .where(eq(galleryImages.galleryId, id));
    currentPaths = currentImages.map((image) => image.storagePath);
    await tx.update(gallery).set(galleryDesignToRow(design)).where(eq(gallery.id, id));
    // Reconcile the full ordered image list (replace-all; cascade FK protects children).
    await tx.delete(galleryImages).where(eq(galleryImages.galleryId, id));
    if (design.imageSeeds.length > 0) {
      await tx.insert(galleryImages).values(
        design.imageSeeds.map((storagePath, index) => ({ galleryId: id, storagePath, sortOrder: index }))
      );
    }
  });

  // Clean up managed Storage objects that are no longer referenced (best-effort).
  const removed = currentPaths.filter((p) => !design.imageSeeds.includes(p));
  await Promise.allSettled(removed.map((p) => removeStorageReference(p)));
  return design;
}

export async function deleteGalleryDesign(id: string): Promise<{ id: string }> {
  const db = getDb();
  const [current] = await db.select().from(gallery).where(eq(gallery.id, id));
  if (!current) throw new ApiError("NOT_FOUND", "Desain tidak ditemukan.", 404);

  const imagePaths = await db
    .select({ storagePath: galleryImages.storagePath })
    .from(galleryImages)
    .where(eq(galleryImages.galleryId, id));

  await db.delete(gallery).where(eq(gallery.id, id));

  await Promise.allSettled(imagePaths.map((image) => removeStorageReference(image.storagePath)));
  return { id };
}
