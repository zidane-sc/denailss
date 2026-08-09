# CRM Table Pagination & Sorting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add clickable column sorting and shared pagination (desktop table + mobile cards) to the `/backoffice/customers` CRM list, mirroring the existing dashboard table pattern.

**Architecture:** A pure `sortCustomers(rows, field, direction)` helper added to `src/features/crm/logic/customer-stats.ts` does all ordering (testable via typecheck + manual checks). `CustomerListView` gains `sortField`/`sortDirection`/`currentPage` state and derives a sorted, sliced `paginated` list that both the desktop `<table>` and mobile `AnimatePresence` card list render, with pagination controls styled identically to `dashboard-view.tsx`.

**Tech Stack:** React 19, Next.js 16 (Turbopack), TypeScript strict, Tailwind v4, `motion/react`. No new dependencies. Repo has no test runner — verification is `npx tsc --noEmit`, `npx eslint`, and visual check in the browser.

## Global Constraints

- **Vibe seams:** The CRM feature lives in `src/features/crm/` following the pattern of `src/features/appointment/`. Pure logic goes in `logic/`, data in `data/`, UI in `components/`.
- **No `asChild`:** shadcn/Base UI composition uses `render={<Link .../>}` and `nativeButton={false}`. `Button` used for pagination controls is a real `<button>` (no render needed).
- **Icons:** import from `@phosphor-icons/react/dist/ssr` only; use `ArrowLeftIcon`/`ArrowRightIcon` if adding icon buttons (keep text buttons like dashboard for consistency).
- **Copy is Indonesian**; sort indicator uses `▲`/`▼`/`↕` glyphs (existing dashboard convention).
- **Light mode only** — no `dark:` variants; use existing tokens (`primary`, `muted`, `border`, `muted-foreground`).
- **Don't touch** search (`matchesCustomerQuery`), segment pills, row-click navigation, detail page, notes, history, or any Epic 1-3 code.
- Base UI `Avatar`, `Input`, `Button` come from `@/components/ui/*`.

---

### Task 1: Add `sortCustomers` + `CustomerSortField` to CRM logic

**Files:**
- Modify: `src/features/crm/logic/customer-stats.ts` (append at end)
- Reference: `src/features/crm/types.ts` (defines `CustomerRow`, `CustomerStatus`, `STATUS_LABELS` is in logic file)

**Interfaces:**
- Consumes: `CustomerRow`, `CustomerStatus` from `../types`; `STATUS_LABELS` (same file).
- Produces:
  - `export type CustomerSortField = "name" | "visits" | "spending" | "lastVisit" | "status";`
  - `export function sortCustomers(rows: CustomerRow[], field: CustomerSortField, direction: "asc" | "desc"): CustomerRow[];`

- [ ] **Step 1: Read the current file to confirm existing helper names and tail**
  Read `src/features/crm/logic/customer-stats.ts` fully (183 lines). Confirm `STATUS_LABELS` exists and no `sortCustomers`/`CustomerSortField` already present.

- [ ] **Step 2: Append the sort field type and comparator**

  Add after line 183 (`STATUS_LABELS` block):

  ```ts
  export type CustomerSortField = "name" | "visits" | "spending" | "lastVisit" | "status";
  ```

- [ ] **Step 3: Append the `sortCustomers` function**

  ```ts
  export function sortCustomers(
    rows: CustomerRow[],
    field: CustomerSortField,
    direction: "asc" | "desc"
  ): CustomerRow[] {
    const order = direction === "asc" ? 1 : -1;

    const compare = (a: CustomerRow, b: CustomerRow): number => {
      switch (field) {
        case "name":
          return a.customer.name.localeCompare(b.customer.name, "id");
        case "visits":
          return a.stats.totalVisits - b.stats.totalVisits;
        case "spending":
          return a.stats.totalSpending - b.stats.totalSpending;
        case "lastVisit":
          if (!a.stats.lastVisit && !b.stats.lastVisit) return 0;
          if (!a.stats.lastVisit) return 1; // nulls always last
          if (!b.stats.lastVisit) return -1;
          return a.stats.lastVisit.localeCompare(b.stats.lastVisit);
        case "status": {
          if (a.status !== b.status) return statusOrder(a.status) - statusOrder(b.status);
          return a.customer.name.localeCompare(b.customer.name, "id");
        }
      }
    };

    return [...rows].sort((a, b) => order * compare(a, b));
  }

  function statusOrder(status: CustomerStatus): number {
    return status === "new" ? 0 : status === "active" ? 1 : 2;
  }
  ```

  Requires `CustomerSortField`, `CustomerRow`, and `CustomerStatus` types — the import fix is in Step 4.

- [ ] **Step 4: Add the missing import and run typecheck**

  The top-of-file types import (lines 2-7) already includes `CustomerStatus` but **not** `CustomerRow`. Add it:

  ```ts
  import type {
    CrmAppointment,
    CustomerRow,
    CustomerSegment,
    CustomerStats,
    CustomerStatus,
  } from "../types";
  ```

  `sortCustomers` calls `statusOrder(a.status)` where `status: CustomerStatus` — `CustomerStatus` is already imported. Only `CustomerRow` is new.

  Run: `npx tsc --noEmit`
  Expected: no errors in `src/features/crm/`.

- [ ] **Step 5: Lint + commit**

  Run: `npm run lint`
  Commit:
  ```bash
  git add src/features/crm/logic/customer-stats.ts
  git commit -m "feat(crm): add sortCustomers pure helper"
  ```

---

### Task 2: Wire sorting + pagination state into `CustomerListView`

**Files:**
- Modify: `src/features/crm/components/customer-list-view.tsx`
- Tests are walk-only (repo has no runner) — verification via typecheck + eslint + visual.

**Interfaces:**
- Consumes: `CustomerSortField`, `sortCustomers` from `../logic/customer-stats`; `CustomerRow` from `../types`.
- Produces: rendered desktop `<table>` + mobile card list behind `paginatedRows`; sortable `<th>` markers; pagination footer with `Sebelumnya`/`Berikutnya`.

- [ ] **Step 1: Read the current component**
  Read `src/features/crm/components/customer-list-view.tsx` fully. Note current `rows` useMemo (lines 35), desktop `<table>` (lines 114-133), mobile `AnimatePresence` (lines 136-142).

- [ ] **Step 2: Add sorting/pagination state**

  Where `const [segment, setSegment] = ...` lives (top of `CustomerListView`), add:

  ```ts
  const [sortField, setSortField] = useState<CustomerSortField>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset page whenever the underlying result set changes.
  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageRows = useMemo(() => {
    const sorted = sortCustomers(rows, sortField, sortDirection);
    const from = (safePage - 1) * itemsPerPage;
    return sorted.slice(from, from + itemsPerPage);
  }, [rows, sortField, sortDirection, safePage]);
  ```

  and reset page when filters change:
  ```ts
  useEffect(() => {
    setCurrentPage(1);
  }, [query, segment, sortField, sortDirection]);
  ```

  Add `useEffect` to the existing `react` import line (`import { useMemo, useState, useEffect } from "react"` — currently `import React, { useMemo, useState } from "react"`).

- [ ] **Step 3: Page-aware row iterator**
  Thread to the empty/rows checks: `rows` empty-state checks stay on whether total rows exist (`rows.length === 0`), but the desktop and mobile lists iterate `pageRows`:

  - `<tbody>`: `render` each row from `pageRows` (requires the `CustomerTableRow` inner tds referenced to `row` fields unchanged).
  - Mobile card list `[...]`: `pageRows.map((row) => <CustomerMobileCard key={row.customer.id} ... />)`.

- [ ] **Step 4: Make sortable headers clickable**

  Replace the desktop `<thead>` cells for Pelanggan, Kunjungan, Total Belanja, Kunjungan Terakhir, Status:

  ```tsx
  <th
    className="cursor-pointer select-none p-3 transition-colors hover:bg-muted/70"
    onClick={() => {
      if (sortField === "name") setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      else { setSortField("name"); setSortDirection("asc"); }
    }}
  >
    <span className="inline-flex items-center gap-1">
      Pelanggan
      <span className="text-[10px] text-primary">
        {sortField === "name" ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}
      </span>
    </span>
  </th>
  ```

  Apply the same pattern to:
  - `Kunjungan` → field `"visits"` (`text-center` class on th kept, wrap label+icon in `justify-center` flex for centered cells for both).
  - `Total Belanja` → field `"spending"` (`text-right` classes kept, flex `justify-end`).
  - `Kunjungan Terakhir` → field `"lastVisit"`.
  - `Status` → field `"status"` (keeps `text-right`).

  Leave `Kontak` and `Layanan Favorit` cells **without** `onClick` (static, no cursor-pointer).

- [ ] **Step 5: Pagination footer**

  After the desktop `</table>` div, add the same footer as dashboard, but place it **outside/after both the table and the mobile card div** so it's shared. Wrap in a fragment like:

  ```tsx
  {totalPages > 1 && (
    <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4">
      <span className="text-[11px] text-muted-foreground">
        Menampilkan {(safePage - 1) * itemsPerPage + 1}-
        {Math.min(safePage * itemsPerPage, totalRows)} dari {totalRows} data
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" disabled={safePage === 1} onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>
          Sebelumnya
        </Button>
        <span className="px-2 text-xs font-semibold text-foreground">{safePage} / {totalPages}</span>
        <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" disabled={safePage === totalPages} onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}>
          Berikutnya
        </Button>
      </div>
    </div>
  )}
  ```

- [ ] **Step 6: Typecheck + eslint**

  Run: `npx tsc --noEmit` → expect no evidence of the crm feature errors.
  Run: `npm run lint` → expect 0 problems on the modified file.

- [ ] **Step 7: Visual check in dev server**

  Run `npm run dev` and open `http://localhost:3000/backoffice/customers` (or the deployed URL):
  - Desktop table: 10 customers → 2 pages. Click "Kunjungan Terakhir" — order flips (▲/▼ indicator must toggle).
  - Click "Pelanggan" — sorts name alphabetical; "Total Belanja" — 90K… 140K… ascending then flip. Click "Status" — ascending puts Pelanggan Baru (Pevita/Isyana) first and Tidak Aktif (Melati) last; flip once and meet Melati first.
  - Search "Alya" filters to 1 row; pagination controls should vanish (totalPages=1).
  - Scroll to bottom, click "Berikutnya", page indicator shows "2 / 2".
  - Mobile card list honors same page — resize and confirm both views show same 5 items.

- [ ] **Step 8: Commit**

  ```bash
  git add src/features/crm/components/customer-list-view.tsx src/features/crm/logic/customer-stats.ts
  git commit -m "feat(crm): add pagination and column sorting to customer list"
  ```

---

### Task 3: Docs note + full checks

**Files:**
- Modify: `docs/PROGRESS.md`

**Interfaces:** none (documentation only) — walk the final feature.

- [ ] **Step 1: Update PROGRESS.md**

  In the CRM section (`### CRM (`src/features/crm/`)`), extend the `/backoffice/customers` bullet with: "Table supports clickable column sorting (name, visits, spending, last visit, status) and shared pagination (5/page) driving both the desktop table and mobile cards, mirroring the dashboard list."

- [ ] **Step 2: Full verification**

  Run: `npx tsc --noEmit` (expect no new errors beyond any pre-existing unrelated WIP).
  Run: `npm run lint`.
  Run: `npm run build` (expect success when prior WIP has landed; if the still-uncommitted customer/appointment multi-service migration is still in mid-state with type errors, note its path and don't fix — it's out of scope).

- [ ] **Step 3: Commit**

  ```bash
  git add docs/PROGRESS.md
  git commit -m "docs: note CRM table pagination and sorting"
  ```