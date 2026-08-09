import { updateBookingSchema } from "@/features/booking/schemas/api";
import { getBooking, updateBooking } from "@/features/booking/services/booking-service";
import { requireApiAuth, requireApiOwner } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    return apiSuccess(await getBooking((await params).id, await requireApiAuth()));
  } catch (error) {
    return apiFailure(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const parsed = updateBookingSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Perubahan booking tidak valid.", 422));
    }
    return apiSuccess(await updateBooking((await params).id, parsed.data, await requireApiOwner()));
  } catch (error) {
    return apiFailure(error);
  }
}
