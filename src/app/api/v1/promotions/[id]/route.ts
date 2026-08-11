import { updatePromotionSchema } from "@/features/promotion/schemas/api";
import { getPromotionById, updatePromotion } from "@/features/promotion/services/promotion-service";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const promotion = await getPromotionById((await params).id);
    if (!promotion) throw new ApiError("NOT_FOUND", "Promo tidak ditemukan.", 404);
    return apiSuccess(promotion);
  } catch (error) {
    return apiFailure(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiOwner();
    const parsed = updatePromotionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Data promo tidak valid.", 422));
    }
    return apiSuccess(await updatePromotion((await params).id, parsed.data));
  } catch (error) {
    return apiFailure(error);
  }
}
