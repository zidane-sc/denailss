import { availabilityConfigSchema } from "@/features/availability/schemas/api";
import { getAvailabilityConfig, saveAvailabilityConfig } from "@/features/booking/services/availability-service";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";
import type { AvailabilityConfig } from "@/types";

export async function GET() {
  try {
    return apiSuccess(await getAvailabilityConfig());
  } catch (error) {
    return apiFailure(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireApiOwner();
    const parsed = availabilityConfigSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Konfigurasi tidak valid.", 422));
    }
    const data = parsed.data;
    const config: AvailabilityConfig = {
      ...data,
      weeklyTemplate: Object.fromEntries(
        Object.entries(data.weeklyTemplate).map(([day, ranges]) => [Number(day), ranges])
      ) as AvailabilityConfig["weeklyTemplate"],
    };
    return apiSuccess(await saveAvailabilityConfig(config));
  } catch (error) {
    return apiFailure(error);
  }
}
