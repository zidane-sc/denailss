import { describe, expect, it } from "vitest";
import {
  computeCustomerStats,
  getCustomerSegment,
  getCustomerStatus,
} from "@/features/crm/logic/customer-stats";
import type { CrmAppointment } from "@/features/crm/types";

const TODAY = "2026-08-09";

function appt(overrides: Partial<CrmAppointment>): CrmAppointment {
  return {
    id: "a",
    date: "2026-08-01",
    time: "10:00",
    serviceSlug: "manicure",
    serviceName: "Manicure",
    price: 90000,
    status: "completed",
    ...overrides,
  };
}

describe("computeCustomerStats", () => {
  it("computes visits and spending from completed appointments only", () => {
    const appointments = [
      appt({ id: "1", price: 90000 }),
      appt({ id: "2", price: 110000 }),
      appt({ id: "3", status: "cancelled", price: 150000 }),
    ];
    const stats = computeCustomerStats(appointments, TODAY);
    expect(stats.totalVisits).toBe(2);
    expect(stats.totalSpending).toBe(200000);
  });

  it("derives the favorite service from the most frequent", () => {
    const appointments = [
      appt({ id: "1", serviceSlug: "manicure", serviceName: "Manicure" }),
      appt({ id: "2", serviceSlug: "nail-art", serviceName: "Nail Art" }),
      appt({ id: "3", serviceSlug: "nail-art", serviceName: "Nail Art" }),
    ];
    const stats = computeCustomerStats(appointments, TODAY);
    expect(stats.favoriteServiceName).toBe("Nail Art");
  });

  it("derives the favorite design from the most frequent designSlug", () => {
    const appointments = [
      appt({ id: "1", designSlug: "korean-milk-nail", designTitle: "Korean Milk Nail" }),
      appt({ id: "2", designSlug: "chrome-mirror-silver", designTitle: "Chrome Mirror Silver" }),
      appt({ id: "3", designSlug: "korean-milk-nail", designTitle: "Korean Milk Nail" }),
    ];
    const stats = computeCustomerStats(appointments, TODAY);
    expect(stats.favoriteDesignSlug).toBe("korean-milk-nail");
    expect(stats.favoriteDesignTitle).toBe("Korean Milk Nail");
  });

  it("picks the latest completed date as lastVisit", () => {
    const appointments = [
      appt({ id: "1", date: "2026-07-01" }),
      appt({ id: "2", date: "2026-08-05" }),
      appt({ id: "3", date: "2026-08-03" }),
    ];
    const stats = computeCustomerStats(appointments, TODAY);
    expect(stats.lastVisit).toBe("2026-08-05");
    expect(stats.daysSinceLastVisit).toBe(4);
  });

  it("finds the next upcoming appointment", () => {
    const appointments = [
      appt({ id: "1", date: "2026-08-12", time: "14:00", status: "confirmed" }),
      appt({ id: "2", date: "2026-08-15", time: "10:00", status: "confirmed" }),
      appt({ id: "3", date: "2026-08-01", status: "completed" }),
    ];
    const stats = computeCustomerStats(appointments, TODAY);
    expect(stats.nextAppointment?.id).toBe("1");
  });

  it("returns empty favorite fields when nothing is dated/designed", () => {
    const stats = computeCustomerStats([], TODAY);
    expect(stats.totalVisits).toBe(0);
    expect(stats.totalSpending).toBe(0);
    expect(stats.favoriteServiceName).toBeNull();
    expect(stats.favoriteDesignSlug).toBeNull();
    expect(stats.lastVisit).toBeNull();
    expect(stats.nextAppointment).toBeNull();
  });
});

describe("getCustomerStatus", () => {
  it("is new when there are no completed visits but an upcoming appointment", () => {
    const stats = computeCustomerStats([appt({ status: "confirmed", date: "2026-08-12" })], TODAY);
    expect(getCustomerStatus(stats)).toBe("new");
  });

  it("is inactive when there are no visits and no upcoming appointment", () => {
    const stats = computeCustomerStats([appt({ status: "cancelled" })], TODAY);
    expect(getCustomerStatus(stats)).toBe("inactive");
  });

  it("is active with a recent visit", () => {
    const stats = computeCustomerStats([appt({ date: "2026-08-05" })], TODAY);
    expect(getCustomerStatus(stats)).toBe("active");
  });

  it("is inactive when the last visit was more than 60 days ago", () => {
    const stats = computeCustomerStats([appt({ date: "2026-05-01" })], TODAY);
    expect(getCustomerStatus(stats)).toBe("inactive");
  });
});

describe("getCustomerSegment", () => {
  it("maps new customers", () => {
    const stats = computeCustomerStats([appt({ status: "confirmed", date: "2026-08-12" })], TODAY);
    expect(getCustomerSegment(stats, "new")).toBe("new");
  });

  it("maps repeat customers", () => {
    const stats = computeCustomerStats([appt({}), appt({ id: "2" })], TODAY);
    expect(getCustomerSegment(stats, "active")).toBe("repeat");
  });

  it("maps inactive customers", () => {
    const stats = computeCustomerStats([], TODAY);
    expect(getCustomerSegment(stats, "inactive")).toBe("inactive");
  });
});
