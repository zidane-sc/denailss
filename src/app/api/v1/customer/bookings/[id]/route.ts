import { getBooking } from "@/features/booking/services/booking-service";
import { requireApiCustomer } from "@/lib/supabase/api-auth";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    return apiSuccess(await getBooking((await params).id, await requireApiCustomer()));
  } catch (error) {
    return apiFailure(error);
  }
}
