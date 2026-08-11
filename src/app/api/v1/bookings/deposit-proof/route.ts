import { randomUUID } from "node:crypto";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";
import { uploadStorageFile } from "@/lib/storage";
import { enforceRateLimit } from "@/lib/rate-limit";
import { recordDepositUpload } from "@/features/booking/services/deposit-proof-service";

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, "deposit-proof-upload", { limit: 5, windowMs: 60 * 60 * 1000 });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ApiError("VALIDATION_ERROR", "File tidak ditemukan.", 422);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      throw new ApiError("VALIDATION_ERROR", "Bukti transfer harus JPG, PNG, atau WebP.", 422);
    }
    if (file.size > 5 * 1024 * 1024) throw new ApiError("VALIDATION_ERROR", "Ukuran bukti transfer maksimal 5 MB.", 422);

    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `pending/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
    const reference = await uploadStorageFile("deposit", path, file);
    await recordDepositUpload({ reference, fileName: file.name, contentType: file.type });
    return apiSuccess({ reference, fileName: file.name, contentType: file.type }, {}, 201);
  } catch (error) {
    return apiFailure(error);
  }
}
