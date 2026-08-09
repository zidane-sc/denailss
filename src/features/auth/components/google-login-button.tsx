"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogoIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react/dist/ssr";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function friendlyAuthError(message: string) {
  if (message.toLowerCase().includes("invalid login credentials")) return "Email atau password belum benar.";
  if (message.toLowerCase().includes("email not confirmed")) return "Konfirmasi emailmu terlebih dahulu sebelum masuk.";
  if (message.toLowerCase().includes("user already registered")) return "Email ini sudah terdaftar. Silakan masuk.";
  if (message.toLowerCase().includes("password")) return "Password minimal 6 karakter.";
  return "Autentikasi belum berhasil. Coba lagi.";
}

export function GoogleLoginButton({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resending, setResending] = useState(false);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (authError) {
      setError("Login Google belum dapat dimulai. Coba lagi.");
      setLoading(false);
    }
  };

  const resendConfirmation = async () => {
    setResending(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
    if (resendError) setError(friendlyAuthError(resendError.message));
    else setConfirmationSent(true);
    setResending(false);
  };

  const submitEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    setError(null);
    setConfirmationSent(false);
    setNeedsConfirmation(false);
    const normalizedEmail = email.trim().toLowerCase();
    setEmail(normalizedEmail);
    const supabase = createSupabaseBrowserClient();
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
      : await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
          },
        });

    if (result.error) {
      const message = result.error.message.toLowerCase();
      if (mode === "login" && message.includes("email not confirmed")) {
        setNeedsConfirmation(true);
        setError("Email ini belum dikonfirmasi. Kirim ulang link konfirmasi di bawah.");
      } else if (mode === "signup" && message.includes("already registered")) {
        setMode("login");
        setError("Email ini sudah terdaftar. Mode login sudah dibuka untukmu.");
      } else {
        setError(friendlyAuthError(result.error.message));
      }
      setLoading(false);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      if (!result.data.user?.identities?.length) {
        setMode("login");
        setError("Email ini sudah terdaftar. Silakan masuk dengan metode yang digunakan sebelumnya—Google atau email/password.");
      } else {
        setConfirmationSent(true);
      }
      setLoading(false);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full rounded-full border-border bg-background font-semibold shadow-xs hover:bg-muted"
        onClick={signInWithGoogle}
        disabled={loading}
      >
        <GoogleLogoIcon weight="bold" className="size-5 text-[#4285F4]" />
        {loading ? "Menghubungkan..." : "Lanjut dengan Google"}
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        atau gunakan email
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-4" onSubmit={submitEmailAuth}>
        <div className="space-y-2">
          <Label htmlFor="auth-email">Email</Label>
          <Input
            id="auth-email"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={loading}
            className="h-11 rounded-xl px-3"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="auth-password">Password</Label>
          <div className="relative">
            <Input
              id="auth-password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={loading}
              className="h-11 rounded-xl px-3 pr-11"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeSlashIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="h-11 w-full rounded-full" disabled={loading}>
          {loading ? "Memproses..." : mode === "login" ? "Masuk dengan Email" : "Buat Akun"}
        </Button>
      </form>

      {error && <p className="text-center text-sm text-destructive">{error}</p>}
      {needsConfirmation && (
        <Button type="button" variant="outline" className="h-10 w-full rounded-full" onClick={resendConfirmation} disabled={resending || !email}>
          {resending ? "Mengirim ulang..." : "Kirim ulang link konfirmasi"}
        </Button>
      )}
      {confirmationSent && (
        <p className="rounded-xl bg-primary/10 p-3 text-center text-sm text-primary">
          Link konfirmasi sudah dikirim ke emailmu. Cek inbox untuk mengaktifkan akun.
        </p>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
        <button
          type="button"
          className="font-semibold text-primary hover:underline"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
            setConfirmationSent(false);
          }}
        >
          {mode === "login" ? "Daftar sekarang" : "Masuk di sini"}
        </button>
      </p>
    </div>
  );
}
