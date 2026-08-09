"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Appointment } from "../types";
import { AVAILABILITY_CONFIG } from "@/features/booking/data/availability-config.mock";
import { DEPOSIT_CONFIG } from "@/features/booking/data/deposit-config.mock";
import { INITIAL_APPOINTMENTS } from "../data/appointments.mock";
import { getBookings, subscribeBookings } from "@/features/booking/store/bookings-store";
import type { AvailabilityConfig, TimeRange, BookingStatus, DepositVerificationStatus, DepositConfig } from "@/types";

interface BackofficeContextType {
  appointments: Appointment[];
  availabilityConfig: AvailabilityConfig;
  depositConfig: DepositConfig;
  
  // Appointment actions
  addAppointment: (appointment: Omit<Appointment, "id">) => void;
  updateAppointmentStatus: (id: string, status: BookingStatus) => void;
  rescheduleAppointment: (id: string, date: string, time: string) => void;
  approveDeposit: (id: string) => void;
  rejectDeposit: (id: string, reason: string) => void;
  
  // Availability actions
  updateWeeklyTemplate: (weekday: number, ranges: TimeRange[]) => void;
  addOverride: (dateKey: string, ranges: TimeRange[]) => void;
  removeOverride: (dateKey: string) => void;
  addVacation: (vacation: { start: string; end: string; reason: string }) => void;
  removeVacation: (index: number) => void;
  addBlockedTime: (blocked: { date: string; range: TimeRange; reason: string }) => void;
  removeBlockedTime: (index: number) => void;
  updateBookingRules: (rules: Partial<AvailabilityConfig["bookingRules"]>) => void;
  
  // Deposit Config action
  updateDepositConfig: (updates: Partial<DepositConfig>) => void;
}

const BackofficeContext = createContext<BackofficeContextType | undefined>(undefined);

export function BackofficeProvider({ children }: { children: React.ReactNode }) {
  // Keep the FE-first seed visible while hydrating persisted appointments when configured.
  const [appointments, setAppointments] = useState<Appointment[]>(() => [
    ...INITIAL_APPOINTMENTS,
    ...getBookings(),
  ]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/bookings")
      .then(async (response) => (response.ok ? ((await response.json()) as { data: Appointment[] }).data : []))
      .then((persisted) => {
        if (!cancelled && persisted.length > 0) {
          setAppointments((current) => {
            const byId = new Map([...current, ...persisted].map((appointment) => [appointment.id, appointment]));
            return [...byId.values()];
          });
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  const [availabilityConfig, setAvailabilityConfig] = useState<AvailabilityConfig>(AVAILABILITY_CONFIG);
  const [depositConfig, setDepositConfig] = useState<DepositConfig>(DEPOSIT_CONFIG);

  // Reflect new bookings from the booking flow into the backoffice.
  useEffect(() => {
    return subscribeBookings(() => {
      setAppointments((prev) => {
        const store = getBookings();
        const storeIds = new Set(store.map((b) => b.id));
        const merged = [
          ...prev.filter((a) => !storeIds.has(a.id)),
          ...store,
        ];
        // Keep stable ordering: mock first (by insertion), then store bookings.
        return merged.length === prev.length ? prev : merged;
      });
    });
  }, []);

  const updateDepositConfig = (updates: Partial<DepositConfig>) => {
    setDepositConfig((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  // Sync backoffice appointments to the global memory (optional / client session only)
  const addAppointment = (appointmentData: Omit<Appointment, "id">) => {
    const newId = `BKG-2026-${String(appointments.length + 1).padStart(3, "0")}`;
    const newAppt: Appointment = {
      ...appointmentData,
      id: newId,
    };
    setAppointments((prev) => [...prev, newAppt]);
  };

  const persistAppointment = (id: string, updates: Record<string, unknown>) => {
    void fetch(`/api/v1/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => undefined);
  };

  const updateAppointmentStatus = (id: string, status: BookingStatus) => {
    persistAppointment(id, { status });
    setAppointments((prev) =>
      prev.map((appt) => {
        if (appt.id !== id) return appt;
        
        let depositStatus = appt.depositStatus;
        // Automatically sync depositStatus with booking status where it makes sense
        if (status === "confirmed" && appt.depositRequired && appt.depositStatus === "waiting_verification") {
          depositStatus = "approved";
        }
        
        return {
          ...appt,
          status,
          depositStatus,
        };
      })
    );
  };

  const rescheduleAppointment = (id: string, date: string, time: string) => {
    persistAppointment(id, { dateKey: date, time });
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === id
          ? {
              ...appt,
              date,
              time,
              status: appt.status === "cancelled" || appt.status === "no_show" ? "confirmed" : appt.status,
            }
          : appt
      )
    );
  };

  const approveDeposit = (id: string) => {
    persistAppointment(id, { status: "confirmed", depositStatus: "approved", depositRejectReason: null });
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === id
          ? {
              ...appt,
              status: "confirmed",
              depositStatus: "approved" as DepositVerificationStatus,
              depositRejectReason: undefined,
            }
          : appt
      )
    );
  };

  const rejectDeposit = (id: string, reason: string) => {
    persistAppointment(id, { status: "pending_deposit", depositStatus: "rejected", depositRejectReason: reason });
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === id
          ? {
              ...appt,
              status: "pending_deposit",
              depositStatus: "rejected" as DepositVerificationStatus,
              depositRejectReason: reason,
            }
          : appt
      )
    );
  };

  const updateWeeklyTemplate = (weekday: number, ranges: TimeRange[]) => {
    setAvailabilityConfig((prev) => ({
      ...prev,
      weeklyTemplate: {
        ...prev.weeklyTemplate,
        [weekday]: ranges,
      },
    }));
  };

  const addOverride = (dateKey: string, ranges: TimeRange[]) => {
    setAvailabilityConfig((prev) => ({
      ...prev,
      overrides: {
        ...prev.overrides,
        [dateKey]: ranges,
      },
    }));
  };

  const removeOverride = (dateKey: string) => {
    setAvailabilityConfig((prev) => {
      const overrides = { ...prev.overrides };
      delete overrides[dateKey];
      return {
        ...prev,
        overrides,
      };
    });
  };

  const addVacation = (vacation: { start: string; end: string; reason: string }) => {
    setAvailabilityConfig((prev) => ({
      ...prev,
      vacations: [...prev.vacations, vacation],
    }));
  };

  const removeVacation = (index: number) => {
    setAvailabilityConfig((prev) => ({
      ...prev,
      vacations: prev.vacations.filter((_, i) => i !== index),
    }));
  };

  const addBlockedTime = (blocked: { date: string; range: TimeRange; reason: string }) => {
    setAvailabilityConfig((prev) => ({
      ...prev,
      blockedTimes: [...prev.blockedTimes, blocked],
    }));
  };

  const removeBlockedTime = (index: number) => {
    setAvailabilityConfig((prev) => ({
      ...prev,
      blockedTimes: prev.blockedTimes.filter((_, i) => i !== index),
    }));
  };

  const updateBookingRules = (rules: Partial<AvailabilityConfig["bookingRules"]>) => {
    setAvailabilityConfig((prev) => ({
      ...prev,
      bookingRules: {
        ...prev.bookingRules,
        ...rules,
      },
    }));
  };

  return (
    <BackofficeContext.Provider
      value={{
        appointments,
        availabilityConfig,
        depositConfig,
        addAppointment,
        updateAppointmentStatus,
        rescheduleAppointment,
        approveDeposit,
        rejectDeposit,
        updateWeeklyTemplate,
        addOverride,
        removeOverride,
        addVacation,
        removeVacation,
        addBlockedTime,
        removeBlockedTime,
        updateBookingRules,
        updateDepositConfig,
      }}
    >
      {children}
    </BackofficeContext.Provider>
  );
}

export function useBackoffice() {
  const context = useContext(BackofficeContext);
  if (!context) {
    throw new Error("useBackoffice must be used within a BackofficeProvider");
  }
  return context;
}
