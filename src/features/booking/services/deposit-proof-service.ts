import "server-only";
import { eq, lt } from "drizzle-orm";
import { getDb } from "@/db/client";
import { depositUploads } from "@/db/schema";
import { removeStorageReference } from "@/lib/storage";
import { ApiError } from "@/lib/api/errors";

const ABANDONED_RETENTION_MS = 24 * 60 * 60 * 1000; // 24h

/** Record an upload that is not yet attached to an appointment. */
export async function recordDepositUpload(input: { reference: string; fileName: string; contentType: string }) {
  await getDb().insert(depositUploads).values(input);
}

/** Remove a pending upload row (called when it gets attached or deleted). */
export async function forgetDepositUpload(reference: string) {
  await getDb().delete(depositUploads).where(eq(depositUploads.reference, reference));
}

/**
 * Delete a pre-submit proof: removes the storage object and its tracking row.
 * Used when the customer removes/replaces the proof before submitting.
 */
export async function deleteDepositProof(reference: string) {
  const parsed = parseDepositReference(reference);
  await forgetDepositUpload(reference);
  await removeStorageReference(reference).catch(() => {
    // storage cleanup is best-effort; the row is already gone
  });
  return { reference, parsed };
}

/**
 * Best-effort cleanup of abandoned uploads (never attached to an appointment).
 * Removes storage objects older than the retention window and clears their rows.
 */
export async function cleanupAbandonedDepositUploads(now = new Date()) {
  const cutoff = new Date(now.valueOf() - ABANDONED_RETENTION_MS);
  const db = getDb();
  const stale = await db
    .select({ reference: depositUploads.reference })
    .from(depositUploads)
    .where(lt(depositUploads.createdAt, cutoff));
  for (const row of stale) {
    await removeStorageReference(row.reference).catch(() => {});
  }
  await db.delete(depositUploads).where(lt(depositUploads.createdAt, cutoff));
  return stale.length;
}

export function parseDepositReference(reference: string) {
  if (!reference.startsWith("storage:deposit-proofs/")) {
    throw new ApiError("VALIDATION_ERROR", "Reference bukti deposit tidak valid.", 422);
  }
  return reference.slice("storage:deposit-proofs/".length);
}
