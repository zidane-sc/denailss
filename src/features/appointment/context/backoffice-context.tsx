"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Appointment } from "../types";
import type { AvailabilityConfig, TimeRange, BookingStatus, DepositVerificationStatus, DepositConfig } from "@/types";

interface BackofficeContextType {
  appointments: Appointment[];
  availabilityConfig: AvailabilityConfig | null;
  depositConfig: DepositConfig | null;
  
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
  // Start empty and hydrate persisted appointments from the API on mount.
  const [appointments, setAppointments] = useState<Appointment[]>([]);

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
  const [availabilityConfig, setAvailabilityConfig] = useState<AvailabilityConfig | null>(null);
  const [depositConfig, setDepositConfig] = useState<DepositConfig | null>(null);

  // Hydrate availability + deposit configs from the API.
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/v1/availability", { cache: "no-store" }).then(async (r) => (r.ok ? (await r.json()) : null)),
      fetch("/api/v1/deposit-config", { cache: "no-store" }).then(async (r) => (r.ok ? (await r.json()) : null)),
    ])
      .then(([avail, dep]) => {
        if (cancelled) return;
        if (avail?.data?.config) setAvailabilityConfig(avail.data.config as AvailabilityConfig);
        if (dep?.data) setDepositConfig(dep.data as DepositConfig);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  /** Persist the availability config via the API (fire-and-forget after optimistic update). */
  const persistAvailability = (next: AvailabilityConfig) => {
    void fetch("/api/v1/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    }).catch(() => undefined);
  };

  /** Persist the deposit config via the API (fire-and-forget after optimistic update). */
  const persistDeposit = (next: DepositConfig) => {
    void fetch("/api/v1/deposit-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    }).catch(() => undefined);
  };

  const updateDepositConfig = (updates: Partial<DepositConfig>) => {
    setDepositConfig((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      persistDeposit(next);
      return next;
    });
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
    setAvailabilityConfig((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        weeklyTemplate: {
          ...prev.weeklyTemplate,
          [weekday]: ranges,
        },
      };
      persistAvailability(next);
      return next;
    });
  };

  const addOverride = (dateKey: string, ranges: TimeRange[]) => {
    setAvailabilityConfig((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        overrides: {
          ...prev.overrides,
          [dateKey]: ranges,
        },
      };
      persistAvailability(next);
      return next;
    });
  };

  const removeOverride = (dateKey: string) => {
    setAvailabilityConfig((prev) => {
      if (!prev) return prev;
      const overrides = { ...prev.overrides };
      delete overrides[dateKey];
      const next = {
        ...prev,
        overrides,
      };
      persistAvailability(next);
      return next;
    });
  };

  const addVacation = (vacation: { start: string; end: string; reason: string }) => {
    setAvailabilityConfig((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        vacations: [...prev.vacations, vacation],
      };
      persistAvailability(next);
      return next;
    });
  };

  const removeVacation = (index: number) => {
    setAvailabilityConfig((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        vacations: prev.vacations.filter((_, i) => i !== index),
      };
      persistAvailability(next);
      return next;
    });
  };

  const addBlockedTime = (blocked: { date: string; range: TimeRange; reason: string }) => {
    setAvailabilityConfig((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        blockedTimes: [...prev.blockedTimes, blocked],
      };
      persistAvailability(next);
      return next;
    });
  };

  const removeBlockedTime = (index: number) => {
    setAvailabilityConfig((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        blockedTimes: prev.blockedTimes.filter((_, i) => i !== index),
      };
      persistAvailability(next);
      return next;
    });
  };

  const updateBookingRules = (rules: Partial<AvailabilityConfig["bookingRules"]>) => {
    setAvailabilityConfig((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        bookingRules: {
          ...prev.bookingRules,
          ...rules,
        },
      };
      persistAvailability(next);
      return next;
    });
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
