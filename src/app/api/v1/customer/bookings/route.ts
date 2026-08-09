import { listBookings } from "@/features/booking/services/booking-service";
import { requireApiCustomer } from "@/lib/supabase/api-auth";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    return apiSuccess(await listBookings(await requireApiCustomer()));
  } catch (error) {
    return apiFailure(error);
  }
}
