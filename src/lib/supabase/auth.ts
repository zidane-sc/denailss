import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./server";

export type AuthRole = "owner" | "customer";

export function safeNextPath(value: string | null | undefined, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, role, name, phone")
    .eq("id", user.id)
    .maybeSingle();

  return error ? null : data;
}

async function requireRole(role: AuthRole, nextPath: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(safeNextPath(nextPath, "/"))}`);

  const profile = await getCurrentProfile();
  if (!profile || profile.role !== role) {
    redirect(`/login?error=unauthorized&next=${encodeURIComponent(safeNextPath(nextPath, "/"))}`);
  }
  return { user, profile };
}

export function requireCustomer(nextPath: string) {
  return requireRole("customer", nextPath);
}

export function requireOwner(nextPath: string) {
  return requireRole("owner", nextPath);
}
