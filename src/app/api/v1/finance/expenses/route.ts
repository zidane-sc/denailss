import { createExpenseSchema } from "@/features/finance/schemas/api";
import { createExpense, listExpenses } from "@/features/finance/services/expense-service";
import { requireApiOwner } from "@/lib/supabase/api-auth";
import { ApiError } from "@/lib/api/errors";
import { apiFailure, apiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    await requireApiOwner();
    return apiSuccess(await listExpenses());
  } catch (error) {
    return apiFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireApiOwner();
    const parsed = createExpenseSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiFailure(new ApiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Data pengeluaran tidak valid.", 422));
    }
    return apiSuccess(await createExpense(parsed.data), {}, 201);
  } catch (error) {
    return apiFailure(error);
  }
}
