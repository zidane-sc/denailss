import { depositConfigSchema } from "@/features/booking/schemas/deposit";
import { getDepositConfig, saveDepositConfig } from "@/features/booking/services/deposit-service";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    return apiSuccess(await getDepositConfig());
  } catch (error) {
    return apiFailure(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireApiOwner();
    const parsed = depositConfigSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Konfigurasi deposit tidak valid.", 422));
    }
    return apiSuccess(await saveDepositConfig(parsed.data));
  } catch (error) {
    return apiFailure(error);
  }
}
