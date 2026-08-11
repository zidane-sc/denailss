"use client";

import { useState } from "react";
import { CheckCircleIcon, TicketIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { useFindPromotionByCode, useLivePromotionList } from "@/features/promotion/data/promotion-booking";
import { checkPromotion } from "@/features/booking/logic/pricing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/format";

export function StepPromo({
  serviceSlugs,
  subtotal,
  appliedCode,
  onApply,
}: {
  serviceSlugs: string[];
  subtotal: number;
  appliedCode: string | null;
  onApply: (code: string | null) => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const appliedPromotion = useFindPromotionByCode(appliedCode);
  const appliedResult =
    appliedPromotion && checkPromotion(appliedPromotion, { serviceSlugs, subtotal });
  const livePromotions = useLivePromotionList();

  const handleApply = () => {
    const normalized = input.trim().toLowerCase();
    const promotion = livePromotions.find((promo) => promo.code.toLowerCase() === normalized);
    if (!promotion) {
      setError("Kode promo tidak ditemukan.");
      return;
    }
    const result = checkPromotion(promotion, { serviceSlugs, subtotal });
    if (!result.valid) {
      setError(result.reason ?? "Kode promo tidak berlaku.");
      return;
    }
    setError(null);
    setInput("");
    onApply(promotion.code);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        Kode Promo <span className="text-base font-normal text-muted-foreground">(opsional)</span>
      </h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Punya kode promo? Masukkan di sini untuk potongan harga langsung.
      </p>

      {appliedPromotion && appliedResult?.valid ? (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-primary/40 bg-secondary-soft px-4 py-3">
          <div className="flex items-center gap-2.5">
            <CheckCircleIcon weight="fill" className="size-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">{appliedPromotion.code} terpakai</p>
              <p className="text-xs text-muted-foreground">
                Potongan {formatIDR(appliedResult.discount)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onApply(null)}
            aria-label="Hapus promo"
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <TicketIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={input}
                onChange={(e) => {
                  setInput(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="Contoh: PROMO17"
                className="h-11 pl-10"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-lg px-5"
              disabled={!input.trim()}
              onClick={handleApply}
            >
              Pakai
            </Button>
          </div>
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        </div>
      )}
    </div>
  );
}
