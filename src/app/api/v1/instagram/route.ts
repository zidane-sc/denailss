import { addInstagramPostSchema } from "@/features/landing/schemas/api";
import { addInstagramPost, listInstagramPosts, removeInstagramPost } from "@/features/landing/services/instagram-service";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    return apiSuccess({ shortcodes: await listInstagramPosts() });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireApiOwner();
    const parsed = addInstagramPostSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Link embed Instagram tidak dikenali.", 422));
    }
    return apiSuccess(await addInstagramPost(parsed.data.shortcode), {}, 201);
  } catch (error) {
    return apiFailure(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireApiOwner();
    const body = (await request.json().catch(() => ({}))) as { shortcode?: string };
    if (!body.shortcode) throw new ApiError("VALIDATION_ERROR", "Shortcode wajib diisi.", 422);
    return apiSuccess({ shortcodes: await removeInstagramPost(body.shortcode) });
  } catch (error) {
    return apiFailure(error);
  }
}
