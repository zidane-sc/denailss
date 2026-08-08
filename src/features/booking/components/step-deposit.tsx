"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  ClockIcon,
  ImageIcon,
  TrashIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { DEPOSIT_CONFIG } from "@/features/booking/data/deposit-config.mock";
import type { DepositUpload } from "@/features/booking/types";
import { formatIDR } from "@/lib/format";

export function StepDeposit({
  amount,
  deposit,
  onChange,
}: {
  amount: number;
  deposit: DepositUpload | null;
  onChange: (deposit: DepositUpload | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    onChange({ fileName: file.name, previewUrl, status: "waiting_verification" });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">Deposit</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Layanan ini butuh deposit untuk mengamankan slot booking-mu.
      </p>

      <div className="mt-6 rounded-2xl bg-secondary-soft p-5">
        <p className="text-sm text-foreground/80">Jumlah deposit yang perlu ditransfer</p>
        <p className="mt-1 text-3xl font-semibold text-foreground">{formatIDR(amount)}</p>
      </div>

      <div className="mt-5 space-y-3 rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-semibold text-foreground">Instruksi Pembayaran</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Transfer Bank</span>
          <span className="font-medium text-foreground">
            {DEPOSIT_CONFIG.bankAccount.bank} {DEPOSIT_CONFIG.bankAccount.accountNumber} a.n{" "}
            {DEPOSIT_CONFIG.bankAccount.accountName}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">E-Wallet</span>
          <span className="font-medium text-foreground">
            {DEPOSIT_CONFIG.eWallet.provider} {DEPOSIT_CONFIG.eWallet.number}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{DEPOSIT_CONFIG.notes}</p>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-foreground">Upload Bukti Transfer</p>

        {!deposit ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background py-10 text-center transition-colors hover:border-primary/50"
          >
            <UploadSimpleIcon className="size-6 text-primary" />
            <span className="text-sm font-medium text-foreground">Tap untuk upload foto bukti transfer</span>
            <span className="text-xs text-muted-foreground">JPG atau PNG, maksimal 5MB</span>
          </button>
        ) : (
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
              <Image src={deposit.previewUrl} alt="Bukti transfer" fill sizes="4rem" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{deposit.fileName}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-secondary-foreground/80">
                <ClockIcon className="size-3.5" />
                Menunggu verifikasi
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                aria-label="Ganti foto"
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <ImageIcon className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                aria-label="Hapus foto"
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <TrashIcon className="size-4" />
              </button>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
