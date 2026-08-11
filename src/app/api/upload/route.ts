import { randomUUID } from "node:crypto";
import { apiFailure, apiSuccess } from "@/lib/api/response";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { uploadStorageFile, type StorageCategory } from "@/lib/storage";
import { ApiError } from "@/lib/api/errors";
import { enforceRateLimit } from "@/lib/rate-limit";

const categories = new Set<StorageCategory>(["gallery", "service", "settings"]);

export async function POST(request: Request) {
  try {
    const auth = await requireApiOwner();
    enforceRateLimit(request, "catalog-upload", { limit: 20, windowMs: 60 * 60 * 1000, identity: auth.userId });
    const form = await request.formData();
    const file = form.get("file");
    const category = form.get("category");
    if (!(file instanceof File)) throw new ApiError("VALIDATION_ERROR", "File tidak ditemukan.", 422);
    if (typeof category !== "string" || !categories.has(category as StorageCategory)) {
      throw new ApiError("VALIDATION_ERROR", "Kategori upload tidak valid.", 422);
    }
    if (!file.type.startsWith("image/")) throw new ApiError("VALIDATION_ERROR", "File harus berupa gambar.", 422);
    if (file.size > 6 * 1024 * 1024) throw new ApiError("VALIDATION_ERROR", "Ukuran file maksimal 6 MB.", 422);

    const extension = file.name.split(".").pop()?.toLowerCase();
    const safeExtension = extension && /^[a-z0-9]{2,5}$/.test(extension) ? extension : "jpg";
    const path = `${category}/${auth.userId}/${randomUUID()}.${safeExtension}`;
    const reference = await uploadStorageFile(category as StorageCategory, path, file);
    const bucket = reference.slice("storage:".length).split("/")[0];
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
    return apiSuccess({ reference, path, bucket, contentType: file.type, url });
  } catch (error) {
    return apiFailure(error);
  }
}
