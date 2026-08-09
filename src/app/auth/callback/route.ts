import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/supabase/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = safeNextPath(url.searchParams.get("next"), "/customer");

  const supabase = await createSupabaseServerClient();
  const errorUrl = new URL("/login", request.url);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      errorUrl.searchParams.set("error", "auth_callback");
      errorUrl.searchParams.set("detail", error.code ?? "exchange_failed");
      return NextResponse.redirect(errorUrl);
    }
    return NextResponse.redirect(new URL(next, request.url));
  }

  if (tokenHash && type === "signup") {
    const { error } = await supabase.auth.verifyOtp({ type: "signup", token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(next, request.url));
    errorUrl.searchParams.set("error", "email_confirmation");
    errorUrl.searchParams.set("detail", error.code ?? "verification_failed");
    return NextResponse.redirect(errorUrl);
  }

  errorUrl.searchParams.set("error", "missing_code");
  return NextResponse.redirect(errorUrl);
}
