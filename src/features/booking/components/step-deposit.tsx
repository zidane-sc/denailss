"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ClockIcon, ImageIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { useDepositConfig } from "@/features/booking/components/deposit-config-provider";
import type { DepositUpload } from "@/features/booking/types";
import { formatIDR } from "@/lib/format";

export function StepDeposit({ amount, deposit, onChange }: { amount: number; deposit: DepositUpload | null; onChange: (deposit: DepositUpload | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const config = useDepositConfig();

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Bukti transfer harus JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran bukti transfer maksimal 5 MB.");
      return;
    }
    setError("");
    setUploading(true);
    const previewUrl = URL.createObjectURL(file);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/v1/bookings/deposit-proof", { method: "POST", body });
      const payload = (await response.json()) as { data?: { reference: string }; error?: { message?: string } };
      if (!response.ok || !payload.data?.reference) throw new Error(payload.error?.message ?? "Upload bukti transfer gagal.");
      // Replace the previous (unsubmitted) proof so it doesn't leak.
      if (deposit?.storagePath) {
        void fetch("/api/v1/bookings/deposit-proof/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: deposit.storagePath }),
        }).catch(() => undefined);
        URL.revokeObjectURL(deposit.previewUrl);
      }
      onChange({ fileName: file.name, previewUrl, storagePath: payload.data.reference, status: "waiting_verification" });
    } catch (uploadError) {
      URL.revokeObjectURL(previewUrl);
      setError(uploadError instanceof Error ? uploadError.message : "Upload bukti transfer gagal.");
    } finally {
      setUploading(false);
    }
  };

  const removeDeposit = () => {
    if (deposit?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(deposit.previewUrl);
    if (deposit?.storagePath) {
      void fetch("/api/v1/bookings/deposit-proof/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: deposit.storagePath }),
      }).catch(() => undefined);
    }
    onChange(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">Deposit</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">Layanan ini butuh deposit untuk mengamankan slot booking-mu.</p>
      <div className="mt-6 rounded-2xl bg-secondary-soft p-5"><p className="text-sm text-foreground/80">Jumlah deposit yang perlu ditransfer</p><p className="mt-1 text-3xl font-semibold text-foreground">{formatIDR(amount)}</p></div>
      <div className="mt-5 space-y-3 rounded-2xl border border-border bg-card p-5"><p className="text-sm font-semibold text-foreground">Instruksi Pembayaran</p>{config?.paymentMethods?.map((method) => <div key={method.id} className="flex items-start justify-between gap-4 border-b border-border/40 pb-2.5 text-sm last:border-b-0 last:pb-0"><span className="shrink-0 text-muted-foreground">{method.type === "bank" ? `Transfer Bank (${method.name})` : method.name}</span><span className="text-right font-medium text-foreground">{method.accountNumber}<span className="mt-0.5 block text-xs font-normal text-muted-foreground">a.n {method.accountName}</span></span></div>)}<p className="pt-1 text-xs text-muted-foreground">{config?.notes ?? ""}</p></div>
      <div className="mt-5"><p className="text-sm font-semibold text-foreground">Upload Bukti Transfer</p>{!deposit ? <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background py-10 text-center hover:border-primary/50"><UploadSimpleIcon className="size-6 text-primary" /><span className="text-sm font-medium text-foreground">{uploading ? "Mengunggah bukti..." : "Tap untuk upload foto bukti transfer"}</span><span className="text-xs text-muted-foreground">JPG, PNG, atau WebP, maksimal 5MB</span></button> : <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-3"><div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted"><Image src={deposit.previewUrl} alt="Bukti transfer" fill sizes="4rem" className="object-cover" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-foreground">{deposit.fileName}</p><p className="mt-1 flex items-center gap-1 text-xs text-secondary-foreground/80"><ClockIcon className="size-3.5" />Menunggu verifikasi</p></div><div className="flex shrink-0 gap-1.5"><button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} aria-label="Ganti foto" className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"><ImageIcon className="size-4" /></button><button type="button" onClick={removeDeposit} aria-label="Hapus foto" className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"><TrashIcon className="size-4" /></button></div></div>}{error && <p className="mt-2 text-sm text-destructive">{error}</p>}<input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { void handleFile(e.target.files?.[0]); e.target.value = ""; }} /></div>
    </div>
  );
}
