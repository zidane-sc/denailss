import { getAvailabilityConfig } from "@/features/booking/services/availability-service";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    return apiSuccess(await getAvailabilityConfig());
  } catch (error) {
    return apiFailure(error);
  }
}
