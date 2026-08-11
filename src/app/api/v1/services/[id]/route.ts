import { updateServiceSchema } from "@/features/services/schemas/api";
import { getServiceById, updateService } from "@/features/services/services/service-service";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const service = await getServiceById((await params).id);
    if (!service) throw new ApiError("NOT_FOUND", "Layanan tidak ditemukan.", 404);
    return apiSuccess(service);
  } catch (error) {
    return apiFailure(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiOwner();
    const parsed = updateServiceSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Data layanan tidak valid.", 422));
    }
    return apiSuccess(await updateService((await params).id, parsed.data));
  } catch (error) {
    return apiFailure(error);
  }
}
