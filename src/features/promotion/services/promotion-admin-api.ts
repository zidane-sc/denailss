import type { Promotion } from "@/types";

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

export async function createPromotionApi(promotion: Promotion): Promise<Promotion> {
  return request<Promotion>("/api/v1/promotions", {
    method: "POST",
    body: JSON.stringify(promotion),
  });
}

export async function updatePromotionApi(promotion: Promotion): Promise<Promotion> {
  return request<Promotion>(`/api/v1/promotions/${encodeURIComponent(promotion.id)}`, {
    method: "PATCH",
    body: JSON.stringify(promotion),
  });
}

export async function setPromotionActiveApi(id: string, active: boolean): Promise<Promotion> {
  return request<Promotion>(`/api/v1/promotions/${encodeURIComponent(id)}/active`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}
