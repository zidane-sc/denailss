"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { getServiceBySlug } from "@/features/services/data/services.mock";
import { getDesignBySlug } from "@/features/gallery/data/designs.mock";
import { findPromotionByCode } from "@/features/promotion/data/promotions.mock";
import { DEPOSIT_CONFIG } from "@/features/booking/data/deposit-config.mock";
import { checkPromotion, calculateDeposit } from "@/features/booking/logic/pricing";
import { BookingStepper, type StepMeta } from "@/features/booking/components/booking-stepper";
import { BookingSummary } from "@/features/booking/components/booking-summary";
import { StepService } from "@/features/booking/components/step-service";
import { StepDesign } from "@/features/booking/components/step-design";
import { StepDate } from "@/features/booking/components/step-date";
import { StepTime } from "@/features/booking/components/step-time";
import { StepCustomerInfo } from "@/features/booking/components/step-customer-info";
import { StepPromo } from "@/features/booking/components/step-promo";
import { StepDeposit } from "@/features/booking/components/step-deposit";
import { StepConfirmation } from "@/features/booking/components/step-confirmation";
import { INITIAL_SELECTIONS, type BookingSelections } from "@/features/booking/types";
import { formatIDR } from "@/lib/format";
import type { Service } from "@/types";

export function BookingFlow({
  initialServiceSlug,
  initialDesignSlug,
  initialPromoCode,
}: {
  initialServiceSlug: string | null;
  initialDesignSlug: string | null;
  initialPromoCode: string | null;
}) {
  const [selections, setSelections] = useState<BookingSelections>({
    ...INITIAL_SELECTIONS,
    serviceSlugs: initialServiceSlug ? [initialServiceSlug] : [],
    designSlug: initialDesignSlug,
    promoCode: initialPromoCode,
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [maxReachedIndex, setMaxReachedIndex] = useState(0);
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [customerTouched, setCustomerTouched] = useState(false);

  const customerFormRef = useRef<{ submit: () => Promise<boolean> }>(null);

  const selectedServices = useMemo(() => {
    return selections.serviceSlugs
      .map((slug) => getServiceBySlug(slug))
      .filter(Boolean) as Service[];
  }, [selections.serviceSlugs]);

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [selectedServices]);

  const design = selections.designSlug ? getDesignBySlug(selections.designSlug) ?? null : null;

  const hasEstimate = selectedServices.some((s) => s.priceNote && !design);

  const subtotal = useMemo(() => {
    return selectedServices.reduce((sum, s) => {
      if (design && design.relatedServiceSlugs.includes(s.slug)) {
        return sum + design.priceFrom;
      }
      return sum + s.priceFrom;
    }, 0);
  }, [selectedServices, design]);

  const promotion = selections.promoCode ? findPromotionByCode(selections.promoCode) : undefined;
  
  const promoResult = useMemo(() => {
    if (!promotion || selectedServices.length === 0) return null;
    return checkPromotion(promotion, {
      serviceSlugs: selections.serviceSlugs,
      subtotal,
    });
  }, [promotion, selections.serviceSlugs, subtotal]);

  const discount = promoResult?.valid ? promoResult.discount : 0;
  const total = Math.max(subtotal - discount, 0);

  const depositRequired = useMemo(() => {
    return DEPOSIT_CONFIG.enabled && selectedServices.some((s) => s.depositApplicable);
  }, [selectedServices]);

  const depositAmount = depositRequired ? calculateDeposit(total, DEPOSIT_CONFIG) : 0;

  const isOnlyFakeNails = useMemo(() => {
    return selectedServices.length > 0 && selectedServices.every((s) => s.slug === "fake-nail");
  }, [selectedServices]);

  const steps: StepMeta[] = useMemo(() => {
    const base: StepMeta[] = [
      { id: "service", label: "Layanan" },
      { id: "design", label: "Desain" },
    ];
    if (!isOnlyFakeNails) {
      base.push(
        { id: "date", label: "Tanggal" },
        { id: "time", label: "Waktu" }
      );
    }
    base.push(
      { id: "customer", label: "Data Diri" },
      { id: "promo", label: "Promo" }
    );
    if (depositRequired) base.push({ id: "deposit", label: "Deposit" });
    base.push({ id: "confirmation", label: "Selesai" });
    return base;
  }, [depositRequired, isOnlyFakeNails]);

  const currentStep = steps[stepIndex]?.id ?? "service";

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case "service":
        return selections.serviceSlugs.length > 0;
      case "date":
        return Boolean(selections.dateKey);
      case "time":
        return Boolean(selections.time);
      case "customer":
        return true;
      case "deposit":
        return Boolean(selections.deposit);
      default:
        return true;
    }
  }, [currentStep, selections]);

  const goNext = async () => {
    if (currentStep === "customer") {
      const valid = (await customerFormRef.current?.submit()) ?? false;
      setCustomerTouched(true);
      if (!valid) return;
    }
    if (currentStep === "deposit" && !selections.deposit) return;

    if (stepIndex === steps.length - 2) {
      const code = `DNL-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(
        new Date().getDate()
      ).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
      setBookingCode(code);
    }

    const next = Math.min(stepIndex + 1, steps.length - 1);
    setStepIndex(next);
    setMaxReachedIndex((m) => Math.max(m, next));
  };

  const goBack = () => {
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const goToStep = (index: number) => {
    setStepIndex(index);
  };

  if (currentStep === "confirmation" && selectedServices.length > 0 && bookingCode) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6">
        <StepConfirmation
          bookingCode={bookingCode}
          services={selectedServices}
          design={design}
          dateKey={selections.dateKey}
          time={selections.time}
          total={total}
          depositAmount={depositAmount}
          depositRequired={depositRequired}
        />
      </div>
    );
  }

  const summaryData = {
    services: selectedServices,
    design,
    dateKey: selections.dateKey,
    time: selections.time,
    subtotal,
    discount,
    total,
    depositAmount,
    depositRequired,
    promoCode: promoResult?.valid ? selections.promoCode : null,
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-8 sm:px-6 sm:pb-12 lg:px-8">
      <BookingStepper
        steps={steps.slice(0, -1)}
        currentIndex={stepIndex}
        maxReachedIndex={maxReachedIndex}
        onStepClick={goToStep}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
        <div>
          {currentStep === "service" && (
            <StepService
              selectedSlugs={selections.serviceSlugs}
              onToggle={(slug) =>
                setSelections((s) => {
                  const isSelected = s.serviceSlugs.includes(slug);
                  const updatedSlugs = isSelected
                    ? s.serviceSlugs.filter((x) => x !== slug)
                    : [...s.serviceSlugs, slug];
                  return { ...s, serviceSlugs: updatedSlugs };
                })
              }
            />
          )}
          {currentStep === "design" && (
            <StepDesign
              serviceSlugs={selections.serviceSlugs}
              selectedSlug={selections.designSlug}
              onSelect={(slug) => setSelections((s) => ({ ...s, designSlug: slug }))}
            />
          )}
          {currentStep === "date" && selectedServices.length > 0 && (
            <StepDate
              durationMinutes={totalDuration}
              selectedDateKey={selections.dateKey}
              onSelect={(dateKey) => setSelections((s) => ({ ...s, dateKey, time: null }))}
            />
          )}
          {currentStep === "time" && selectedServices.length > 0 && selections.dateKey && (
            <StepTime
              dateKey={selections.dateKey}
              durationMinutes={totalDuration}
              selectedTime={selections.time}
              onSelect={(time) => setSelections((s) => ({ ...s, time }))}
            />
          )}
          {currentStep === "customer" && (
            <StepCustomerInfo
              value={selections.customer}
              onChange={(customer) => setSelections((s) => ({ ...s, customer }))}
              formRef={customerFormRef}
            />
          )}
          {currentStep === "promo" && selectedServices.length > 0 && (
            <StepPromo
              serviceSlugs={selections.serviceSlugs}
              subtotal={subtotal}
              appliedCode={selections.promoCode}
              onApply={(code) => setSelections((s) => ({ ...s, promoCode: code }))}
            />
          )}
          {currentStep === "deposit" && (
            <StepDeposit
              amount={depositAmount}
              deposit={selections.deposit}
              onChange={(deposit) => setSelections((s) => ({ ...s, deposit }))}
            />
          )}

          {customerTouched && currentStep === "customer" && !canProceed && (
            <p className="mt-4 text-xs text-destructive">Lengkapi data di atas untuk melanjutkan.</p>
          )}

          <div className="mt-8 hidden items-center justify-between sm:flex">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-6"
              disabled={stepIndex === 0}
              onClick={goBack}
            >
              <ArrowLeftIcon className="size-4" />
              Kembali
            </Button>
            <Button size="lg" className="rounded-full px-7" disabled={!canProceed} onClick={goNext}>
              Lanjut
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <BookingSummary data={summaryData} />
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <Sheet>
            <SheetTrigger className="flex min-w-0 flex-1 flex-col items-start text-left">
              <span className="text-xs text-muted-foreground">
                {hasEstimate ? "Estimasi" : "Total"} &middot; lihat detail
              </span>
              <span className="text-base font-semibold text-foreground">{formatIDR(total || 0)}</span>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[75vh] overflow-y-auto rounded-t-3xl bg-background p-5">
              <SheetTitle className="sr-only">Ringkasan Booking</SheetTitle>
              <BookingSummary data={summaryData} />
            </SheetContent>
          </Sheet>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="icon-lg"
              disabled={stepIndex === 0}
              onClick={goBack}
              aria-label="Kembali"
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
            <Button size="lg" className="rounded-full px-6" disabled={!canProceed} onClick={goNext}>
              Lanjut
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
