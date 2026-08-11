import { updateExpenseSchema } from "@/features/finance/schemas/api";
import { deleteExpense, updateExpense } from "@/features/finance/services/expense-service";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiOwner();
    const parsed = updateExpenseSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Data pengeluaran tidak valid.", 422));
    }
    return apiSuccess(await updateExpense((await params).id, parsed.data));
  } catch (error) {
    return apiFailure(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiOwner();
    return apiSuccess(await deleteExpense((await params).id));
  } catch (error) {
    return apiFailure(error);
  }
}
