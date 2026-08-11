import { createReviewSchema } from "@/features/reviews/schemas/api";
import { createReview, getReviewSummary, listReviews } from "@/features/reviews/services/review-service";
import { requireApiCustomer } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    return apiSuccess(await listReviews(), { summary: await getReviewSummary() });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiCustomer();
    const parsed = createReviewSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Data ulasan tidak valid.", 422));
    }
    return apiSuccess(await createReview(parsed.data, auth.customerId), {}, 201);
  } catch (error) {
    return apiFailure(error);
  }
}
