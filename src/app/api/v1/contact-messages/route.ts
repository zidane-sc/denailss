import {
  countUnreadContactMessages,
  createContactMessage,
  listContactMessages,
} from "@/features/contact/services/contact-message-service";
import { createContactMessageSchema } from "@/features/contact/schemas/api";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET() {
  try {
    await requireApiOwner();
    return apiSuccess(await listContactMessages(), { unread: await countUnreadContactMessages() });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    // The form is public; guard it against spam like the upload endpoints.
    enforceRateLimit(request, "contact-message", { limit: 5, windowMs: 60 * 60 * 1000 });
    const parsed = createContactMessageSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Data pesan tidak valid.", 422));
    }
    return apiSuccess(await createContactMessage(parsed.data), {}, 201);
  } catch (error) {
    return apiFailure(error);
  }
}
