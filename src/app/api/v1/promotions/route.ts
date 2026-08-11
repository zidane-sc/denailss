import { createPromotionSchema } from "@/features/promotion/schemas/api";
import { createPromotion, listPromotions } from "@/features/promotion/services/promotion-service";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess, cachedApiSuccess } from "@/lib/api/response";

export async function GET(request: Request) {
  try {
    return cachedApiSuccess(await listPromotions(), request);
  } catch (error) {
    return apiFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireApiOwner();
    const parsed = createPromotionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Data promo tidak valid.", 422));
    }
    return apiSuccess(await createPromotion(parsed.data), {}, 201);
  } catch (error) {
    return apiFailure(error);
  }
}
