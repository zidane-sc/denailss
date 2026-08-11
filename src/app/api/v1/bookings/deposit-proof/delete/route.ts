import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";
import { deleteDepositProof } from "@/features/booking/services/deposit-proof-service";

/**
 * Remove a deposit proof that has not been submitted yet (customer removed or
 * replaced it in the booking form before submitting). Deletes the private
 * storage object and its tracking row.
 */
export async function DELETE(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { reference?: string };
    if (!body.reference || !body.reference.startsWith("storage:deposit-proofs/")) {
      throw new ApiError("VALIDATION_ERROR", "Reference bukti deposit tidak valid.", 422);
    }
    await deleteDepositProof(body.reference);
    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiFailure(error);
  }
}
