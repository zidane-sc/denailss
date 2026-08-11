import { markContactMessageRead } from "@/features/contact/services/contact-message-service";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireApiOwner();
    const { id } = await context.params;
    return apiSuccess(await markContactMessageRead(id));
  } catch (error) {
    return apiFailure(error);
  }
}
