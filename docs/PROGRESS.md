# Implementation Progress

**Last updated:** 2026-08-09
**Purpose:** Running memory of what's built, how it's built, and what's next. Read this before starting new work; update it when scope changes.

---

## Current Phase

Epic 1, 2, and 3 are implemented. Supabase/Drizzle/Route Handlers/Server Actions from the TRD do not exist yet — everything runs against local mock data in `*.mock.ts` files, with client-side state hooks (BackofficeProvider) managing dashboard, calendar, and availability configuration.

**Backend wiring and Auth are deliberately skipped for now.** In-progress decision: this period is FE-first. All new work is built against mock data (extending the existing `*.mock.ts` seam pattern so it can be swapped for a real repository layer later without touching components). No Supabase project, no Drizzle schema, no `/api/v1/*` route handlers will be created until FE scope is further along.

Epics 4-9 (CRM, Gallery Management admin, Promotion admin, Finance, Analytics, Settings) are **not started**; when they are, they will also be built FE-first on mocks.

---

## What's Done

### Design system
- Next.js 16 (App Router, Turbopack), TypeScript strict, Tailwind v4.
- shadcn/ui on **Base UI** (not Radix) — this shadcn install uses `@base-ui/react`. Key difference from the Radix-flavored docs most training data assumes: **no `asChild` prop**. Composition uses `render={<Link href="..." />}` instead, and native-button components need `nativeButton={false}` when rendered as a link/anchor (see `src/components/layout/site-header.tsx` for the pattern). `components.json` still says `iconLibrary: "lucide"` (unused metadata, harmless) — actual icons are `@phosphor-icons/react`, lucide-react was uninstalled.
- Fonts: `Outfit` (headings, `--font-outfit`) + `Plus Jakarta Sans` (body, `--font-jakarta`) via `next/font/google`. No Inter, no serif.
- Color tokens in `src/app/globals.css`: dusty rose primary, honey-yellow secondary, periwinkle-blue accent, warm blush background. Light-mode only (deliberate brand decision, no dark: variants anywhere in custom code).
- Motion: `motion/react` for scroll reveals (`src/components/motion/reveal.tsx`) and micro-interactions. No GSAP.
- Images: real nail-art photos from the Denailss Instagram (`@denailss_9`) — 6 full-res posts + 12 grid shots downloaded into `public/images/instagram/`. `src/lib/images.ts` exposes `imageUrl(seed)` which maps every mock seed name to these local assets (with a branded fallback); the old `picsum.photos` placeholder helper is gone, and `next.config.ts` has no remote image hosts.
- **Nail-art difficulty tiers** — every gallery design carries a studio-assigned `difficulty` (`easy | medium | complex | very-complex`, see `DesignDifficulty` in `src/types` and `DIFFICULTY_LABELS`/`DIFFICULTY_PRICES` in `src/features/gallery/constants.ts`). The tier drives the design's `priceFrom` (Rp100k/140k/190k/240k per set), so customers never self-assess difficulty — they see the tier + price on cards, detail, and booking summary. Gallery has a "Kesulitan" filter.
- **Estimate pricing for nail art** — the Nail Art service carries a `priceNote` ("Estimasi, harga final sesuai desain & tingkat kesulitan — dikonfirmasi via WhatsApp"). Its price stays an estimate regardless of design selection; selecting a catalog design never changes the subtotal (design is a preference shown as info, not a price override). Fixed-price services (removal/manicure/pedicure/gel) are unaffected.
- **Fake-nail fulfillment step** — whenever Fake Nail (Press-On) is in the selected services (alone or with others), the booking flow replaces Tanggal/Waktu with a "Pengambilan" step (`StepPickup`, choices: ambil di lokasi / dikirim via kurir). The choice is stored on `BookingSelections.fulfillment` and shown in the booking summary and confirmation. Promo step is present for every service (not conditional).
- **Brand logo**: real logo assets in `public/images/` — `logo-icon.png` (portrait icon) and `logo-horizontal.png` (icon + wordmark). Used via `next/image` in the site header, site footer, customer portal header, and both backoffice sidebar + mobile drawer. No text/emoji "denailss" logos anywhere anymore.
- **Copywriting**: Removed all commercial "studio" terminology (changed to "nail art rumahan", "lokasi treatment", "operasional aktif") to accurately represent the home-based setting of the service.
- **Header Navigation**: Active link styling automatically highlights `/gallery`, `/services`, `/reviews`, and `/contact` menus based on dynamic path matching (supporting details like `/services/[slug]` or `/gallery/[slug]`).

### Routes built
- `/` — full landing page (`src/features/landing/components/*`): hero, featured designs, services bento, promotion banner, reviews, about, FAQ, Instagram grid, contact. Composed in `src/app/page.tsx`.
- **Instagram section** — real post photos, no embed iframe. Shortcodes live in `src/features/landing/data/instagram-posts.mock.ts`; the section renders square cards that pull each post's image through the `src/app/api/instagram/[shortcode]/route.ts` proxy (follows Instagram's public `/media/?size=l` 302 redirect, cached 24h) and link to the original post. No `next/image` optimization needed (already 1080×1080). Update by swapping shortcodes from new embed codes (post → ⋯ → Embed → Copy embed code).
- `/gallery` — masonry grid, search, style/color/occasion/shape/**difficulty** filters, price range, IntersectionObserver infinite scroll (`src/features/gallery/components/gallery-explorer.tsx`).
- `/gallery/[slug]` — design detail with photo carousel, related services, related designs. Shows difficulty badge + price derived from the tier.
- `/services` — **New dedicated page** listing all treatments in a premium grid layout with custom category icons, pricing starting indicators, and packaging duration indicators for fake nails.
- `/services/[slug]` — service detail with price/duration, example results, FAQ.
- `/reviews` — **New dedicated page** containing overall rating cards, dynamic star distribution bars, and composite filters (rating stars and treatment types) for customer testimonials.
- `/contact` — **New dedicated page** featuring detailed address directions, integrated Google Maps iframe, contact channels (WhatsApp, Instagram, TikTok, Email), and feedback form.
- `/booking` — multi-step booking flow, the core deliverable (see below).
- `/backoffice` — dashboard for operational command, summary pulse metrics, manual deposit verifications. Also features the **Master Database of appointments** with text search, service/status filters, pagination, and interactive column sorting indicators.
- `/backoffice/calendar` — day, week, and month view scheduling calendar.
- `/backoffice/appointments/[id]` — appointment detail page with actions for confirming, completing, canceling, and rescheduling.
- `/backoffice/availability` — availability and operating rules editor.

### Booking flow (`src/features/booking/`)
- Dynamic step list built from the selected services:
  - **Desain** appears only when the selection includes nail-art, fake-nail, or gel-extension (skipped for manicure/pedicure/removal-only bookings). The step lists the full gallery catalog — no `relatedServiceSlugs` filtering — since any design can be applied to any eligible service (including press-on).
  - **Pengambilan** (fulfillment) appears when fake-nail is selected (even alongside other services); otherwise Tanggal/Waktu are used.
  - **Promo** is always present for every service combination; **Deposit** only when the selected service requires it.
  - Step index/max-reached are clamped for rendering when the step list changes (services toggled) so navigation never lands out of range.
- **Availability Engine** (`logic/availability.ts`) is real logic, not fake states: weekly template + per-date overrides + vacation ranges + blocked times + booking rules (window/notice/max-per-day/buffer), computed against seeded mock appointments (`data/appointments.mock.ts`). Produces per-day status (available/limited/full/closed/past/outside-window) and per-slot grouped Pagi/Siang/Malam availability.
- Pricing/discount/deposit math in `logic/pricing.ts`, validated against mock promotions with real rule checks (date window, min spend, applicable services, usage limit, max discount cap).
- Customer info step uses `react-hook-form` + `zod` (`validators/booking.schema.ts`).
- State lives entirely in `booking-flow.tsx` (client component); no persistence across refresh.
- Deposit upload is a real file input with local preview (`URL.createObjectURL`), replace/remove, mocked "waiting verification" status. No actual upload to storage.

### Customer portal (`src/features/customer/`)
- Routes: Dashboard (`/customer`), History (`/customer/bookings`), Details (`/customer/bookings/[id]`), Favorites grid (`/customer/favorites`), and Profile edit form (`/customer/profile`).
- Responsive layout: standalone portal desktop sidebar nav + mobile bottom navigation tab bar.
- Global site header/footer context-aware hide logic on `/customer/*` routes.
- Fully Indonesian copy matching Denailss boutique studio brand guidelines.
- Dynamic key re-triggering for tab switches in `RevealGroup` to resolve viewport animation freeze.
- Spacing and color-calibrated button systems with solid backgrounds for action items.

### Backoffice Command Center (`src/features/appointment/` & `src/features/availability/`)
- Unified Backoffice state context (`BackofficeProvider`) coordinates data updates reactively between dashboard list, calendar blocks, detail drawer, overrides lists, and booking rules inputs.
- Beautiful, non-generic boutique operating interface built on top of Outfit heading and Plus Jakarta Sans body typography, utilizing light blush card styling and deliberate primary accent coloring.
- Interactive calendar rendering day agenda lists, week columns, and month blocks, displaying closed templates, vacation ranges, and striped blocked periods. Supporting dynamic click-reschedule inline forms and drawer edits.
- Complete deposit verification screen to view proof receipts, reject with optional reasons, or approve deposit confirmation instantly.
- Availability setting manager allowing multi-session template editing, override entries, custom vacation range scheduling, and booking rule inputs.


### Verified working (via Playwright, this session)
- Full booking happy path end-to-end including promo code + deposit upload + confirmation.
- Availability engine renders correct limited/full/closed days matching the seeded mock config.
- Back-navigation preserves all selections.
- Mobile viewport: sticky bottom summary bar + sheet, hamburger nav, no console errors.
- `next build`, `tsc --noEmit`, `eslint` all clean.

### Known fixed bug (don't reintroduce)
`zodResolver` validation in `step-customer-info.tsx` is async. `formRef.current.submit()` must be `async` and awaited in `booking-flow.tsx`'s `goNext`, or the "Lanjut" button silently blocks progression on the first click after filling the form (reads stale `false` before the validation promise resolves).

---

## What's Next (not started)

FE-first only. Backend wiring and Auth are out of scope for now (see Current Phase).

1. **Epics 4-9, built FE-first on mocks** — CRM, Gallery Management (admin CRUD replacing the static mock array), Promotion admin, Finance, Analytics, Settings (Backoffice). Each still goes through `src/features/*/data/*.mock.ts` seams, extending the mock-first pattern already used for Epics 1-3.
2. **SEO polish** — sitemap.xml, robots.txt, JSON-LD structured data (LocalBusiness/Service), per TRD §9 non-functional requirements. Metadata/OG tags exist per-page already; structured data does not.
3. **Deferred (post-FE period)** — Backend wiring (Supabase project, Drizzle schema matching TRD §4 entity list, Route Handlers under `/api/v1/*` per TRD §5 REST conventions) and Auth (Supabase Auth, email + Google-ready). Every `*.mock.ts` file under `src/features/*/data/` is a named seam for that swap.

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
