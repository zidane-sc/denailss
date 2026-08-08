# Implementation Progress

**Last updated:** 2026-08-09
**Purpose:** Running memory of what's built, how it's built, and what's next. Read this before starting new work; update it when scope changes.

---

## Current Phase

**Epic 1 — Public Website, frontend only.** No backend is wired up. Supabase/Drizzle/Route Handlers/Server Actions from the TRD do not exist yet — everything runs against local mock data in `*.mock.ts` files. Booking submission, deposit upload, and promo validation are simulated client-side (no persistence; state resets on refresh).

Epics 2-9 (Customer Portal, Appointment Management backoffice, CRM, Gallery Management admin, Promotion admin, Finance, Analytics, Settings) are **not started**.

---

## What's Done

### Design system
- Next.js 16 (App Router, Turbopack), TypeScript strict, Tailwind v4.
- shadcn/ui on **Base UI** (not Radix) — this shadcn install uses `@base-ui/react`. Key difference from the Radix-flavored docs most training data assumes: **no `asChild` prop**. Composition uses `render={<Link href="..." />}` instead, and native-button components need `nativeButton={false}` when rendered as a link/anchor (see `src/components/layout/site-header.tsx` for the pattern). `components.json` still says `iconLibrary: "lucide"` (unused metadata, harmless) — actual icons are `@phosphor-icons/react`, lucide-react was uninstalled.
- Fonts: `Outfit` (headings, `--font-outfit`) + `Plus Jakarta Sans` (body, `--font-jakarta`) via `next/font/google`. No Inter, no serif.
- Color tokens in `src/app/globals.css`: dusty rose primary, honey-yellow secondary, periwinkle-blue accent, warm blush background. Light-mode only (deliberate brand decision, no dark: variants anywhere in custom code).
- Motion: `motion/react` for scroll reveals (`src/components/motion/reveal.tsx`) and micro-interactions. No GSAP.
- Images: all placeholder via `picsum.photos/seed/...` (see `src/lib/images.ts`). No real studio photography yet.

### Routes built
- `/` — full landing page (`src/features/landing/components/*`): hero, featured designs, services bento, promotion banner, reviews, about, FAQ, Instagram grid, contact. Composed in `src/app/page.tsx`.
- `/gallery` — masonry grid, search, style/color/occasion/shape filters, price range, IntersectionObserver infinite scroll (`src/features/gallery/components/gallery-explorer.tsx`).
- `/gallery/[slug]` — design detail with photo carousel, related services, related designs.
- `/services/[slug]` — service detail with price/duration, example results, FAQ.
- `/booking` — multi-step booking flow, the core deliverable (see below).

### Booking flow (`src/features/booking/`)
- Dynamic step list: Layanan → Desain (optional) → Tanggal → Waktu → Data Diri → Promo (optional) → Deposit (**only if** the selected service's `depositApplicable` is true and the global mock deposit config is enabled) → Confirmation.
- **Availability Engine** (`logic/availability.ts`) is real logic, not fake states: weekly template + per-date overrides + vacation ranges + blocked times + booking rules (window/notice/max-per-day/buffer), computed against seeded mock appointments (`data/appointments.mock.ts`). Produces per-day status (available/limited/full/closed/past/outside-window) and per-slot grouped Pagi/Siang/Malam availability.
- Pricing/discount/deposit math in `logic/pricing.ts`, validated against mock promotions with real rule checks (date window, min spend, applicable services, usage limit, max discount cap).
- Customer info step uses `react-hook-form` + `zod` (`validators/booking.schema.ts`).
- State lives entirely in `booking-flow.tsx` (client component); no persistence across refresh.
- Deposit upload is a real file input with local preview (`URL.createObjectURL`), replace/remove, mocked "waiting verification" status. No actual upload to storage.

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

Roughly in the order the TRD implies:

1. **Backend wiring** — Supabase project, Drizzle schema matching TRD §4 entity list, Route Handlers under `/api/v1/*` per TRD §5 REST conventions. This is the biggest gap: every `*.mock.ts` file under `src/features/*/data/` is a named seam meant to be swapped for a real repository call without touching components.
2. **Auth** — Supabase Auth (email + Google-ready). Needed before Epic 2.
3. **Epic 2 — Customer Portal**: dashboard, booking history, favorite designs, deposit proof status view, profile, post-visit reviews. Explicitly out of scope for the current build.
4. **Epic 3 — Appointment Management backoffice**: calendar (day/week/month, drag-drop, reschedule), the owner-side availability configuration UI (the engine already exists on the read side; there's no admin UI to edit weekly templates/overrides/vacations yet), manual deposit verification (approve/reject).
5. **Epic 4-9**: CRM, Gallery Management (admin CRUD replacing the static mock array), Promotion admin, Finance, Analytics, Settings.
6. **Real imagery** — replace all `picsum.photos` placeholders with actual studio photography once available (user explicitly chose placeholder-only for this phase).
7. **SEO polish** — sitemap.xml, robots.txt, JSON-LD structured data (LocalBusiness/Service), per TRD §9 non-functional requirements. Metadata/OG tags exist per-page already; structured data does not.

## File Map (where to look)

```
src/features/<domain>/
  components/   UI for that domain
  data/         *.mock.ts — swap-for-real-backend seam
  logic/        pure business logic (booking only, so far)
  validators/   zod schemas (booking only, so far)
src/components/ui/     shadcn primitives (Base UI, not Radix — see note above)
src/components/layout/ site-header, site-footer
src/lib/                cn, format (IDR/date), images (picsum helper)
src/constants/site.ts   business profile, single source for contact info
```
