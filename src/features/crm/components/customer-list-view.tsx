"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, UsersThreeIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { getCrmCustomers, getCustomerAppointments, getCustomerReviews } from "../data/customers.mock";
import {
  computeCustomerStats,
  getCustomerSegment,
  getCustomerStatus,
  matchesCustomerQuery,
  shortDateId,
  sortCustomers,
} from "../logic/customer-stats";
import type { CustomerRow, CustomerSegment } from "../types";
import type { CustomerSortField } from "../logic/customer-stats";
import { CustomerAvatar, CustomerStatusBadge, EmptyState } from "./customer-shared";

const SEGMENTS: { value: CustomerSegment | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "new", label: "Pelanggan Baru" },
  { value: "repeat", label: "Pelanggan Berulang" },
  { value: "inactive", label: "Tidak Aktif" },
];

const COLUMNS: {
  field?: CustomerSortField;
  label: string;
  align?: "left" | "center" | "right";
  pad?: "left" | "right";
}[] = [
  { field: "name", label: "Pelanggan", pad: "left" },
  { label: "Kontak" },
  { field: "visits", label: "Kunjungan", align: "center" },
  { field: "spending", label: "Total Belanja", align: "right" },
  { label: "Layanan Favorit" },
  { field: "lastVisit", label: "Kunjungan Terakhir" },
  { field: "status", label: "Status", align: "right", pad: "right" },
];

export function CustomerListView() {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<CustomerSegment | "all">("all");
  const [sortField, setSortField] = useState<CustomerSortField>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const rows = useMemo(() => buildRows(query, segment), [query, segment]);

  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageRows = useMemo(() => {
    const sorted = sortCustomers(rows, sortField, sortDirection);
    const from = (safePage - 1) * itemsPerPage;
    return sorted.slice(from, from + itemsPerPage);
  }, [rows, sortField, sortDirection, safePage, itemsPerPage]);

  const hasAnyCustomer = getCrmCustomers().length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border/50 pb-5">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground/90">
          Pelanggan
        </h2>
        <p className="text-sm text-muted-foreground">
          Kenali pelangganmu, dari booking pertama sampai kunjungan berikutnya.
        </p>
      </div>

      {!hasAnyCustomer && (
        <section className="bg-card rounded-2xl border border-border/70 shadow-xs">
          <EmptyState
            icon={<UsersThreeIcon />}
            title="Belum ada pelanggan."
            description="Nama pelanggan akan muncul di sini begitu ada booking pertama, entah lewat website atau dicatat manual."
          />
        </section>
      )}

      {hasAnyCustomer && (
        <>
          {/* Search + filters */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari nama, no. HP, atau email..."
                className="h-10 pl-9"
                aria-label="Cari pelanggan"
              />
            </div>

            <div
              className="flex flex-wrap items-center gap-1.5"
              role="group"
              aria-label="Filter pelanggan"
            >
              {SEGMENTS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSegment(option.value);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "inline-flex h-8 items-center rounded-full border px-3.5 text-xs font-semibold transition-all duration-200",
                    segment === option.value
                      ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/20"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {rows.length === 0 ? (
            <section className="bg-card rounded-2xl border border-border/70 shadow-xs">
              <EmptyState
                icon={<MagnifyingGlassIcon />}
                title="Pelanggan tidak ditemukan."
                description={
                  query
                    ? `Tidak ada pelanggan yang cocok dengan pencarian "${query}". Coba kata kunci lain.`
                    : "Coba ubah filter di atas untuk melihat pelanggan lain."
                }
              />
            </section>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs md:block">
                <table className="w-full border-collapse text-left text-xs text-foreground/95">
                  <thead>
                    <tr className="border-b bg-muted/40 font-semibold text-muted-foreground">
                      {COLUMNS.map((col) => {
                        const field = col.field;
                        return field ? (
                          <th
                            key={field}
                            className={cn(
                              "cursor-pointer select-none p-3 transition-colors hover:bg-muted/70",
                              col.align === "center" && "text-center",
                              col.align === "right" && "text-right",
                              col.pad === "left" && "pl-5",
                              col.pad === "right" && "pr-5"
                            )}
                            onClick={() => {
                              if (sortField === field) {
                                setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                              } else {
                                setSortField(field);
                                setSortDirection("asc");
                              }
                              setCurrentPage(1);
                            }}
                          >
                            <span
                              className={cn(
                                "inline-flex items-center gap-1",
                                col.align === "center" && "justify-center",
                                col.align === "right" && "justify-end"
                              )}
                            >
                              {col.label}
                              <span className="text-[10px] text-primary">
                                {sortField === field
                                  ? sortDirection === "asc"
                                    ? "▲"
                                    : "▼"
                                  : "↕"}
                              </span>
                            </span>
                          </th>
                        ) : (
                          <th
                            key={col.label}
                            className={cn(
                              "p-3",
                              col.align === "center" && "text-center",
                              col.align === "right" && "text-right"
                            )}
                          >
                            {col.label}
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {pageRows.map((row) => (
                      <CustomerTableRow key={row.customer.id} row={row} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                <AnimatePresence initial={false} mode="popLayout">
                  {pageRows.map((row) => (
                    <CustomerMobileCard key={row.customer.id} row={row} reduce={reduce} />
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex flex-col gap-3 border-t border-border/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[11px] text-muted-foreground">Tampilkan</span>
                  <select
                    aria-label="Jumlah item per halaman"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-8 rounded-lg border border-border bg-card px-2 text-xs font-semibold shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {[5, 10, 15, 25, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-muted-foreground">per halaman</span>
                  <span className="ml-1 text-[11px] text-muted-foreground">
                    · Menampilkan {(safePage - 1) * itemsPerPage + 1}-
                    {Math.min(safePage * itemsPerPage, totalRows)} dari {totalRows} data
                  </span>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-xs"
                      disabled={safePage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    >
                      Sebelumnya
                    </Button>
                    <span className="px-2 text-xs font-semibold text-foreground">
                      {safePage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-xs"
                      disabled={safePage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    >
                      Berikutnya
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function CustomerTableRow({ row }: { row: CustomerRow }) {
  const router = useRouter();
  const { customer, stats, status } = row;

  return (
    <tr
      className="group cursor-pointer transition-colors hover:bg-muted/15"
      onClick={() => router.push(`/backoffice/customers/${customer.id}`)}
    >
      <td className="p-3 pl-5">
        <div className="flex items-center gap-3">
          <CustomerAvatar name={customer.name} />
          <div>
            <p className="font-semibold text-foreground transition-colors group-hover:text-primary">
              {customer.name}
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Pelanggan sejak {shortDateId(customer.since)}
            </p>
          </div>
        </div>
      </td>
      <td className="p-3">
        <p className="font-medium">{customer.phone}</p>
        {customer.email && (
          <p className="mt-0.5 max-w-[180px] truncate text-[10px] text-muted-foreground">
            {customer.email}
          </p>
        )}
      </td>
      <td className="p-3 text-center font-heading font-semibold">{stats.totalVisits}</td>
      <td className="p-3 text-right font-heading font-semibold text-foreground/90">
        {formatIDR(stats.totalSpending)}
      </td>
      <td className="p-3 font-medium text-foreground/85">
        {stats.favoriteServiceName ?? "—"}
      </td>
      <td className="p-3">{stats.lastVisit ? shortDateId(stats.lastVisit) : "—"}</td>
      <td className="p-3 pr-5 text-right">
        <CustomerStatusBadge status={status} />
      </td>
    </tr>
  );
}

function CustomerMobileCard({
  row,
  reduce,
}: {
  row: CustomerRow;
  reduce: boolean | null;
}) {
  const { customer, stats, status } = row;

  return (
    <motion.div
      layout
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/backoffice/customers/${customer.id}`}
        className="block rounded-2xl border border-border/60 bg-card p-4 shadow-xs transition-colors hover:border-primary/40"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <CustomerAvatar name={customer.name} />
            <div>
              <p className="text-sm font-semibold text-foreground">{customer.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{customer.phone}</p>
            </div>
          </div>
          <CustomerStatusBadge status={status} />
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
          <span className="text-xs text-muted-foreground">
            {stats.totalVisits} kunjungan
          </span>
          <span className="font-heading text-sm font-semibold text-foreground/90">
            {formatIDR(stats.totalSpending)}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            Kunjungan terakhir · {stats.lastVisit ? shortDateId(stats.lastVisit) : "—"}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 rounded-full px-2 text-[11px] text-primary [&>svg]:size-3.5"
            nativeButton={false}
            render={<Link href={`/backoffice/customers/${customer.id}`} />}
          >
            Buka <ArrowRightIcon />
          </Button>
        </div>
      </Link>
    </motion.div>
  );
}

// Re-exported helper kept at the bottom for readability — rows for the list.
function buildRows(query: string, segment: CustomerSegment | "all") {
  return getCrmCustomers()
    .map((customer) => {
      const appointments = getCustomerAppointments(customer.id);
      const reviews = getCustomerReviews(customer.id);
      const stats = computeCustomerStats(appointments);
      const status = getCustomerStatus(stats);
      const row: CustomerRow = {
        customer,
        appointments,
        reviews,
        stats,
        status,
        segment: getCustomerSegment(stats, status),
      };
      return row;
    })
    .filter((row) =>
      matchesCustomerQuery(row.customer.name, row.customer.phone, row.customer.email, query)
    )
    .filter((row) => segment === "all" || row.segment === segment);
}