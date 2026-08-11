import { getCrmCustomer } from "@/features/crm/services/crm-service";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiOwner();
    const customer = await getCrmCustomer((await params).id);
    if (!customer) throw new ApiError("NOT_FOUND", "Pelanggan tidak ditemukan.", 404);
    return apiSuccess(customer);
  } catch (error) {
    return apiFailure(error);
  }
}
