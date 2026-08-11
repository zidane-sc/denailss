import { listCrmCustomers } from "@/features/crm/services/crm-service";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    await requireApiOwner();
    return apiSuccess(await listCrmCustomers());
  } catch (error) {
    return apiFailure(error);
  }
}
