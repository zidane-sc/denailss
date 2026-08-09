# Implementation Progress

**Last updated:** 2026-08-09
**Purpose:** Running memory of what's built, how it's built, and what's next. Read this before starting new work; update it when scope changes.

---

## Current Phase

Epics 1, 2, 3, 4 (CRM), 5 (Gallery Management), 6 (Promotion admin), 7 (Finance), and 8 (Analytics) are implemented. The frontend-first phase is complete enough to begin backend wiring. A first backend vertical slice now exists: Drizzle schema + generated Supabase migration, shared API helpers, catalog/availability routes, booking create/list/detail/update routes, server-side catalog validation and pricing, transactional customer/appointment persistence, and frontend booking/backoffice adapters. Google OAuth, SSR session refresh, customer/owner route guards, Auth profile linkage, and RLS policies are now implemented and migrated to Supabase. Authenticated booking ownership is now enforced in the API, guest booking remains supported, and the customer dashboard, booking history/detail, profile, and portal header read persistent Supabase-backed data. The remaining favorites, reviews, CRM, and admin domains still run against local mock data in `*.mock.ts` files.

**Production Storage and complete domain migration are not implemented yet.** Public booking now fails explicitly when the API/database is unavailable instead of creating a misleading session-only booking. The approved Google accounts must be promoted with `supabase/OWNER_SETUP.sql` before `/backoffice` is accessible; the SQL supports two owner UUIDs. Auth/RLS SQL is currently hand-authored under `supabase/migrations/0001_auth_rls.sql` and was applied directly because Drizzle's journal only tracks generated migrations; the existing-account profile backfill is in `0002_backfill_auth_profiles.sql`.

Epic 8 (Analytics) is implemented; Epic 9 (Settings) is implemented FE-first on mocks. SEO polish (sitemap, robots, JSON-LD, canonical/OG metadata) is done.

---

## What's Done

### Design system
- Next.js 16 (App Router, Turbopack), TypeScript strict, Tailwind v4.
- shadcn/ui on **Base UI** (not Radix) — this shadcn install uses `@base-ui/react`. Key difference from the Radix-flavored docs most training data assumes: **no `asChild` prop**. Composition uses `render={<Link href="..." />}` instead, and native-button components need `nativeButton={false}` when rendered as a link/anchor (see `src/components/layout/site-header.tsx` for the pattern). `components.json` still says `iconLibrary: "lucide"` (unused metadata, harmless) — actual icons are `@phosphor-icons/react`, lucide-react was uninstalled.
- Fonts: `Outfit` (headings, `--font-outfit`) + `Plus Jakarta Sans` (body, `--font-jakarta`) via `next/font/google`. No Inter, no serif.
- Color tokens in `src/app/globals.css`: dusty rose primary, honey-yellow secondary, periwinkle-blue accent, warm blush background. Light-mode only (deliberate brand decision, no dark: variants anywhere in custom code).
- Motion: `motion/react` for scroll reveals (`src/components/motion/reveal.tsx`) and micro-interactions. No GSAP.
- Images: real nail-art photos from the Denailss Instagram (`@denailss_9`) — 6 full-res posts + 12 grid shots downloaded into `public/images/instagram/`. `src/lib/images.ts` exposes `imageUrl(seed)` which maps every mock seed name to these local assets (with a branded fallback); the old `picsum.photos` placeholder helper is gone, and `next.config.ts` has no remote image hosts.
- **Nail-art difficulty tiers** — every gallery design carries a studio-assigned `difficulty` (`easy | medium | complex | very-complex`, see `DesignDifficulty` in `src/types` and `DIFFICULTY_LABELS` in `src/features/gallery/constants.ts`). Customers never self-assess difficulty — they see the tier on cards, detail, and booking design step. Gallery has a "Kesulitan" filter. Note: since Epic 5, the tier no longer drives the price — each design carries a **custom owner-set `price`** (`GalleryDesign.price`, Rp per set).
- **Estimate pricing for nail art** — the Nail Art service carries a `priceNote` ("Estimasi, harga final sesuai desain & tingkat kesulitan — dikonfirmasi via WhatsApp"). Its price stays an estimate regardless of design selection; selecting a catalog design never changes the subtotal (design is a preference shown as info, not a price override). Fixed-price services (removal/manicure/pedicure/gel) are unaffected.
- **Fake-nail fulfillment step** — whenever Fake Nail (Press-On) is in the selected services (alone or with others), the booking flow replaces Tanggal/Waktu with a "Pengambilan" step (`StepPickup`, choices: ambil di lokasi / dikirim via kurir). The choice is stored on `BookingSelections.fulfillment` and shown in the booking summary and confirmation. Promo step is present for every service (not conditional).
- **Brand logo**: real logo assets in `public/images/` — `logo-icon.png` (portrait icon) and `logo-horizontal.png` (icon + wordmark). Used via `next/image` in the site header, site footer, customer portal header, and both backoffice sidebar + mobile drawer. No text/emoji "denailss" logos anywhere anymore.
- **Copywriting**: Removed all commercial "studio" terminology (changed to "nail art rumahan", "lokasi treatment", "operasional aktif") to accurately represent the home-based setting of the service.
- **Header Navigation**: Active link styling automatically highlights `/gallery`, `/services`, `/reviews`, and `/contact` menus based on dynamic path matching (supporting details like `/services/[slug]` or `/gallery/[slug]`).

### Routes built
- `/` — full landing page (`src/features/landing/components/*`): hero, featured designs, services bento, promotion banner, reviews, about, FAQ, Instagram grid, contact. Composed in `src/app/page.tsx`.
- **Instagram section** — real post photos, no embed iframe. Shortcodes live in `src/features/landing/data/instagram-posts.mock.ts`; the section renders square cards that pull each post's image through the `src/app/api/instagram/[shortcode]/route.ts` proxy (follows Instagram's public `/media/?size=l` 302 redirect, cached 24h) and link to the original post. No `next/image` optimization needed (already 1080×1080). Update by swapping shortcodes from new embed codes (post → ⋯ → Embed → Copy embed code).
- `/gallery` — masonry grid, search (judul/deskripsi), style/color/occasion/shape/**difficulty** filters, IntersectionObserver infinite scroll (`src/features/gallery/components/gallery-explorer.tsx`). Reads the **live admin catalog** via `GalleryDesignsProvider`.
- `/gallery/[slug]` — design detail with photo carousel, custom price, difficulty badge, related designs, booking CTA. **(Gap closed)** — now rendered from the live admin catalog via `DesignDetailView` (client, `useLiveGalleryDesigns`), so designs uploaded in the backoffice also get a real detail page (previously only seed designs had one; uploaded-only designs 404'd). `generateStaticParams` + per-design metadata still cover the seed for SEO/SSG; unknown slugs render a "Desain tidak ditemukan." state.
- `/services` — **New dedicated page** listing all treatments in a premium grid layout with custom category icons, pricing starting indicators, and packaging duration indicators for fake nails.
- `/services/[slug]` — service detail with price/duration, example results, FAQ.
- `/reviews` — **New dedicated page** containing overall rating cards, dynamic star distribution bars, and composite filters (rating stars and treatment types) for customer testimonials.
- `/contact` — **New dedicated page** featuring detailed address directions, integrated Google Maps iframe, contact channels (WhatsApp, Instagram, TikTok, Email), and feedback form.
- `/booking` — multi-step booking flow, the core deliverable (see below).
- `/backoffice` — dashboard for operational command, summary pulse metrics, manual deposit verifications. Also features the **Master Database of appointments** with text search, service/status filters, pagination, and interactive column sorting indicators.
- `/backoffice/calendar` — day, week, and month view scheduling calendar.
- `/backoffice/appointments/[id]` — appointment detail page with actions for confirming, completing, canceling, and rescheduling.
- `/backoffice/availability` — availability and operating rules editor.
- `/backoffice/promotions` — **New: promotion admin** (Epic 6), see below.
- `/backoffice/finance` — **New: finance dashboard** (Epic 7), see below.
- `/backoffice/finance/expenses/new` — **New: expense create/edit form** (Epic 7).
- `/backoffice/analytics` — **New: analytics overview** (Epic 8), see below.
- `/backoffice/services` — **New: service management** (see below).
- `/backoffice/instagram` — **New: Instagram grid management** (see below).
- `/backoffice/settings` — **New: settings workspace** (Epic 9), see below.

### Booking flow (`src/features/booking/`)
- **Tier-aware booking pricing** — customers now pick the difficulty tier (Simple/Complex) for tiered services right in the service step: an inline tier selector appears when a tiered service (Fake Nail, Nail Art) is selected. The subtotal, total, duration (slot availability), deposit, summary, and confirmation all use the chosen tier's price/duration. The tier label is stored on the appointment (`AppointmentService.tierLabel`) and surfaces in the booking summary, confirmation, and backoffice service-name labels (`serviceNamesLabel` renders "Nama (Tier)"). Selection lives in `BookingSelections.tierByServiceSlug`; flat services keep a single price and show no picker.
- Dynamic step list built from the selected services:
  - **Desain** appears only when the selection includes nail-art, fake-nail, or gel-extension (skipped for manicure/pedicure/removal-only bookings). The step lists the **live admin catalog** (via `useLiveGalleryDesigns`) — no service filtering, since any design can be applied to any eligible service (including press-on).
  - **Pengambilan** (fulfillment) appears when fake-nail is selected (even alongside other services); otherwise Tanggal/Waktu are used.
  - **Promo** is always present for every service combination; **Deposit** only when the selected service requires it.
  - Step index/max-reached are clamped for rendering when the step list changes (services toggled) so navigation never lands out of range.
- **Design and Promo steps are skippable** — `canProceed` defaults to `true` for both, so a customer can leave the design unselected and/or skip the promo code (both optional).
- **Confirmation requires a generated booking code** — the "Selesai" screen renders only once `bookingCode` is set, which happens in `goNext` when leaving the second-to-last step (format `DNL-YYYYMMDD-NNNN`).
- **Availability Engine** (`logic/availability.ts`) is real logic, not fake states: weekly template + per-date overrides + vacation ranges + blocked times + booking rules (window/notice/max-per-day/buffer), computed against seeded mock appointments (`data/appointments.mock.ts`). Produces per-day status (available/limited/full/closed/past/outside-window) and per-slot grouped Pagi/Siang/Malam availability.
- Pricing/discount/deposit math in `logic/pricing.ts`, validated against mock promotions with real rule checks (date window, min spend, applicable services, usage limit, max discount cap).
- Customer info step uses `react-hook-form` + `zod` (`validators/booking.schema.ts`).
- Booking selections live in `booking-flow.tsx` until submission; completed bookings are persisted through `POST /api/v1/bookings` and are no longer mirrored into a session-only fallback when the API fails.
- Deposit upload is a real file input with local preview (`URL.createObjectURL`), replace/remove, mocked "waiting verification" status. No actual upload to storage.

### Customer portal (`src/features/customer/`)
- Customer booking ownership is now API-backed: authenticated customer requests are scoped through `customers.user_id`, anonymous booking creation remains supported, and booking reads/updates are role-protected.
- Routes: Dashboard (`/customer`), History (`/customer/bookings`), Details (`/customer/bookings/[id]`), Favorites grid (`/customer/favorites`), and Profile edit form (`/customer/profile`). Dashboard, history, detail, profile, and portal identity now read persistent API data; favorites and reviews remain on mock/localStorage seams.
- **Customer review submission (FE-first)** — the "Beri Ulasan" dialog still persists through the reviews store (`addReview` → localStorage `denailss.reviews`) until the reviews API/storage slice is implemented.
- Responsive layout: standalone portal desktop sidebar nav + mobile bottom navigation tab bar.
- Global site header/footer context-aware hide logic on `/customer/*` routes.
- Fully Indonesian copy matching Denailss boutique studio brand guidelines.
- Dynamic key re-triggering for tab switches in `RevealGroup` to resolve viewport animation freeze.
- Spacing and color-calibrated button systems with solid backgrounds for action items.

### Backoffice Command Center (`src/features/appointment/` & `src/features/availability/`)
- **Multi-service appointments** — `Appointment` now carries `services: {slug, name}[]` (was a single `serviceSlug`/`serviceName`) plus optional `fulfillment` (`pickup` | `delivery`) for press-on orders. The add-booking form lets staff pick multiple services and choose a fulfillment method when fake-nail is selected. Dashboard, calendar, and detail views render joined service names + fulfillment label.
- **Booking persistence and backoffice sync** — completed bookings are created through `POST /api/v1/bookings`; `BackofficeProvider` hydrates persisted owner-visible appointments and sends status/reschedule/deposit mutations through the API. `bookings-store.ts` is no longer used as a booking-submit fallback.
- **Customer portal multi-service** — `CustomerBooking` uses the same `services` array + `fulfillment`; bookings list and detail render joined names + fulfillment.
- Unified Backoffice state context (`BackofficeProvider`) coordinates data updates reactively between dashboard list, calendar blocks, detail drawer, overrides lists, and booking rules inputs.
- Beautiful, non-generic boutique operating interface built on top of Outfit heading and Plus Jakarta Sans body typography, utilizing light blush card styling and deliberate primary accent coloring.
- Interactive calendar rendering day agenda lists, week columns, and month blocks, displaying closed templates, vacation ranges, and striped blocked periods. Supporting dynamic click-reschedule inline forms and drawer edits.
- Complete deposit verification screen to view proof receipts, reject with optional reasons, or approve deposit confirmation instantly.
- Availability setting manager allowing multi-session template editing, override entries, custom vacation range scheduling, and booking rule inputs.

### CRM (`src/features/crm/`)
- **Epic 4: Customer "little book"** — an FE-first internal CRM so the owner can recall every customer at a glance, built on the mock-first seam pattern.
- `/backoffice/customers` — customer list with header ("Kenali pelangganmu…"), live text search (nama/no. HP/email, phone digits normalized), segment filter pills (Semua / Pelanggan Baru / Pelanggan Berulang / Tidak Aktif). Desktop table (avatar, contact, visits, total spend, favorite service, last visit, status badge) and mobile compact cards, both row-click navigable to the detail page. Table supports **clickable column sorting** (pelanggan, kunjungan, total belanja, kunjungan terakhir, status) with `▲/▼/↕` indicators and **shared pagination (5/page)** driving both the desktop table and the mobile cards — mirroring the dashboard list via the `sortCustomers` pure helper. Gentle layout motion via `motion/react` (honors `prefers-reduced-motion`).
- `/backoffice/customers/[id]` — profile view: identity header (avatar, since-date, contact, status), WhatsApp chat shortcut (`waCustomerLink`), "Tambah Booking" CTA, next-appointment highlight card, 4-stat summary band (total visits, total spending, favorite service/design, last visit + relative time), then a left/right grid of Notebook notes, tabbed History (`Riwayat` / `Pembatalan` / `Ulasan` with counts), and a "Kesukaan & Ciri Khas" preferences card (favorite design photo linked to `/gallery/[slug]`, preferred time-of-day, color swatches, nail shapes).
- **Data & logic** (`types.ts`, `logic/customer-stats.ts`, `data/customers.mock.ts`): 10 varied customers (new/repeat/inactive, cancellations, reviews, notes, favorite designs, press-on orders, different spending). `computeCustomerStats` derives total visits/spending, favorite service+design (most-frequent), last visit, and next upcoming appointment from each customer's appointments — nothing hardcoded. `getCustomerStatus` (new/active/inactive) and `getCustomerSegment` (new/repeat/inactive) pure derivations. Simulated "today" is `CRM_TODAY = "2026-08-09"`.
- History cross-links into existing backoffice appointment details (`/backoffice/appointments/[id]`) where the booking exists, and into the gallery; review photos reuse the Instagram seed map.
- Notes editor persists per-customer to `localStorage` (`denailss.crm.notes.<id>`), seed fallback = customer's mock notes; save is confirmed with a toast.
- Wired up: "Pelanggan" (`UsersThree`) nav item in desktop sidebar + mobile sheet; page title maps to "Buku Pelanggan".


### Gallery Management admin (`src/features/gallery/`) — Epic 5
- `/backoffice/gallery` — "Kelola Katalog" admin: summary stats (total desain, kesulitan tinggi), search, style/color/occasion/shape/difficulty filters, A-Z sort on title, pagination, desktop table + mobile cards. Create/edit via a dialog form; delete with confirmation toast.
- **Upload-only photo flow** — a design's photos come **only** from owner uploads (no picking from the Instagram seed set). Upload hits `POST /api/upload` (saves to `public/images/uploads/`, gitignored, max 6 MB image); the seed is stored as `upload:<filename>` and `imageUrl()` resolves it to `/images/uploads/<file>`. Photos render as a compact thumbnail grid with **drag-and-drop reordering** (first photo = "Utama" = the cover used everywhere) and **click-to-preview lightbox** (with delete inside preview).
- **Custom price per design** — the form has a free-text "Harga (Rp)" input (required, > 0) instead of a difficulty-derived price. `GalleryDesign.price` replaces the old `priceFrom`; the seed keeps its old tier values as `price`. Price shows on the gallery card (badge, top-left) and the design detail page ("Rp X · per set, 10 jari"). `formatIDR` guards non-finite values (renders "—"). A migration in `gallery-admin.mock.ts` backfills `price` for designs persisted before the field existed (falls back to legacy `priceFrom` or the tier default).
- **Live catalog wiring** — `GalleryDesignsProvider` (client) + `useLiveGalleryDesigns()` makes the localStorage-backed admin catalog available to the public surfaces: `/gallery` explorer, `/booking` design step, and landing featured designs all render the owner's current catalog (seed as SSR fallback), so admin add/edit/delete shows up live in the customer flow. `gallery-admin.mock.ts` is the swap seam for a real repository; `GALLERY_DESIGNS` in `designs.mock.ts` is now documented as the seed only.
- **Removed at the owner's request**: tags (search uses title + description), published date (no date-driven sorting anywhere), the "reset catalog" action, **related services** (`relatedServiceSlugs` dropped from the type; `/gallery/[slug]` no longer shows "Layanan terkait" and books via `/booking?design=...` directly; `/services/[slug]` no longer lists example designs), and the difficulty-derived price tier.


### Promotion admin (`src/features/promotion/`) — Epic 6
- **One source of truth for promotions.** The booking flow and landing banner now read promotions through `src/features/promotion/data/promotion-booking.ts`, which delegates to the same localStorage-backed store the admin edits (`promotions.mock.ts`). Discount math stays in `booking/logic/pricing.ts` (`checkPromotion`) — admin rules and booking validation can never drift apart. A promo created in the backoffice is immediately usable in `/booking` and shown on the landing banner.
- **Store split for SSR safety** — seed data lives in the plain module `data/promotions.seed.ts` (no `"use client"`), so the server-rendered detail page can read it; the client store `data/promotions.mock.ts` (`denailss.promotion.admin` in localStorage) imports the seed as fallback until the first edit. Same seam pattern as the gallery admin store.
- **No delete feature, by design** — deactivating a promo already blocks new usage while keeping its usage history (`usedCount`) for future finance reporting. A `deletePromotion` helper was written during the epic then removed as dead code; the detail page only offers Aktifkan/Nonaktifkan + Edit.
- `/backoffice/promotions` — "Promosi" list: subtle status chips (Aktif / Terjadwal / Berakhir / Nonaktif, derived via `getPromotionStatus` against the seeded "today" 2026-08-09), status filter pills + title/code search, compact summary band (aktif + terjadwal counts), desktop table and mobile cards, one primary action **Buat Promo**. Rows navigate to the detail page.
- `/backoffice/promotions/new` — focused single-page create form: Informasi Dasar (title, description, normalized uppercase promo code with a Generate action), Diskon (persen vs nominal toggle, maks. diskon only for percentages), Periode (start/end date with cross-validation "Tanggal berakhir harus setelah tanggal mulai."), Batasan Pemakaian (empty = unlimited), Aturan (minimum transaksi + applicable services from `SERVICES`, all services when none selected). Indonesian validation messages; **live preview card** (`promotion-live-preview.tsx`) updates as the form changes and shows the exact customer-facing treatment. Save persists to localStorage and routes to the detail page.
- `/backoffice/promotions/[id]` — detail: status header, Aktifkan/Nonaktifkan with a concise confirmation dialog, Edit mode reusing the same form (keeps `usedCount` — no destructive reset), Penawaran/Aturan/Info Pemakaian sections, and a "Tampilan untuk customer" card. Server-rendered from the seed with a not-found state.
- Mock seeds cover every state (active, scheduled, expired, inactive) and configuration (percentage + fixed, max discount, min spend, service-scoped, usage-limited and unlimited): `WEEKEND20`, `NEWSET30`, `PROMO17`, `PAGI20`, `HARITANI`, `MAYDAY10`, `NEWCLIENT`.
- Wired up: "Promosi" (`TicketIcon`) nav item in desktop sidebar + mobile sheet; header title maps to "Promosi".

### Finance (`src/features/finance/`) — Epic 7
- **Simple business bookkeeping, FE-first on mocks.** Not accounting software: no tax, invoices, payroll, AR/AP, double-entry, forecasting, or AI insights. Income derives from completed appointments; expenses are owner-recorded; profit = income - expense.
- `/backoffice/finance` — "Keuangan" dashboard: period selector (prev/next month + native month picker), a balanced **financial summary** (Pemasukan / Pengeluaran / Profit with a visible relationship and a "+N% vs bulan lalu" comparison when the previous month's profit is non-zero), income list (date, customer, service, appointment time, amount — derived from `status: "completed"` appointments only), expense list (add/edit/delete with a concise confirmation dialog), a **monthly report** (income, expense, profit, completed appointments, average transaction), and one minimal dependency-free SVG **trend chart** (income/expense/profit over 6 months).
- `/backoffice/finance/expenses/new` — create + edit in one route (`?edit=<id>`); fields: deskripsi, nominal (Rp), kategori (supplies/equipment/studio/marketing/other), tanggal, catatan. Indonesian validation messages ("Nominal harus lebih besar dari Rp0."), no technical errors. Wrapped in a Suspense boundary (the page reads `useSearchParams`).
- **Data & logic** (`types/index.ts`, `data/expenses.mock.ts`, `data/finance-appointments.mock.ts`, `logic/finance.ts`, `validators/expense.schema.ts`): income is never stored — `getAllAppointments()` merges the live backoffice appointments (deduped by id) with a historical `FINANCE_SEED_APPOINTMENTS` (June/July/August 2026 completed appointments reusing existing services/prices) so monthly navigation and the month-over-month comparison feel real. `getMonthlyIncomeEntries` / `calculateMonthlyExpense` / `getMonthlyReport` / `getRecentMonthTrend` / `profitChangeVsPreviousMonth` are pure functions. Expenses persist to localStorage (`denailss.finance.expenses`), seed fallback = 13 realistic entries across June-August.
- **Empty states**: "Belum ada pengeluaran bulan ini." + "Catat pengeluaran kecil sekalipun supaya profitmu tetap akurat."; "Belum ada pemasukan bulan ini." Motion kept to the month label transition in the period selector (`motion/react`, honors `prefers-reduced-motion`).
- Wired up: "Keuangan" (`WalletIcon`) nav item in desktop sidebar + mobile sheet; header title maps to "Keuangan".

### Analytics (`src/features/analytics/`) — Epic 8
- `/backoffice/analytics` — "Analytics" business overview answering "apa yang sebenarnya terjadi di bisnis Denailss?". Period selector with five presets (7 Hari / 30 Hari / 3 Bulan / 6 Bulan / 1 Tahun) as a segmented pill control (spring layout animation, honors `prefers-reduced-motion`, horizontally scrollable on mobile). All metrics update with the period.
- **Sections**: Pemasukan (total + one minimal dependency-free SVG revenue area chart), Ringkasan Booking (total/selesai/dibatalkan/no-show counts), Kesehatan Booking (cancellation rate and no-show rate **computed separately**, never combined), Customer Berulang (unique customers, repeat customers, repeat rate — repeat = more than one completed appointment in the period), Layanan Terpopuler (horizontal ranking bars), Desain Terpopuler (ranked list with real gallery thumbnails), Jam Booking Favorit (Pagi/Siang/Malam bars reusing the availability engine's time-of-day definitions + most popular slot), and one Tren Booking chart (daily/weekly/monthly buckets sized to the period).
- **Data consistency is guaranteed by construction**: analytics reads `getAllAnalyticsAppointments()` (in `data/appointments-analytics.mock.ts`) which merges the live backoffice list + the Finance seed (Epic 7) + an analytics-only seed, deduped by id — so a completed appointment produces exactly one income row in Finance and one revenue figure here, and a cancelled appointment is the same event in both. No separate analytics dataset, no duplicated domain models.
- **Logic** (`logic/analytics.ts`): pure deterministic functions — `calculateRevenue`, `getRevenueTrend`, `calculateBookingStats`, `calculateCancellationRate`, `calculateNoShowRate`, `calculateRepeatCustomerRate`, `getPopularServices`, `getPopularDesigns`, `getPeakBookingTimes`, `getBookingTrend`. Reference "today" is the same mock anchor as the backoffice/CRM seeds (2026-08-09) so period boundaries are stable. No AI insights, no forecasting, no invented benchmarks.
- **Mock data**: `data/appointments-analytics.mock.ts` adds ~32 records (cancellations, no-shows, and 2nd+ completed visits for repeat customers across May-August 2026) reusing existing services/designs/prices/customers; `data/designs-analytics.mock.ts` resolves design slugs through the shared gallery seed so popular-design thumbnails always exist (unknown/uploaded-only slugs are skipped).
- **Empty states** for every metric ("Belum ada booking untuk periode ini.", "Belum ada pemasukan pada periode ini.", "Belum ada customer yang melakukan kunjungan kedua.", "Belum cukup data untuk melihat desain terpopuler.") — never a fake zero-looking chart.
- Charts are minimal SVG with `<title>` hover/touch tooltips and accessible `aria-label` summaries; sections mix card figures with plain typographic content blocks (no KPI card wall). Motion limited to the period pill transition (`motion/react`).
- Wired up: "Analytics" (`ChartLineUpIcon`) nav item in desktop sidebar + mobile sheet; header title maps to "Analytics".

### Service management (`src/features/services/`)
- `/backoffice/services` — "Kelola Layanan": owner **edits and (de)activates** the treatment catalog that drives the public `/services` pages, the booking service step, review filters, and promotion rules. No add and no delete by design — a service is deactivated instead, keeping its context for existing appointments/history.
- **No category field** — removed from `Service`; each service is identified by slug. The fake-nail fulfillment behavior is now an explicit `requiresPickup` flag (replaces the old `category === "fake-nail"` checks) so the booking flow's pickup/delivery step stays correct.
- **Difficulty tiers** — `Service.tiers: ServiceTier[]` (label + harga mulai + durasi per tingkat). Fake Nail and Nail Art are seeded tiered (Simple/Complex); other services stay flat. The edit form has a "Bertingkat sesuai tingkat kesulitan" toggle that swaps price/duration inputs for a per-tier editor; the admin list shows a "Tingkat" column (Simple/Complex or "Flat"); public surfaces show "Mulai RpX · sesuai tingkat kesulitan" plus a per-tier price/duration legend (card, detail tier table, booking step).
- **Form** (`service-form.tsx`): edit-only dialog (nama, deskripsi singkat + lengkap, harga/durasi flat or bertingkat, catatan harga, foto utama via `/api/upload`, FAQ rows, "wajib deposit" + "pengerjaan dikirim" toggles); slug is fixed.
- **List** (`service-admin-list-view.tsx`): summary band (total layanan + layanan aktif), search + status filter pills (Semua/Aktif/Nonaktif), desktop table + mobile cards with status badge, pagination (TRD backoffice standard), row actions Edit + Nonaktifkan/Aktifkan (with toast).
- **`Service.active` flag** — public consumers read `getActiveServices()` (services list page, landing tiles, booking service step, review filters/pills, promo applicability pickers) so a deactivated service disappears from booking and the site; the backoffice add-booking form keeps showing all services for historical appointments, and the service detail page still resolves by slug (old links keep working) but shows a "Layanan ini sedang nonaktif" notice and a disabled booking CTA. Persisted records are migrated (`active` defaults to true; legacy `tiers`/`requiresPickup` backfilled, fake-nail defaults to pickup).
- **Live seam** — `data/services-admin.mock.ts` (`denailss.services.admin` in localStorage) is the source of truth (`getLiveServices` / `getActiveServices` / `updateService` / `setActiveService`); seed stays in `services.seed.ts` for the swap-in seam. Shared display helpers in `logic/service.ts` (`serviceMinPrice`, `servicePriceLine`).
- Wired up: "Layanan" (`SparkleIcon`) nav item in desktop sidebar + mobile sheet; header title maps to "Kelola Layanan".

### Instagram grid management (`src/features/landing/`)
- `/backoffice/instagram` — "Grid Instagram": the owner pastes a post URL or embed code (post → ⋯ → Embed → Copy embed code); `parseInstagramShortcode` extracts the shortcode from URLs, `/reel/` links, raw embed HTML (incl. `data-instgrm-permalink`), or a bare shortcode. Added posts render immediately in the landing grid via the existing `/api/instagram/[shortcode]` proxy, with a "Shortcode terdeteksi / Link tidak dikenali" inline hint, per-card delete, and an empty state.
- **Live seam** — `data/instagram-posts.mock.ts` is now the admin store (`denailss.instagram.posts` in localStorage, seed fallback, subscribe support); `getLiveInstagramPosts()` is SSR-safe. The landing `InstagramFeed` reads it, so owner edits show up live.
- Wired up: "Grid Instagram" (`InstagramLogoIcon`) nav item in desktop sidebar + mobile sheet; header title maps to "Grid Instagram".

### SEO polish (TRD §9 NFR)
- **JSON-LD structured data** — `src/lib/seo.tsx` builds `LocalBusiness` (NailSalon/BeautySalon with geo, address, sameAs, priceRange), `WebSite`, `FAQPage` (landing FAQ + per-service FAQs, copy extracted to `src/features/landing/data/faq.mock.ts` so UI and structured data never drift), `Service` + `BreadcrumbList` on service details, and `BreadcrumbList` on gallery design details. All payloads escape `<` (`\u003c`) against XSS.
- **Sitemap** — `src/app/sitemap.ts` (`/sitemap.xml`): 6 static public routes + all service and gallery-design detail routes from the seed catalogs, with priority/change-frequency. Backoffice/customer excluded.
- **robots.txt** — `src/app/robots.ts`: public site crawlable; `/backoffice`, `/customer`, `/api/` disallowed; sitemap advertised.
- **Metadata** — root layout now ships OpenGraph + Twitter image (logo-horizontal), `metadataBase` canonical base, and `robots: index/follow`. Every public page has `alternates.canonical`; gallery-design and service detail pages get per-item canonical, `og:type: article`, and a real photo as `og:image`.
- Future integration note: values in `seo.tsx` still read from `@/constants/site`; they can flow from the Settings model after the Settings repository/API migration is completed.

### Settings (`src/features/settings/`) — Epic 9
- `/backoffice/settings` — "Pengaturan": a single focused workspace, not a settings maze. Compact header ("Atur informasi dan kebijakan yang digunakan Denailss."), no KPI cards. Three quiet sections: **Profil Bisnis** (nama bisnis required, logo, deskripsi, alamat), **Social Media** (Instagram, TikTok, WhatsApp), **Kebijakan** (kebijakan pembatalan + kebijakan deposit as informational policy text — NOT the deposit calculation engine, which stays in the booking flow).
- **Logo** — local preview only: `URL.createObjectURL` (cleaned up on replace/remove), "Belum ada logo" empty state, accessible file input. No upload, no fake logo.
- **Mock seam** — `data/settings.mock.ts` persists to localStorage (`denailss.settings`), seed fallback derived from the single-source business constants (`SITE` in `@/constants/site`) and `DEPOSIT_CONFIG.notes`, so no duplicate hardcoded values. Swap for a real settings repository later without touching the UI.
- **Validation** — `validators/settings.ts` manual checks with Indonesian messages ("Nama bisnis wajib diisi."); social values validated lightly (username/URL plausible, WhatsApp format reasonable) so the owner never fights the form. `logic/normalize.ts` strips `@`/trailing slashes and phone noise on save.
- **Save** — one primary "Simpan Perubahan" action; success toast "Pengaturan berhasil disimpan." plus a transient inline saved state in the save bar (motion, honors `prefers-reduced-motion`). Unsaved-changes guard via `beforeunload` only (no router interception).
- **Empty states** — "Belum ada logo", "Tambahkan deskripsi singkat tentang Denailss.", "Belum diatur" (social), "Belum ada kebijakan." — no broken links or undefined values.
- Wired up: "Pengaturan" (`GearIcon`) nav item in desktop sidebar + mobile sheet; header title maps to "Pengaturan".

### Verified working
- Full booking happy path through the current frontend flow, including promo code + deposit upload preview + confirmation.
- Supabase Google OAuth, email/password auth, email confirmation callback, resend confirmation, logout confirmation modal, and safe route redirects.
- Supabase Auth profile linkage, two-role owner/customer guards, RLS migration, and explicit owner promotion flow.
- Authenticated booking ownership: guest creation remains supported; customer booking reads are scoped to `customers.user_id`; owner booking mutations are protected.
- Customer dashboard, booking history/detail, profile update, and portal identity read persistent API data.
- Availability engine renders correct limited/full/closed days matching the seeded mock config.
- Back-navigation preserves all selections; mobile viewport retains the sticky bottom summary bar and responsive navigation.
- `next build`, `tsc --noEmit`, and `git diff --check` pass. ESLint has no errors; existing unused-import/hook warnings remain.

### Known fixed bug (don't reintroduce)
`zodResolver` validation in `step-customer-info.tsx` is async. `formRef.current.submit()` must be `async` and awaited in `booking-flow.tsx`'s `goNext`, or the "Lanjut" button silently blocks progression on the first click after filling the form (reads stale `false` before the validation promise resolves).

---

## What's Next

1. **Seed the live catalog and availability data** — replace the placeholder `supabase/seed.sql` with current services, gallery metadata/images, availability templates, overrides, and blocked times.
2. **Complete persistent Storage** — move gallery, review, deposit proof, and settings-logo uploads from local disk/object URLs to Supabase Storage with ownership, MIME/size validation, and metadata records.
3. **Migrate remaining mock domains** — services/gallery admin catalogs, promotions, settings, reviews, favorites, CRM, finance, and analytics, preserving existing component contracts and pure business logic.
4. **Strengthen booking validation** — move availability rules/promotions/deposit configuration behind persisted repositories and add transaction-level slot conflict checks.
5. **Expand tests** — API auth/ownership tests, RLS verification, booking recalculation/conflict tests, upload validation, and E2E refresh/persistence coverage.

Implemented backend/auth paths live under `src/db/`, `src/lib/supabase/`, `src/features/booking/services/`, `src/features/customer/services/`, `src/features/booking/schemas/`, and `src/app/api/v1/`. Remaining `*.mock.ts` files under `src/features/*/data/` are named seams for the next migrations.

## File Map (where to look)

```
src/features/<domain>/
  components/   UI for that domain
  data/         *.mock.ts — swap-for-real-backend seam
  logic/        pure business logic (booking only, so far)
  validators/   zod schemas (booking only, so far)
src/components/ui/     shadcn primitives (Base UI, not Radix — see note above)
src/components/layout/ site-header, site-footer
src/lib/                cn, format (IDR/date), images (imageUrl seed→asset map)
src/constants/site.ts   business profile, single source for contact info
```
