import { favoriteDesignSchema } from "@/features/customer/schemas/api";
import { addFavorite, listFavoriteDesignSlugs, removeFavorite } from "@/features/customer/services/favorite-service";
import { requireApiCustomer } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    const auth = await requireApiCustomer();
    return apiSuccess({ slugs: await listFavoriteDesignSlugs(auth.customerId) });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiCustomer();
    const parsed = favoriteDesignSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Data favorit tidak valid.", 422));
    }
    await addFavorite(auth.customerId, parsed.data.designSlug);
    return apiSuccess({ saved: true }, {}, 201);
  } catch (error) {
    return apiFailure(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireApiCustomer();
    const parsed = favoriteDesignSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Data favorit tidak valid.", 422));
    }
    await removeFavorite(auth.customerId, parsed.data.designSlug);
    return apiSuccess({ removed: true });
  } catch (error) {
    return apiFailure(error);
  }
}
