import Image from "next/image";
import Link from "next/link";
import { GoogleLoginButton } from "@/features/auth/components/google-login-button";
import { safeNextPath } from "@/lib/supabase/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; detail?: string }> }) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next, "/customer");

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
        <Link href="/" className="mb-10 flex justify-center">
          <Image src="/images/logo-horizontal.png" alt="Denailss" width={150} height={60} className="h-10 w-auto" priority />
        </Link>
        <div className="mb-8 text-center">
          <p className="text-sm font-medium text-primary">Akun Denailss</p>
          <h1 className="mt-2 font-heading text-2xl font-semibold">Masuk ke portal</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Masuk dengan Google atau email untuk melihat booking dan profilmu. Akses operasional hanya tersedia untuk owner.
          </p>
        </div>
        {params.error && (
          <p className="mb-4 rounded-xl bg-destructive/10 p-3 text-center text-sm text-destructive">
            {params.error === "missing_code"
              ? "Kode login Google tidak ditemukan. Silakan mulai lagi."
              : params.error === "unauthorized"
                ? "Akun ini belum memiliki akses ke halaman tersebut."
                : params.detail
                  ? `Login Google gagal (${params.detail}). Periksa konfigurasi OAuth lalu coba lagi.`
                  : "Sesi tidak dapat dibuat. Silakan coba lagi."}
          </p>
        )}
        <GoogleLoginButton nextPath={nextPath} />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Dengan melanjutkan, kamu menyetujui penggunaan akun untuk kebutuhan booking Denailss.
        </p>
      </div>
    </main>
  );
}
