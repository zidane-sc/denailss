import { setServiceActiveSchema } from "@/features/services/schemas/api";
import { setServiceActive } from "@/features/services/services/service-service";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiOwner();
    const parsed = setServiceActiveSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Data layanan tidak valid.", 422));
    }
    return apiSuccess(await setServiceActive((await params).id, parsed.data.active));
  } catch (error) {
    return apiFailure(error);
  }
}
