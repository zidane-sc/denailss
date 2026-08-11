import { updateCustomerNotesSchema } from "@/features/crm/schemas/api";
import { updateCustomerNotes } from "@/features/crm/services/crm-service";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiOwner();
    const parsed = updateCustomerNotesSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Catatan tidak valid.", 422));
    }
    return apiSuccess(await updateCustomerNotes((await params).id, parsed.data.content));
  } catch (error) {
    return apiFailure(error);
  }
}
