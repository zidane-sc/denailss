# Denailss — Nail Art Studio Booking Platform

Platform operasional untuk Denailss, studio nail art rumahan: public website untuk
customer, portal customer untuk booking & riwayat, dan backoffice untuk owner.

## Stack

- **Next.js 16** (App Router, Turbopack), TypeScript strict, Tailwind CSS v4
- **shadcn/ui on Base UI** (`@base-ui/react`, bukan Radix — komposisi via `render=`, tidak ada `asChild`)
- **Supabase**: PostgreSQL (via Drizzle ORM), Auth, Storage
- **Icons**: `@phosphor-icons/react` · **Animasi**: `motion/react` · **Toast**: `sonner`
- **Testing**: Vitest (unit tests untuk pure business logic)

## Menjalankan

```bash
npm install
cp .env.example .env.local   # isi dengan kredensial Supabase
npm run dev
```

Node **24.x** disarankan (`.nvmrc`). Gunakan `nvm use` jika tersedia.

## Scripts

| Perintah           | Fungsi                                        |
| ------------------ | --------------------------------------------- |
| `npm run dev`      | Dev server                                    |
| `npm run build`    | Production build (termasuk typecheck)         |
| `npm run lint`     | ESLint (wajib 0 warning)                      |
| `npm test`         | Vitest unit tests                             |
| `npx tsc --noEmit` | Standalone typecheck                          |

## Database & Migrasi

Skema Drizzle ada di `src/db/schema/index.ts`; migrasi hand-authored di
`supabase/migrations/0000…0017.sql` (auth/RLS, storage, seed backfill, config).
`supabase/seed.sql` memuat katalog dev (services, gallery, availability);
config lain (deposit, booking rules, promotions, settings, instagram) di-seed
langsung oleh migrasi masing-masing.

Sebelum `/backoffice` bisa diakses, akun owner harus dipromosikan via
`supabase/OWNER_SETUP.sql` (dijalankan di Supabase SQL Editor).

## Arsitektur

Feature-first: setiap domain (`gallery`, `services`, `promotions`, `reviews`,
`customer`, `crm`, `finance`, `analytics`, `settings`, `booking`) punya
`components/`, `services/` (repository Drizzle), `schemas/` (zod) di bawah
`src/features/`. Persistence lewat Route Handlers `/api/v1/*`; client fetch
via provider per domain. Semua data real — tidak ada mock/fixture.

## Dokumentasi

- `docs/PRD.md` — product requirements
- `docs/TRD.md` — technical requirements + ADR
- `docs/PROGRESS.md` — running memory & status
