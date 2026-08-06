# Technical Requirements Document (TRD)

# Denailss Platform

**Version:** 1.0
**Status:** Draft
**Author:** Zidane
**Last Updated:** 2026-08-07

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
| Frontend         | Next.js (App Router)                       |
| Language         | TypeScript                                 |
| Styling          | Tailwind CSS                               |
| UI Components    | shadcn/ui                                  |
| Backend          | Next.js Route Handlers & Server Actions    |
| Database         | Supabase PostgreSQL                        |
| Authentication   | Supabase Auth                              |
| Storage          | Supabase Storage                           |
| Deployment       | Vercel                                     |
| Form Validation  | Zod                                        |
| ORM              | Drizzle ORM                                |
| Date Utility     | date-fns                                   |
| State Management | React Context + TanStack Query (if needed) |

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

Core Entities:

* users
* customers
* appointments
* services
* gallery
* gallery_images
* reviews
* promotions
* promotion_usages
* availability_templates
* availability_overrides
* blocked_times
* deposit_proofs

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

# 5. API Standard

## API Style

Menggunakan REST API.

Endpoint diawali dengan:

```text
/api/v1
```

Contoh:

```text
GET    /api/v1/gallery

GET    /api/v1/gallery/:id

POST   /api/v1/bookings

PATCH  /api/v1/bookings/:id

DELETE /api/v1/gallery/:id
```

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

Menggunakan **Supabase Auth**.

Provider MVP:

* Email
* Google (Future Ready)

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

# Appendix

Dokumen ini merupakan acuan teknis implementasi Denailss Platform dan harus selalu selaras dengan PRD. Setiap perubahan arsitektur, standar coding, atau keputusan teknis wajib diperbarui pada TRD agar dokumentasi tetap menjadi single source of truth bagi pengembangan proyek.
