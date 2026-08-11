import { randomUUID } from "node:crypto";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";
import { uploadStorageFile } from "@/lib/storage";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requireApiCustomer } from "@/lib/supabase/api-auth";

/**
 * Customer upload of a review photo to the private review-images bucket.
 * Follows the deposit-proof pattern: customer-gated + rate-limited.
 */
export async function POST(request: Request) {
  try {
    const auth = await requireApiCustomer();
    enforceRateLimit(request, "review-photo-upload", { limit: 5, windowMs: 60 * 60 * 1000, identity: auth.userId });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ApiError("VALIDATION_ERROR", "File tidak ditemukan.", 422);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      throw new ApiError("VALIDATION_ERROR", "Foto ulasan harus JPG, PNG, atau WebP.", 422);
    }
    if (file.size > 5 * 1024 * 1024) throw new ApiError("VALIDATION_ERROR", "Ukuran foto ulasan maksimal 5 MB.", 422);

    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${auth.customerId}/${randomUUID()}.${extension}`;
    const reference = await uploadStorageFile("review", path, file);
    return apiSuccess({ reference, fileName: file.name, contentType: file.type }, {}, 201);
  } catch (error) {
    return apiFailure(error);
  }
}
