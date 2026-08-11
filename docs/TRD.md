# Technical Requirements Document (TRD)

# Denailss Platform

**Version:** 1.0
**Status:** Implemented (core)
**Author:** Zidane
**Last Updated:** 2026-08-10

---

# 1. Overview

## Purpose

Dokumen ini menjelaskan standar teknis, arsitektur, dan pedoman implementasi untuk Denailss Platform.

TRD melengkapi PRD dengan menjelaskan **bagaimana sistem dibangun**, bukan **apa yang dibangun**.

---

## Scope

Dokumen ini mencakup:

* Technology Stack
* Project Structure
* Database Design
* API Standard
* Coding Convention
* Security
* Development Guidelines
* Architecture Decision Record (ADR)

---

## High-Level Architecture

```text
                Internet
                    │
                    ▼
             Vercel (Next.js)
                    │
     ┌──────────────┼──────────────┐
     ▼              ▼              ▼
 Route Handlers   Server Actions   Middleware
                    │
                    ▼
          Supabase Platform
     ┌──────────┬──────────┬──────────┐
     ▼          ▼          ▼
 PostgreSQL    Auth      Storage
```

---

## Request Flow

```text
Browser

↓

Next.js App Router

↓

Server Action / Route Handler

↓

Business Logic

↓

Supabase

↓

Response
```

---

# 2. Technology Stack

| Category         | Technology                                 |
| ---------------- | ------------------------------------------ |
| Frontend         | Next.js 16 (App Router, Turbopack)         |
| Language         | TypeScript (strict)                        |
| Styling          | Tailwind CSS v4 (CSS-first, `globals.css`) |
| UI Components    | shadcn/ui on **Base UI** (`@base-ui/react`) |
| Icons            | `@phosphor-icons/react`                    |
| Animation        | `motion/react`                             |
| Backend          | Next.js Route Handlers & Server Actions    |
| Database         | Supabase PostgreSQL                        |
| ORM              | Drizzle ORM + `postgres`                   |
| Authentication   | Supabase Auth                              |
| Storage          | Supabase Storage                           |
| Form Validation  | Zod v4                                     |
| Date/Format      | Custom `src/lib/format.ts` (IDR/date)      |
| State Management | React Context (providers per domain)       |
| Notifications    | `sonner`                                   |
| Deployment       | Vercel                                     |

Catatan deviasi dari rencana awal:

* **shadcn/ui memakai Base UI, bukan Radix** — komponen dari `@base-ui/react`; tidak ada prop `asChild`, komposisi memakai `render={<Link ... />}` dan `nativeButton={false}` untuk tombol yang dirender sebagai link.
* **Icons memakai `@phosphor-icons/react`** — `lucide-react` di-uninstall; `components.json` masih berisi `iconLibrary: "lucide"` (metadata usang, tidak dipakai).
* **Date utility bukan date-fns** — `date-fns` tidak diimpor di source; helper tanggal/IDR ada di `src/lib/format.ts`. (Jika tidak dipakai, dapat dihapus dari dependencies.)
* **State management memakai React Context saja** — TanStack Query tidak digunakan; tiap domain punya provider client yang fetch API (gallery, services, promotions, reviews, availability, deposit-config).
* **Motion memakai `motion/react`** (bukan framer-motion), untuk scroll reveal + micro-interaction.
* **Server Actions belum dipakai** — seluruh persistence lewat Route Handlers; `server-only` digunakan untuk repository/service layer.

---

## Technology Decisions

### Next.js

* Single full-stack framework
* Excellent SEO
* Server Components
* Easy deployment on Vercel

---

### Supabase

* Managed PostgreSQL
* Built-in Authentication
* Built-in Storage
* Row Level Security
* Low operational overhead

---

### Tailwind CSS

* Utility-first
* Consistent spacing
* Fast UI development

---

### shadcn/ui

* Accessible components
* Easy customization
* Production-ready
* **Catatan**: install ini memakai `@base-ui/react` (bukan Radix) — lihat tabel stack.

---

# 3. Project Structure

Project menggunakan **Feature-first Architecture**.

```text
src/
│
├── app/
│
├── components/
│
├── features/
│   ├── appointment/
│   ├── auth/
│   ├── crm/
│   ├── finance/
│   ├── gallery/
│   ├── promotion/
│   ├── review/
│   ├── service/
│   ├── settings/
│   └── customer/
│
├── lib/
│
├── repositories/
│
├── services/
│
├── schemas/
│
├── validators/
│
├── hooks/
│
├── types/
│
├── constants/
│
├── utils/
│
└── middleware.ts
```

---

## Folder Responsibilities

### app/

Next.js routing.

Tidak diperbolehkan menyimpan business logic.

---

### components/

Reusable UI Components.

Contoh:

* Button
* Card
* Modal
* Badge
* DataTable

---

### features/

Semua business feature.

Contoh:

```text
features/

gallery/

appointment/

promotion/

crm/

customer/
```

Setiap feature memiliki:

```text
gallery/

components/

actions/

hooks/

types/

utils/
```

---

### repositories/

Berisi query database.

Tidak boleh berisi business logic.

Contoh:

```text
gallery.repository.ts

booking.repository.ts
```

---

### services/

Business Logic.

Contoh:

```text
booking.service.ts

promotion.service.ts
```

---

### schemas/

Schema database dan DTO.

---

### validators/

Validasi menggunakan Zod.

---

### lib/

Shared libraries.

Contoh:

* Supabase Client
* Logger
* Helper

---

### utils/

Utility functions.

Tidak boleh mengandung business logic.

---

# 4. Database Design

## Database Convention

| Rule        | Value                   |
| ----------- | ----------------------- |
| Database    | PostgreSQL              |
| Primary Key | UUID                    |
| Timestamp   | timestamptz (UTC)       |
| Naming      | snake_case              |
| Table Name  | plural                  |
| Foreign Key | `<entity>_id`           |
| Soft Delete | `deleted_at` (optional) |

---

## Entity Overview

Core Entities (all implemented as Drizzle tables + migrations):

* users
* customers
* customer_notes
* services
* gallery
* gallery_images
* reviews
* promotions
* customer_favorites
* availability_templates
* availability_overrides
* blocked_times
* availability_vacations
* booking_rules
* appointments
* appointment_services
* settings
* deposit_config
* deposit_uploads
* expenses

Notes on deviations from the original plan:

* Promo usage is tracked as an atomic `used_count` column on `promotions` (incremented inside the booking transaction) rather than a separate `promotion_usages` table.
* Deposit proofs live on the appointment as a `deposit_proof_url` (`storage:deposit-proofs/...` reference); pre-submit uploads are tracked in `deposit_uploads` for abandoned-upload cleanup. There is no `deposit_proofs` table.
* Settings are a single-row `settings` table (id `site`) with columns for business profile, social media, and policy text, rather than normalized `business_profile`/`social_media`/`policies` tables.
* `customers.preferences` (jsonb) holds preferred time/shapes/colors; per-customer owner notes live in `customer_notes`.

---

## High-Level ERD

```text
User
 │
 └── Customer
       │
       ├─────────────┐
       │             │
Appointment      Favorite Design
       │
       ├────── Service
       │
       ├────── Promotion
       │
       ├────── Deposit Proof
       │
       └────── Review

Gallery
 │
 ├── Gallery Images
 └── Service

Settings
 │
 ├── Business Profile
 ├── Social Media
 └── Policies
```

---

## Data Convention

### Primary Key

Semua tabel menggunakan UUID.

Contoh:

```sql
id UUID PRIMARY KEY
```

---

### Timestamp

Semua tabel wajib memiliki:

```text
created_at

updated_at
```

Menggunakan UTC (`timestamptz`).

---

### Audit Fields

Jika diperlukan:

```text
created_by

updated_by

deleted_at
```

---

### Enum Convention

Menggunakan lowercase.

Contoh:

```text
pending

confirmed

completed

cancelled
```

---

### Monetary Value

Semua nilai uang disimpan sebagai integer (rupiah).

Contoh:

```text
150000
```

Bukan:

```text
150000.00
```

---

### Image Storage

Metadata disimpan di PostgreSQL.

File disimpan di Supabase Storage.

---

### Settings Data Model (Epic 9)

Settings adalah single source of truth untuk informasi bisnis yang tampil di public website (profil, social media) dan kebijakan yang disampaikan ke customer (pembatalan, deposit).

```sql
-- business_profile (satu baris, berelasi ke business)
id UUID PRIMARY KEY
business_id UUID NOT NULL
name TEXT NOT NULL
logo_url TEXT            -- Supabase Storage path
description TEXT
address TEXT
created_at timestamptz
updated_at timestamptz

-- social_media
id UUID PRIMARY KEY
business_id UUID NOT NULL
platform TEXT NOT NULL   -- instagram | tiktok | whatsapp
handle TEXT NOT NULL
created_at timestamptz
updated_at timestamptz

-- policies
id UUID PRIMARY KEY
business_id UUID NOT NULL
type TEXT NOT NULL       -- cancellation | deposit
content TEXT NOT NULL
created_at timestamptz
updated_at timestamptz
```

Aturan:

* Business name wajib diisi.
* Social media value disimpan sebagai username (Instagram/TikTok) atau nomor (WhatsApp) setelah dinormalisasi; validasi ringan agar owner tidak berdebat dengan form.
* Policies adalah **teks kebijakan** (informational), bukan engine konfigurasi deposit. Deposit calculation tetap berada di availability/deposit config (Epic 3) dan alur booking.

---

# 5. API Standard

## API Style

Menggunakan REST API.

Endpoint diawali dengan:

```text
/api/v1
```

Endpoint yang sudah berjalan:

```text
GET    /api/v1/services                  # katalog layanan (aktif + nonaktif)
GET    /api/v1/services/:id
PATCH  /api/v1/services/:id              # owner-only (edit)
PATCH  /api/v1/services/:id/active       # owner-only (toggle)

GET    /api/v1/gallery                   # katalog desain + gambar terurut
POST   /api/v1/gallery                   # owner-only (create)
GET    /api/v1/gallery/:id
PUT    /api/v1/gallery/:id               # owner-only (update, reconcile gambar)
DELETE /api/v1/gallery/:id               # owner-only (delete + storage cleanup)

GET    /api/v1/availability              # public: weekly template, overrides, blocked, vacations, booking rules
PUT    /api/v1/availability              # owner-only (full config write)

GET    /api/v1/deposit-config            # public
PUT    /api/v1/deposit-config            # owner-only

POST   /api/v1/bookings                  # guest atau customer authenticated
GET    /api/v1/bookings                  # owner semua; customer miliknya sendiri
GET    /api/v1/bookings/:id              # ownership-scoped
PATCH  /api/v1/bookings/:id              # owner-only (status/reschedule/deposit + slot-conflict check)
POST   /api/v1/bookings/deposit-proof    # upload bukti transfer (rate-limited 5/jam)
DELETE /api/v1/bookings/deposit-proof/delete  # hapus bukti sebelum submit
POST   /api/v1/bookings/deposit-proof/url     # owner-only: signed URL

GET    /api/v1/promotions                # semua promo (admin + provider)
POST   /api/v1/promotions                # owner-only
GET    /api/v1/promotions/:id
PATCH  /api/v1/promotions/:id            # owner-only
PATCH  /api/v1/promotions/:id/active     # owner-only

GET    /api/v1/reviews                   # public, dengan summary
POST   /api/v1/reviews                   # customer-only (review booking selesai miliknya)

GET    /api/v1/customer/profile
PATCH  /api/v1/customer/profile
GET    /api/v1/customer/bookings
GET    /api/v1/customer/bookings/:id
GET    /api/v1/customer/favorites        # customer-only
POST   /api/v1/customer/favorites        # customer-only
DELETE /api/v1/customer/favorites        # customer-only

GET    /api/v1/settings                  # public
PUT    /api/v1/settings                  # owner-only

GET    /api/v1/crm/customers             # owner-only
GET    /api/v1/crm/customers/:id         # owner-only
PUT    /api/v1/crm/customers/:id/notes   # owner-only
PUT    /api/v1/crm/customers/:id/preferences  # owner-only

GET    /api/v1/finance/expenses          # owner-only
POST   /api/v1/finance/expenses          # owner-only
PATCH  /api/v1/finance/expenses/:id      # owner-only
DELETE /api/v1/finance/expenses/:id      # owner-only

POST   /api/upload                       # owner-only, rate-limited (20/jam): gallery | service | settings
DELETE /api/upload/delete                # owner-only: hapus storage object
```

Semua write endpoint memvalidasi input dengan Zod di server dan mengembalikan envelope `{ data, meta }` / `{ error: { code, message } }` yang konsisten.

---

## Naming Convention

Gunakan:

* Noun
* Plural
* lowercase
* kebab-case jika diperlukan

Contoh:

```text
/api/v1/gallery

/api/v1/services

/api/v1/promotions
```

---

## Success Response

```json
{
  "data": {},
  "meta": {}
}
```

---

## Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request."
  }
}
```

---

## Pagination

Menggunakan **Cursor Pagination**.

Parameter:

```text
cursor

limit
```

---

## Filtering

Gunakan query parameter.

Contoh:

```text
?search=

?service=

?style=

?color=

?sort=
```

---

## HTTP Status Code

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 204  | No Content            |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 422  | Validation Error      |
| 500  | Internal Server Error |

---

## Validation Rules

* Seluruh input wajib divalidasi menggunakan Zod.
* Validasi dilakukan di server.
* Jangan mempercayai validasi dari client.
* Gunakan schema terpisah untuk Create dan Update.
* Seluruh error validasi menggunakan format response yang konsisten.
---

# 6. Code Convention

## General Principles

* Gunakan TypeScript **strict mode**.
* Hindari penggunaan `any`, gunakan `unknown` bila diperlukan.
* Seluruh code harus mengikuti ESLint dan Prettier.
* Satu file hanya memiliki satu tanggung jawab (Single Responsibility Principle).
* Hindari duplikasi kode (DRY).
* Business logic tidak boleh berada di React Component.

---

## Naming Convention

| Item       | Convention              | Example                 |
| ---------- | ----------------------- | ----------------------- |
| Component  | PascalCase              | `BookingCard.tsx`       |
| Hook       | camelCase diawali `use` | `useBooking.ts`         |
| Service    | kebab/camel             | `booking.service.ts`    |
| Repository | kebab/camel             | `booking.repository.ts` |
| Schema     | kebab/camel             | `booking.schema.ts`     |
| Validator  | kebab/camel             | `booking.validator.ts`  |
| Constant   | UPPER_SNAKE_CASE        | `MAX_UPLOAD_SIZE`       |
| Variable   | camelCase               | `bookingStatus`         |
| Function   | camelCase               | `createBooking()`       |
| Type       | PascalCase              | `Booking`               |
| Enum       | PascalCase              | `BookingStatus`         |

---

## Component Rules

* Component hanya bertanggung jawab terhadap UI.
* Hindari query database langsung dari component.
* Pisahkan reusable component dan feature component.
* Maksimal satu komponen menangani satu concern.

---

## Server Actions & Route Handlers

* Server Action digunakan untuk form submission sederhana.
* Route Handler digunakan untuk REST API.
* Seluruh business logic dipanggil melalui Service Layer.

Contoh:

```text
Route Handler
      │
      ▼
Service
      │
      ▼
Repository
      │
      ▼
Database
```

---

## Service Layer

Service bertanggung jawab terhadap:

* Business logic
* Validasi business rules
* Orkestrasi beberapa repository

Service **tidak** boleh mengetahui detail UI.

---

## Repository Layer

Repository hanya bertanggung jawab terhadap:

* Query database
* Insert
* Update
* Delete
* Transaction

Repository **tidak boleh** berisi business logic.

---

## Import Order

Gunakan urutan berikut:

```text
1. External Libraries
2. Internal Libraries
3. Components
4. Hooks
5. Types
6. Constants
7. Styles
```

---

## Error Handling

* Gunakan custom error yang konsisten.
* Jangan me-return stack trace ke client.
* Seluruh error dicatat pada server log.

---

## Logging

Gunakan level log berikut:

* INFO
* WARN
* ERROR

Jangan melakukan `console.log()` pada production code.

---

# 7. Security

## Authentication

Menggunakan **Supabase Auth** dengan SSR cookie sessions.

Provider yang sudah diimplementasikan:

* Email/password login dan signup
* Google OAuth dengan PKCE callback

Session refresh menggunakan root `middleware.ts`. Route authorization dilakukan server-side pada layout customer/owner dan API auth context; RLS menjadi defense-in-depth untuk tabel private.

---

## Authorization

* Public Website dapat diakses tanpa login.
* Customer Portal hanya untuk customer yang sudah login.
* Backoffice hanya dapat diakses oleh owner.

---

## Row Level Security (RLS)

Seluruh tabel private wajib menggunakan Row Level Security.

Contoh:

* appointments
* favorites
* reviews
* deposit_proofs

Customer hanya dapat mengakses data miliknya sendiri.

---

## File Upload

Upload hanya diperbolehkan untuk:

* Gallery Images
* Review Images
* Deposit Proof Images

Validasi:

* Maximum file size
* Allowed MIME Type
* Image only

---

## Environment Variables

Rahasia aplikasi wajib disimpan pada Environment Variables.

Contoh:

* Supabase URL
* Supabase Anon Key
* Service Role Key
* Google OAuth Credentials

Tidak diperbolehkan hardcode credential di source code.

---

# 8. Development Guidelines

## Git Strategy

Gunakan Git Flow sederhana.

Branch:

```text
main
develop
feature/<feature-name>
bugfix/<issue-name>
hotfix/<issue-name>
```

---

## Commit Convention

Menggunakan Conventional Commits.

Contoh:

```text
feat: add appointment booking

fix: resolve calendar timezone issue

refactor: simplify gallery service

docs: update technical documentation

chore: update dependencies
```

---

## Pull Request Checklist

Sebelum merge:

* Build berhasil
* Lint berhasil
* Tidak ada TypeScript error
* Tidak ada unused code
* Naming sesuai convention
* PR telah direview (jika bekerja dalam tim)

---

## Testing

Target MVP:

* Unit Test untuk business logic
* Component Test untuk UI penting

End-to-End Test dapat ditambahkan setelah MVP stabil.

---

## Backoffice UI Standard

### Table & Pagination

Setiap tabel data di Backoffice **wajib** memiliki pagination.

Tidak ada pengecualian untuk tabel berisi sedikit data — daftar data bisa bertambah sewaktu-waktu, sehingga pagination harus disertakan sejak fitur pertama dibuat.

Requirement wajib:

| Requirement | Nilai |
| ----------- | ----- |
| Default item per halaman | 10 |
| Opsi item per halaman | 5, 10, 15, 25, 50 |
| Kontrol | Dropdown "Tampilkan N per halaman" + label jumlah data |
| Navigasi | Tombol "Sebelumnya"/"Berikutnya" + indikator halaman |
| Reset halaman | Kembali ke halaman 1 saat search/filter/sort/ganti ukuran halaman |

Checklist saat membuat fitur baru yang menampilkan tabel:

* Tambahkan state `currentPage` dan `itemsPerPage` (default 10).
* Terapkan slice data sesuai `itemsPerPage`.
* Tampilkan footer pagination konsisten dengan tabel lain (gallery, customers, dashboard).
* Ganti ukuran halaman harus mereset `currentPage` ke 1.

---

## Documentation

Setiap feature baru harus memperbarui:

* PRD (jika ada perubahan requirement)
* TRD (jika ada perubahan teknis)

---

# 9. Architecture Decision Records (ADR)

## ADR-001

### Decision

Menggunakan **Next.js App Router** sebagai frontend dan backend.

### Reason

* Satu codebase
* Deployment lebih sederhana
* Mendukung Server Components dan Server Actions
* Cocok untuk MVP

---

## ADR-002

### Decision

Menggunakan **Supabase** sebagai Backend-as-a-Service.

### Reason

* PostgreSQL
* Authentication
* Storage
* Row Level Security
* Cepat untuk validasi produk

---

## ADR-003

### Decision

Menggunakan **Feature-first Architecture**.

### Reason

* Mudah dikembangkan
* Setiap fitur terisolasi
* Mempermudah maintenance

---

## ADR-004

### Decision

Menggunakan **Availability Engine** dibanding fixed working hours.

### Reason

Jam operasional Denailss berubah setiap minggu sehingga membutuhkan jadwal yang fleksibel.

---

## ADR-005

### Decision

Menggunakan **Manual Deposit Verification** pada MVP.

### Reason

* Mempercepat proses validasi produk
* Menghindari kompleksitas integrasi payment gateway
* Dapat diupgrade ke Payment Gateway tanpa mengubah alur booking

---

## ADR-006

### Decision

Promotion dibuat sebagai module terpisah.

### Reason

* Mudah dikembangkan
* Mendukung berbagai jenis promo di masa depan
* Tidak mengganggu flow booking

---

## ADR-007

### Decision

Menggunakan **REST API** sebagai standar komunikasi aplikasi.

### Reason

* Familiar
* Mudah di-maintain
* Cocok dengan Next.js Route Handlers

---

## ADR-008

### Decision

Seluruh data menggunakan UUID sebagai Primary Key.

### Reason

* Aman untuk public API
* Mudah untuk migrasi ke arsitektur multi-tenant di masa depan
* Mengurangi risiko ID enumeration

---

## ADR-009

### Decision

Frontend dikembangkan FE-first menggunakan mock data (`*.mock.ts` di `src/features/<domain>/data/`) sebagai seam migrasi. Backend wiring sekarang aktif: semua domain telah dimigrasikan ke repository/API Supabase, dan mock config telah dihapus.

### Reason

* FE-first memvalidasi cakupan produk dan menjaga kontrak komponen tetap stabil.
* Setiap modul mock menjadi seam bernama yang dapat diganti repository/API nyata tanpa mengubah UI.
* Migrasi bertahap membatasi blast radius pada domain inti booking dan customer.

### Implikasi saat ini

* Semua domain persisten: booking, customer profile, gallery + gallery_images, services, promotions (dengan enforce kuota + `used_count`), reviews, customer favorites, settings, availability config (template/overrides/blocked/vacations/booking rules), deposit config, CRM (customers + customer_notes + preferences), finance expenses, dan derivasi income/analytics dari appointment nyata.
* Auth memakai Supabase Auth, middleware session refresh, owner/customer guards, dan RLS policies (defense-in-depth).
* Upload gallery/service/settings/deposit proof memakai Supabase Storage dengan rate limiting in-memory (20/jam owner catalog, 5/jam deposit proof); deposit-proof lifecycle cleanup aktif (abandoned uploads, replace/delete, rejected).
* Slot booking divalidasi overlap-aware dengan buffer di server (409 pada konflik), termasuk reschedule.
* Yang masih memakai data dev (bukan produksi): seed appointment backoffice (`appointments.mock.ts`) dan post Instagram (`instagram-posts.mock.ts`).

---

# Appendix

Dokumen ini merupakan acuan teknis implementasi Denailss Platform dan harus selalu selaras dengan PRD. Setiap perubahan arsitektur, standar coding, atau keputusan teknis wajib diperbarui pada TRD agar dokumentasi tetap menjadi single source of truth bagi pengembangan proyek.
