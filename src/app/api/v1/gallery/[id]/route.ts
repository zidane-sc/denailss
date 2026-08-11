import { updateGalleryDesignSchema } from "@/features/gallery/schemas/api";
import {
  deleteGalleryDesign,
  getGalleryDesignById,
  updateGalleryDesign,
} from "@/features/gallery/services/gallery-service";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const design = await getGalleryDesignById((await params).id);
    if (!design) throw new ApiError("NOT_FOUND", "Desain tidak ditemukan.", 404);
    return apiSuccess(design);
  } catch (error) {
    return apiFailure(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiOwner();
    const parsed = updateGalleryDesignSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Data desain tidak valid.", 422));
    }
    return apiSuccess(await updateGalleryDesign((await params).id, parsed.data));
  } catch (error) {
    return apiFailure(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiOwner();
    return apiSuccess(await deleteGalleryDesign((await params).id));
  } catch (error) {
    return apiFailure(error);
  }
}
