import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const STORAGE_BUCKETS = {
  gallery: "gallery-images",
  service: "service-images",
  settings: "business-assets",
  deposit: "deposit-proofs",
} as const;

export type StorageCategory = keyof typeof STORAGE_BUCKETS;

export function storageReference(bucket: string, path: string) {
  return `storage:${bucket}/${path}`;
}

export function parseStorageReference(reference: string) {
  if (!reference.startsWith("storage:")) return null;
  const [bucket, ...pathParts] = reference.slice("storage:".length).split("/");
  if (!bucket || pathParts.length === 0) return null;
  return { bucket, path: pathParts.join("/") };
}

export async function uploadStorageFile(category: StorageCategory, path: string, file: File) {
  const admin = createSupabaseAdminClient();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await admin.storage.from(STORAGE_BUCKETS[category]).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return storageReference(STORAGE_BUCKETS[category], path);
}

export async function removeStorageReference(reference: string) {
  const parsed = parseStorageReference(reference);
  if (!parsed) return;
  const admin = createSupabaseAdminClient();
  const { error } = await admin.storage.from(parsed.bucket).remove([parsed.path]);
  if (error) throw error;
}

export async function createStorageSignedUrl(bucket: string, path: string, expiresIn = 300) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) throw error ?? new Error("Signed URL tidak tersedia.");
  return data.signedUrl;
}
