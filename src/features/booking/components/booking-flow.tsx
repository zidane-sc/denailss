"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useLiveServices } from "@/features/services/components/services-provider";
import { useLiveGalleryDesigns } from "@/features/gallery/components/gallery-designs-provider";
import { useFindPromotionByCode } from "@/features/promotion/data/promotion-booking";
import { useDepositConfig } from "@/features/booking/components/deposit-config-provider";
import { useAvailabilityRefresh } from "@/features/booking/components/availability-provider";
import { checkPromotion, calculateDeposit } from "@/features/booking/logic/pricing";
import { freeAddonForService } from "@/features/booking/logic/free-addon";
import { BookingStepper, type StepMeta } from "@/features/booking/components/booking-stepper";
import { BookingSummary } from "@/features/booking/components/booking-summary";
import { StepService } from "@/features/booking/components/step-service";
import { StepDesign } from "@/features/booking/components/step-design";
import { StepDate } from "@/features/booking/components/step-date";
import { StepTime } from "@/features/booking/components/step-time";
import { StepPickup } from "@/features/booking/components/step-pickup";
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
  const services = useLiveServices();
  const galleryDesigns = useLiveGalleryDesigns();
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

  const refreshAvailability = useAvailabilityRefresh();

  const customerFormRef = useRef<{ submit: () => Promise<boolean> }>(null);

  /** Resolve a service's effective price/duration from the chosen tier (falls back to flat). */
  const effectiveService = (service: Service): Service => {
    const tierKey = selections.tierByServiceSlug[service.slug];
    const tier = tierKey ? service.tiers.find((t) => t.key === tierKey) : undefined;
    return tier
      ? {
          ...service,
          priceFrom: tier.priceFrom,
          durationMinutes: tier.durationMinutes,
          tierLabel: tier.label,
          bodyPart: selections.bodyPartByServiceSlug[service.slug],
        }
      : {
          ...service,
          tierLabel: undefined,
          bodyPart: selections.bodyPartByServiceSlug[service.slug],
        };
  };

  const selectedServices = useMemo(() => {
    return selections.serviceSlugs
      .map((slug) => services.find((s) => s.slug === slug))
      .filter((s): s is Service => Boolean(s && s.active))
      .map(effectiveService);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections.serviceSlugs, selections.tierByServiceSlug, selections.bodyPartByServiceSlug, services]);

  /** Free add-ons bundled with the selected services (nail art → manicure/pedicure). */
  const addOns = useMemo(() => {
    return selectedServices
      .flatMap((s) => {
        const freebie = freeAddonForService(s);
        if (!freebie) return [];
        const catalog = services.find((c) => c.slug === freebie.slug);
        return [
          {
            ...freebie,
            durationMinutes: catalog?.durationMinutes ?? 0,
          },
        ];
      })
      .filter((a) => a.durationMinutes > 0);
  }, [selectedServices, services]);

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0) +
      addOns.reduce((sum, a) => sum + a.durationMinutes, 0);
  }, [selectedServices, addOns]);

  const design = selections.designSlug
    ? galleryDesigns.find((d) => d.slug === selections.designSlug) ?? null
    : null;

  const hasEstimate = selectedServices.some((s) => s.priceNote);

  const subtotal = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.priceFrom, 0);
  }, [selectedServices]);

  const promotion = useFindPromotionByCode(selections.promoCode);
  
  const promoResult = useMemo(() => {
    if (!promotion || selectedServices.length === 0) return null;
    return checkPromotion(promotion, {
      serviceSlugs: selections.serviceSlugs,
      subtotal,
    });
  }, [promotion, selections.serviceSlugs, subtotal, selectedServices.length]);

  const discount = promoResult?.valid ? promoResult.discount : 0;
  const total = Math.max(subtotal - discount, 0);

  const depositConfig = useDepositConfig();

  const depositRequired = useMemo(() => {
    return Boolean(depositConfig?.enabled && selectedServices.some((s) => s.depositApplicable));
  }, [depositConfig, selectedServices]);

  const depositAmount = depositRequired && depositConfig ? calculateDeposit(total, depositConfig) : 0;

  const selectedSlugs = selections.serviceSlugs;

  const wantsDesign = useMemo(() => {
    return selectedSlugs.some((slug) => ["nail-art", "fake-nail", "gel-extension"].includes(slug));
  }, [selectedSlugs]);

  const wantsPickup = useMemo(() => {
    return selectedSlugs.includes("fake-nail");
  }, [selectedSlugs]);

  const steps: StepMeta[] = useMemo(() => {
    const base: StepMeta[] = [{ id: "service", label: "Layanan" }];
    if (wantsDesign) base.push({ id: "design", label: "Desain" });
    if (wantsPickup) {
      base.push({ id: "pickup", label: "Pengambilan" });
    } else {
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
  }, [wantsDesign, wantsPickup, depositRequired]);

  // When the step list changes (services toggled), clamp the stored indexes
  // for rendering so navigation never points out of range. The raw state is
  // still updated through goNext/goBack/goToStep.
  const activeStepIndex = Math.min(stepIndex, steps.length - 1);
  const activeMaxReached = Math.min(maxReachedIndex, steps.length - 1);
  const currentStep = steps[activeStepIndex]?.id ?? "service";
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case "service":
        return selections.serviceSlugs.length > 0;
      case "date":
        return Boolean(selections.dateKey);
      case "time":
        return Boolean(selections.time);
      case "pickup":
        return Boolean(selections.fulfillment);
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

    if (activeStepIndex === steps.length - 2 && !bookingCode) {
      const code = await submitBooking();
      if (!code) return;
      setBookingCode(code);
    }

    const next = Math.min(activeStepIndex + 1, steps.length - 1);
    setStepIndex(next);
    setMaxReachedIndex((m) => Math.max(m, next));
  };

  const goBack = () => {
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const goToStep = (index: number) => {
    setStepIndex(index);
  };

  const submitBooking = async () => {
    const response = await fetch("/api/v1/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceSlugs: selections.serviceSlugs,
        tierByServiceSlug: selections.tierByServiceSlug,
        bodyPartByServiceSlug: selections.bodyPartByServiceSlug,
        designSlug: selections.designSlug,
        dateKey: selections.dateKey,
        time: selections.time,
        fulfillment: selections.fulfillment,
        customer: selections.customer,
        promoCode: selections.promoCode,
        deposit: selections.deposit
          ? { fileName: selections.deposit.fileName, storagePath: selections.deposit.storagePath, status: selections.deposit.status }
          : null,
      }),
    });

    if (response.ok) {
      const payload = (await response.json()) as { data: { id: string } };
      // The new booking occupies its slot; refresh the availability + deposit
      // providers so the calendar and slot picker reflect it immediately.
      refreshAvailability();
      return payload.data.id;
    }

    const payload = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    window.alert(payload?.error?.message ?? "Booking belum dapat disimpan. Coba lagi.");
    return null;
  };

  if (currentStep === "confirmation" && selectedServices.length > 0 && bookingCode) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6">
        <StepConfirmation
          bookingCode={bookingCode}
          services={selectedServices}
          addOns={addOns}
          design={design}
          dateKey={selections.dateKey}
          time={selections.time}
          fulfillment={selections.fulfillment}
          total={total}
          depositAmount={depositAmount}
          depositRequired={depositRequired}
        />
      </div>
    );
  }

  const summaryData = {
    services: selectedServices,
    addOns,
    design,
    dateKey: selections.dateKey,
    time: selections.time,
    fulfillment: selections.fulfillment,
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
        currentIndex={activeStepIndex}
        maxReachedIndex={activeMaxReached}
        onStepClick={goToStep}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
        <div>
          {currentStep === "service" && (
            <StepService
              selectedSlugs={selections.serviceSlugs}
              tierByServiceSlug={selections.tierByServiceSlug}
              bodyPartByServiceSlug={selections.bodyPartByServiceSlug}
              onToggle={(slug) =>
                setSelections((s) => {
                  const isSelected = s.serviceSlugs.includes(slug);
                  const updatedSlugs = isSelected
                    ? s.serviceSlugs.filter((x) => x !== slug)
                    : [...s.serviceSlugs, slug];
                  const bodyPartByServiceSlug = { ...s.bodyPartByServiceSlug };
                  if (isSelected) {
                    delete bodyPartByServiceSlug[slug];
                  } else if (slug === "nail-art" && !bodyPartByServiceSlug[slug]) {
                    bodyPartByServiceSlug[slug] = "hand";
                  }
                  return { ...s, serviceSlugs: updatedSlugs, bodyPartByServiceSlug };
                })
              }
              onSelectTier={(slug, tierKey) =>
                setSelections((s) => ({
                  ...s,
                  tierByServiceSlug: { ...s.tierByServiceSlug, [slug]: tierKey },
                }))
              }
              onSelectBodyPart={(slug, bodyPart) =>
                setSelections((s) => ({
                  ...s,
                  bodyPartByServiceSlug: { ...s.bodyPartByServiceSlug, [slug]: bodyPart },
                }))
              }
            />
          )}
          {currentStep === "design" && (
            <StepDesign
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
          {currentStep === "pickup" && (
            <StepPickup
              value={selections.fulfillment}
              onSelect={(fulfillment) => setSelections((s) => ({ ...s, fulfillment }))}
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
              disabled={activeStepIndex === 0}
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
              disabled={activeStepIndex === 0}
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
