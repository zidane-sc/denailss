"use client";

import { useCallback, useEffect, useState } from "react";
import { computeCustomerStats, getCustomerSegment, getCustomerStatus } from "../logic/customer-stats";
import type { CustomerRow, CrmAppointment, CrmCustomer, CrmReview } from "../types";

/** API shape of a customer with its history (mirrors crm-service output). */
export interface CrmCustomerWithData extends CrmCustomer {
  appointments: CrmAppointment[];
  reviews: CrmReview[];
}

/**
 * Fetches the DB-backed CRM customer list and pre-computes each customer's
 * stats/status/segment into the `CustomerRow` shape the views render.
 */
export function useCrmCustomers() {
  const [customers, setCustomers] = useState<CrmCustomerWithData[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    fetch("/api/v1/crm/customers", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return;
        const payload = (await res.json()) as { data?: CrmCustomerWithData[] };
        if (payload.data) setCustomers(payload.data);
      })
      .catch(() => {
        // keep the current list
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const rows: CustomerRow[] = customers.map((customer) => {
    const appointments = customer.appointments;
    const reviews = customer.reviews;
    const stats = computeCustomerStats(appointments);
    const status = getCustomerStatus(stats);
    return {
      customer: { ...customer, notes: customer.notes ?? undefined, preferences: customer.preferences },
      appointments,
      reviews,
      stats,
      status,
      segment: getCustomerSegment(stats, status),
    };
  });

  return { rows, customers, loading, refresh };
}
