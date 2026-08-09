import { eq } from "drizzle-orm";
import { createSupabaseServerClient } from "./server";
import { getDb } from "@/db/client";
import { customers, users } from "@/db/schema";
import { ApiError } from "@/lib/api/errors";

export type ApiAuthContext =
  | { kind: "anonymous" }
  | { kind: "customer"; userId: string; email?: string; customerId?: string }
  | { kind: "owner"; userId: string };

export async function getApiAuthContext(): Promise<ApiAuthContext> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { kind: "anonymous" };

  const db = getDb();
  const [profile] = await db.select({ role: users.role }).from(users).where(eq(users.id, data.user.id));
  if (!profile) throw new ApiError("FORBIDDEN", "Profil akun belum siap.", 403);
  if (profile.role === "owner") return { kind: "owner", userId: data.user.id };

  const [customer] = await db.select({ id: customers.id }).from(customers).where(eq(customers.userId, data.user.id));
  return { kind: "customer", userId: data.user.id, email: data.user.email ?? undefined, customerId: customer?.id };
}

export async function requireApiAuth() {
  const context = await getApiAuthContext();
  if (context.kind === "anonymous") throw new ApiError("UNAUTHORIZED", "Silakan masuk terlebih dahulu.", 401);
  return context;
}

export async function requireApiOwner() {
  const context = await requireApiAuth();
  if (context.kind !== "owner") throw new ApiError("FORBIDDEN", "Akses owner diperlukan.", 403);
  return context;
}

export async function requireApiCustomer() {
  const context = await requireApiAuth();
  if (context.kind !== "customer" || !context.customerId) {
    throw new ApiError("FORBIDDEN", "Profil customer belum siap.", 403);
  }
  return { ...context, customerId: context.customerId };
}
