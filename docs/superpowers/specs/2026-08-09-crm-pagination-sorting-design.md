# CRM Pelanggan — Pagination & Sorting Table

**Date:** 2026-08-09
**Status:** Approved design
**Scope:** `src/features/crm/components/customer-list-view.tsx` + new pure helper in `src/features/crm/logic/customer-stats.ts`.

## Problem

The `/backoffice/customers` list currently renders every matching customer at once in a flat table (desktop) / card list (mobile). The dashboard appointments table (Epic 2/3) already ships working pagination + column sorting; the CRM list should match that pattern for consistency and to stay usable as the mock customer book grows.

## Decisions (from clarifying questions)

1. **Sortable columns:** Pelanggan (name), Kunjungan (visits), Total Belanja (spending), Kunjungan Terakhir (lastVisit), Status. Kontak and Layanan Favorit columns stay static (non-clickable).
2. **Pagination applies to both breakpoints:** the same page state drives both the desktop table rows and the mobile card list (they show the same slice), so results are consistent across viewports.

## Design

### State (in `CustomerListView`)

Add, mirroring `dashboard-view.tsx`:

- `sortField: "name" | "visits" | "spending" | "lastVisit" | "status"` — default `"name"`.
- `sortDirection: "asc" | "desc"` — default `"asc"`.
- `currentPage` (default `1`) and `itemsPerPage = 5`.
- Reset `currentPage` to 1 whenever `query`, `segment`, `sortField`, or `sortDirection` changes (a `useEffect`).

### Pure logic — `logic/customer-stats.ts`

New exported helper:

```ts
type CustomerSortField = "name" | "visits" | "spending" | "lastVisit" | "status";
export const CUSTOMER_SORT_FIELDS = [...] as const;
export function sortCustomers(
  rows: CustomerRow[],
  field: CustomerSortField,
  direction: "asc" | "desc"
): CustomerRow[];
```

Comparators:

- `name` → `a.customer.name.localeCompare(b.customer.name)` (id-ID style, JS default).
- `visits` → `a.stats.totalVisits - b.stats.totalVisits`.
- `spending` → `a.stats.totalSpending - b.stats.totalSpending`.
- `lastVisit` → compare `YYYY-MM-DD` strings lexicographically; rows without a last visit (null) always sort to the end regardless of direction.
- `status` → fixed order `new < active < inactive` via `STATUS_LABELS`/index, else `localeCompare`.

Direction applied via `direction === "asc" ? comparison : -comparison` (lastVisit nulls excluded first).

### Component changes — `components/customer-list-view.tsx`

- Derive `rows = useMemo(() => buildRows(query, segment), [query, segment])` then
  `paginated = useMemo(() => { const sorted = sortCustomers(rows, sortField, sortDirection); const from = (currentPage-1)*itemsPerPage; return sorted.slice(from, from + itemsPerPage); }, [rows, sortField, sortDirection, currentPage])`.
- `.slice()` applied after sorting, so search empty states and segment pills stay unchanged.
- Desktop `<thead>` — make the sortable `<th>` columns clickable: `cursor-pointer hover:bg-muted/70 transition-colors`, inner `<div className="flex items-center gap-1">` with label + `<span className="text-[10px] text-primary">{sortField === field ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}</span>`, exactly like `dashboard-view.tsx` (lines ~846). Non-sortable columns keep their current markup.
- Mobile card list iterates `paginated` instead of `rows` (AnimatePresence keyed items unchanged).
- Pagination controls below the list (visible when `totalPages > 1`), styled identically to dashboard:
  - Left: `Menampilkan {from+1}-{min(from+itemsPerPage, count)} dari {count} data`.
  - Right: `Sebelumnya` / `{currentPage} / {totalPages}` / `Berikutnya` (outline sm buttons, disabled at first/last).

### Not changed

- Search (`matchesCustomerQuery`) and segment pills semantics.
- Row-click navigation and all other existing behavior.
- No new dependencies; no new components; no backend.
- `docs/PROGRESS.md` gets a one-line note under the CRM section.