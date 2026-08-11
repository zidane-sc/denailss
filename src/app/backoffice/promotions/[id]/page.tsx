import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { getPromotionById } from "@/features/promotion/services/promotion-service";
import { PromotionDetailView } from "@/features/promotion/components/promotion-detail-view";

export const metadata: Metadata = {
  title: "Detail Promo | Backoffice Denailss",
  description: "Detail dan pengaturan promo Denailss.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BackofficePromotionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const promotion = await getPromotionById(id);

  if (!promotion) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h3 className="font-heading text-lg font-semibold text-foreground/90">
          Promo Tidak Ditemukan
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Promo tersebut tidak ada di daftar penawaran.
        </p>
        <Button
          variant="outline"
          className="mt-6 rounded-xl"
          nativeButton={false}
          render={<Link href="/backoffice/promotions" />}
        >
          <ArrowLeftIcon className="mr-2 size-4" />
          Kembali ke Daftar Promo
        </Button>
      </div>
    );
  }

  return <PromotionDetailView promotion={promotion} />;
}
