import { updateCustomerProfileSchema } from "@/features/customer/schemas/api";
import { getCustomerProfile, updateCustomerProfile } from "@/features/customer/services/customer-service";
import { requireApiAuth } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    const auth = await requireApiAuth();
    if (auth.kind !== "customer") throw new ApiError("FORBIDDEN", "Akses customer diperlukan.", 403);
    return apiSuccess(await getCustomerProfile(auth.userId, auth.email));
  } catch (error) {
    return apiFailure(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireApiAuth();
    if (auth.kind !== "customer") throw new ApiError("FORBIDDEN", "Akses customer diperlukan.", 403);
    const parsed = updateCustomerProfileSchema.safeParse(await request.json());
    if (!parsed.success) return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Profil tidak valid.", 422));
    return apiSuccess(await updateCustomerProfile(auth.userId, parsed.data));
  } catch (error) {
    return apiFailure(error);
  }
}
