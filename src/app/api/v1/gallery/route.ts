import { createGalleryDesignSchema } from "@/features/gallery/schemas/api";
import { createGalleryDesign, listCatalogGalleryWithImages } from "@/features/gallery/services/gallery-service";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess, cachedApiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    return cachedApiSuccess(await listCatalogGalleryWithImages());
  } catch (error) {
    return apiFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireApiOwner();
    const parsed = createGalleryDesignSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Data desain tidak valid.", 422));
    }
    return apiSuccess(await createGalleryDesign(parsed.data), {}, 201);
  } catch (error) {
    return apiFailure(error);
  }
}
