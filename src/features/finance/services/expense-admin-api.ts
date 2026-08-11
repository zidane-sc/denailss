import type { Expense } from "../types";

type ApiEnvelope<T> = { data?: T; error?: { message?: string } };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const payload = (await res.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!res.ok) {
    throw new Error(payload.error?.message ?? "Terjadi kesalahan pada server.");
  }
  if (payload.data === undefined) {
    throw new Error("Respons API tidak valid.");
  }
  return payload.data;
}

export async function listExpensesApi(): Promise<Expense[]> {
  return request<Expense[]>("/api/v1/finance/expenses");
}

export async function createExpenseApi(expense: Omit<Expense, "id">): Promise<Expense> {
  return request<Expense>("/api/v1/finance/expenses", {
    method: "POST",
    body: JSON.stringify(expense),
  });
}

export async function updateExpenseApi(expense: Expense): Promise<Expense> {
  return request<Expense>(`/api/v1/finance/expenses/${encodeURIComponent(expense.id)}`, {
    method: "PATCH",
    body: JSON.stringify(expense),
  });
}

export async function deleteExpenseApi(id: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/api/v1/finance/expenses/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
