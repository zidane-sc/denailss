import { setPromotionActiveSchema } from "@/features/promotion/schemas/api";
import { setPromotionActive } from "@/features/promotion/services/promotion-service";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiOwner();
    const parsed = setPromotionActiveSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Data promo tidak valid.", 422));
    }
    return apiSuccess(await setPromotionActive((await params).id, parsed.data.active));
  } catch (error) {
    return apiFailure(error);
  }
}
