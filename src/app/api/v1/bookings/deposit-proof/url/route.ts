import { apiFailure, apiSuccess } from "@/lib/api/response";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { createStorageSignedUrl, parseStorageReference } from "@/lib/storage";
import { ApiError } from "@/lib/api/errors";

export async function POST(request: Request) {
  try {
    await requireApiOwner();
    const body = (await request.json()) as { reference?: string };
    const parsed = body.reference ? parseStorageReference(body.reference) : null;
    if (!parsed || parsed.bucket !== "deposit-proofs") {
      throw new ApiError("VALIDATION_ERROR", "Reference bukti deposit tidak valid.", 422);
    }
    return apiSuccess({ url: await createStorageSignedUrl(parsed.bucket, parsed.path) });
  } catch (error) {
    return apiFailure(error);
  }
}
