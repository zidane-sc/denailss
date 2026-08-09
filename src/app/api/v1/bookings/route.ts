import { createBookingSchema } from "@/features/booking/schemas/api";
import { createBooking, listBookings } from "@/features/booking/services/booking-service";
import { getApiAuthContext, requireApiAuth } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    return apiSuccess(await listBookings(await requireApiAuth()));
  } catch (error) {
    return apiFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    const parsed = createBookingSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Data booking tidak valid.", 422));
    }
    return apiSuccess(await createBooking(parsed.data, await getApiAuthContext()), {}, 201);
  } catch (error) {
    return apiFailure(error);
  }
}
