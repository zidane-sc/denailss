import { apiFailure, apiSuccess } from "@/lib/api/response";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { parseStorageReference, removeStorageReference } from "@/lib/storage";
import { ApiError } from "@/lib/api/errors";

const MANAGED_BUCKETS = new Set(["gallery-images", "service-images", "business-assets"]);

export async function DELETE(request: Request) {
  try {
    await requireApiOwner();
    const body = (await request.json()) as { reference?: string };
    const parsed = body.reference ? parseStorageReference(body.reference) : null;
    if (!parsed || !MANAGED_BUCKETS.has(parsed.bucket)) {
      throw new ApiError("VALIDATION_ERROR", "Reference Storage tidak valid.", 422);
    }
    await removeStorageReference(body.reference!);
    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiFailure(error);
  }
}
