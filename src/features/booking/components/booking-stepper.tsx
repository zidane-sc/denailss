"use client";

import { CheckIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

export interface StepMeta {
  id: string;
  label: string;
}

export function BookingStepper({
  steps,
  currentIndex,
  maxReachedIndex,
  onStepClick,
}: {
  steps: StepMeta[];
  currentIndex: number;
  maxReachedIndex: number;
  onStepClick: (index: number) => void;
}) {
  const progressPercent =
    steps.length <= 1 ? 100 : (currentIndex / (steps.length - 1)) * 100;

  return (
    <div>
      <div className="sm:hidden">
        <p className="text-sm font-medium text-muted-foreground">
          Langkah {currentIndex + 1}/{steps.length} &middot; {steps[currentIndex]?.label}
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="hidden items-center sm:flex">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isClickable = index <= maxReachedIndex;

          return (
            <div key={step.id} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(index)}
                className="flex flex-col items-center gap-1.5 disabled:cursor-not-allowed"
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground"
                  )}
                >
                  {isCompleted ? <CheckIcon className="size-3.5" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap text-xs font-medium",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <span
                  className={cn(
                    "mx-2 h-px flex-1 rounded-full transition-colors",
                    index < currentIndex ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
