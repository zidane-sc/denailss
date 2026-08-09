"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { upsertPromotion } from "../data/promotions.mock";
import { PromotionForm, emptyDraft } from "./promotion-form";
import type { Promotion } from "@/types";

export function PromotionCreateView() {
  const router = useRouter();

  const handleSubmit = (promotion: Promotion) => {
    upsertPromotion(promotion, "create");
    toast.success("Promo berhasil dibuat.", {
      description: `${promotion.code} sekarang aktif untuk booking customer.`,
    });
    router.push(`/backoffice/promotions/${promotion.id}`);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in duration-300">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 rounded-full pl-2 pr-3 text-muted-foreground hover:text-foreground [&>svg]:size-4"
        nativeButton={false}
        render={<Link href="/backoffice/promotions" />}
      >
        <ArrowLeftIcon />
        Daftar Promo
      </Button>

      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground/90">
          Buat Promo Baru
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Atur diskon, periode, dan aturannya. Pratinjau di samping mengikuti isianmu.
        </p>
      </div>

      <PromotionForm
        initial={emptyDraft()}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/backoffice/promotions")}
      />
    </div>
  );
}
