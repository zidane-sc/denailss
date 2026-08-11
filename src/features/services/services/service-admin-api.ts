import type { Service } from "@/types";

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

export async function updateServiceApi(service: Service): Promise<Service> {
  const { id, tierLabel: _tierLabel, ...body } = service;
  void _tierLabel;
  return request<Service>(`/api/v1/services/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function setServiceActiveApi(id: string, active: boolean): Promise<Service> {
  return request<Service>(`/api/v1/services/${encodeURIComponent(id)}/active`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}
