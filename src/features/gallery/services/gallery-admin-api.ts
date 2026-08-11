import type { GalleryDesign } from "@/types";

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

export async function createGalleryDesignApi(design: GalleryDesign): Promise<GalleryDesign> {
  return request<GalleryDesign>("/api/v1/gallery", {
    method: "POST",
    body: JSON.stringify(design),
  });
}

export async function updateGalleryDesignApi(design: GalleryDesign): Promise<GalleryDesign> {
  return request<GalleryDesign>(`/api/v1/gallery/${encodeURIComponent(design.id)}`, {
    method: "PUT",
    body: JSON.stringify(design),
  });
}

export async function deleteGalleryDesignApi(id: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/api/v1/gallery/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
