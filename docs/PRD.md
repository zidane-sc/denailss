# Product Requirements Document (PRD)

# Denailss Platform

**Version:** 1.0
**Status:** Draft
**Author:** Zidane
**Last Updated:** 2026-08-07

---

# 1. Objective & Background

## Objective

Denailss Platform adalah aplikasi all-in-one yang membantu bisnis nail art mengelola pemasaran, booking, pelanggan, dan operasional dalam satu platform.

Target awal bukan menjadi SaaS, tetapi menjadi sistem operasional internal Denailss. Seluruh arsitektur tetap dirancang agar dapat dikembangkan menjadi multi-tenant SaaS di masa depan tanpa perubahan besar.

---

## Background

Saat ini Denailss masih mengandalkan Instagram dan WhatsApp untuk hampir seluruh proses bisnis.

Hal tersebut menimbulkan beberapa permasalahan:

* Customer sering membatalkan appointment secara mendadak.
* Sulit mengatur jadwal karena jam operasional berubah setiap minggu.
* Portfolio tersebar di Instagram sehingga sulit dicari berdasarkan kategori.
* Tidak memiliki histori customer.
* Sulit mengetahui customer loyal.
* Tidak memiliki website yang dapat ditemukan melalui Google.
* Tidak memiliki insight mengenai perkembangan bisnis.

Platform ini bertujuan menyelesaikan seluruh permasalahan tersebut.

---

# 2. User Persona

## Persona 1 — Owner (Primary)

Nama:
Dela

Usia:
20–30 tahun

Role:
Owner sekaligus Nail Artist

### Goals

* Mendapat lebih banyak customer
* Mengurangi pembatalan booking
* Mengelola jadwal dengan mudah
* Menampilkan portfolio secara profesional
* Mengetahui perkembangan bisnis

### Pain Points

* Booking masih manual melalui WhatsApp
* Jadwal sering berubah
* Sulit mencari foto design lama
* Tidak memiliki CRM
* Sulit mengetahui repeat customer

---

## Persona 2 — Customer

### Goals

* Melihat portfolio
* Mencari inspirasi design
* Booking dengan mudah
* Melihat riwayat booking
* Menyimpan design favorit

### Pain Points

* Harus scroll Instagram sangat jauh
* Sulit mengetahui harga
* Sulit mengetahui slot kosong
* Harus chat admin untuk semua hal

---

# 3. Success Metrics / KPI

## Marketing

* Visitor website meningkat
* Organic traffic dari Google
* Conversion rate Visitor → Booking
* Bounce rate

---

## Booking

* Total booking
* Booking completion rate
* Cancellation rate
* No-show rate

---

## Customer

* Repeat customer rate
* Customer retention
* Average visit frequency
* Favorite services

---

## Business

* Monthly revenue
* Revenue growth
* Average order value
* Top services
* Top designs

---

# 4. Product Scope

Platform terdiri dari tiga area utama.

```text
Public Website
Customer Portal
Back Office
```

---

# 5. Features & Requirements

---

# EPIC 1 — Public Website

**Priority**

⭐⭐⭐⭐⭐ High

## Goal

Menjadi media pemasaran utama Denailss.

---

### Feature

### Landing Page

**User Story**

Sebagai calon customer, saya ingin mengetahui informasi mengenai Denailss sehingga saya yakin untuk melakukan booking.

**Requirement**

* Hero section
* CTA Booking
* CTA WhatsApp
* About
* Services
* Gallery Preview
* Reviews Preview
* Contact
* FAQ

---

### Feature

### Gallery

**Priority**

⭐⭐⭐⭐⭐

**User Story**

Sebagai customer, saya ingin mencari design sesuai selera sehingga saya dapat memilih design sebelum booking.

**Requirement**

* Masonry Grid
* Infinite Scroll
* Search
* Filter

**Filter**

* Style
* Color
* Occasion
* Shape
* Difficulty
* Search (judul/deskripsi)

**Gallery Detail**

* Multiple photos (urutan bisa diatur, foto pertama = utama)
* Description
* Price (custom per desain)
* Difficulty
* Related designs
* Book this design

---

### Feature

### Services

**Priority**

⭐⭐⭐⭐⭐

**Requirement**

Service Detail

* Name
* Description
* Price From
* Duration
* Gallery
* FAQ
* CTA Booking

Example

* Gel Extension
* Removal
* Manicure
* Pedicure
* Fake Nail
* Nail Art

---

### Feature

### Reviews

**Priority**

High

**Requirement**

* Rating
* Review
* Customer Name
* Visit Date
* Photos
* Filter

---

### Feature

### Promotion Banner

**Priority**

⭐⭐⭐⭐ High

**User Story**

Sebagai customer, saya ingin melihat promo yang sedang berlangsung sehingga saya dapat memanfaatkan penawaran saat melakukan booking.

**Requirement**

Owner dapat membuat banner promosi yang ditampilkan pada halaman public.

Banner terdiri dari:

* Title
* Description
* CTA Button
* Start Date
* End Date
* Active Status

Banner akan otomatis tampil sesuai periode promo.

---

### Feature

### Booking

**Priority**

⭐⭐⭐⭐⭐

**Booking Flow**

```text
Choose Service

↓

Choose Design (Optional)

↓

Choose Date

↓

Choose Time

↓

Customer Information

↓

Deposit Required? (Optional)

↓

Upload Payment Proof (Optional)

↓

Waiting Verification (Optional)

↓

Confirmation

↓

Appointment Created
```

**Status**

* Pending Deposit
* Waiting Verification
* Pending
* Confirmed
* Completed
* Cancelled
* No Show

---

### Feature

### Contact

**Requirement**

* WhatsApp
* Instagram
* TikTok
* Google Maps

---

# EPIC 2 — Customer Portal

**Priority**

⭐⭐⭐⭐ High

---

### Feature

### Dashboard

**Requirement**

* Upcoming Appointment
* Recent Booking
* Favorite Designs

---

### Feature

### Booking History

**Requirement**

* Appointment List
* Status
* Detail

---

### Feature

### Favorite Designs

**Requirement**

* Save Design
* Remove Favorite
* Book From Favorite

---

### Feature

### Upload Deposit Proof

**Priority**

⭐⭐⭐⭐ High

Apabila booking memerlukan deposit, customer dapat:

* Upload payment proof image
* Replace payment proof sebelum diverifikasi
* Melihat status verifikasi

**Verification Status**

* Waiting Verification
* Approved
* Rejected

---

### Feature

### Profile

**Requirement**

* Name
* Phone
* Email
* Notes

---

### Feature

### Reviews

**Requirement**

Customer dapat memberikan review setelah appointment selesai.

---

# EPIC 3 — Appointment Management

**Priority**

⭐⭐⭐⭐⭐ Highest

Ini merupakan core business.

---

### Feature

### Calendar

**Requirement**

View

* Day
* Week
* Month

Appointment

* Drag & Drop
* Reschedule
* Cancel
* Complete

---

### Feature

### Availability Engine

**Priority**

⭐⭐⭐⭐⭐

Sistem **tidak menggunakan Working Hours sederhana**.

Menggunakan Availability Engine.

#### Weekly Template

Contoh

Monday

Closed

Tuesday

18:00–22:00

Sunday

09:00–18:00

---

#### Multiple Sessions

Contoh

Sunday

09:00–12:00

13:00–17:00

19:00–22:00

---

#### Override

Mengubah jadwal hanya pada tanggal tertentu.

Contoh

17 Agustus

08:00–21:00

---

#### Vacation

Contoh

20 Agustus

↓

25 Agustus

Closed

---

#### Block Time

Contoh

15:00–17:00

Reason

Family Event

---

#### Booking Rules

* Booking Window
* Minimum Notice
* Maximum Booking Per Day
* Buffer Time
* Closed Dates

---

### Feature

### Deposit Configuration

**Priority**

⭐⭐⭐⭐ High

Owner dapat menentukan apakah booking membutuhkan deposit.

Configuration:

* Deposit Enabled / Disabled
* Deposit Type

  * Fixed Amount
  * Percentage
* Deposit Value
* Payment Instructions

  * Bank Account
  * E-Wallet
  * Additional Notes

---

### Feature

### Manual Deposit Verification

**Priority**

⭐⭐⭐⭐ High

Pada MVP 1, sistem **belum mengimplementasikan Payment Gateway**.

Customer melakukan transfer manual sesuai instruksi owner, kemudian mengunggah bukti pembayaran.

Owner melakukan verifikasi secara manual.

**Owner Actions**

* View Payment Proof
* Approve
* Reject
* Reject Reason (Optional)

---

### Feature

### Appointment Detail

**Requirement**

* Customer
* Service
* Design
* Notes
* Status
* Payment Status

---

# EPIC 4 — CRM

**Priority**

⭐⭐⭐⭐⭐

**Requirement**

Customer Profile

* Name
* Contact
* Total Visits
* Total Spending
* Favorite Service
* Favorite Design
* Last Visit
* Notes

History

* Booking History
* Cancellation
* Reviews

---

# EPIC 5 — Gallery Management

**Priority**

High

**Requirement**

Gallery CRUD

Fields

* Photos (upload-only dari owner; bisa hapus & urutkan via drag-and-drop, foto pertama = foto utama)
* Title
* Description
* Style
* Color
* Shape
* Occasion
* Difficulty
* Price (custom, bebas diisi owner)

Catatan perubahan requirement:

* Tags dihapus — desain diidentifikasi via judul/slug, pencarian lewat judul + deskripsi.
* Harga tidak lagi otomatis mengikuti tier difficulty — owner mengisi harga custom per desain (tampil di card galeri & halaman detail).
* "Related services" dihapus — desain tidak lagi terikat layanan tertentu (booking desain langsung `/booking?design=...`; halaman layanan tidak lagi menampilkan contoh desain).
* Status Draft/Published tidak diimplementasikan di iterasi FE-first — semua desain tampil (tanpa tanggal terbit).
---

# EPIC 6 — Promotion

**Priority**

⭐⭐⭐⭐ Medium

## Goal

Memberikan fleksibilitas kepada owner untuk membuat promo yang dapat meningkatkan conversion dan menarik customer baru.

---

### Feature

### Promotion Management

**Requirement**

Owner dapat membuat promo dengan tipe:

* Percentage Discount
* Fixed Amount Discount

Promotion memiliki informasi:

* Title
* Description
* Promo Code
* Discount Type
* Discount Value
* Start Date
* End Date
* Usage Limit
* Active Status

---

### Promotion Rules

Promo dapat dikonfigurasi dengan aturan berikut:

* Minimum Spend
* Applicable Services
* Maximum Discount

---

### Booking Integration

Customer dapat memasukkan promo code ketika melakukan booking.

Apabila promo valid, sistem akan:

* Memvalidasi seluruh aturan promo
* Menghitung nilai diskon
* Menampilkan total harga setelah diskon

---

### Public Website

Promo yang sedang aktif dapat ditampilkan pada:

* Homepage Promotion Banner
* Service Detail (Optional)
* Booking Page

---

# EPIC 7 — Finance

**Priority**

Medium

**Requirement**

Income

Expense

Profit

Monthly Report

---

# EPIC 8 — Analytics

**Priority**

Medium

Dashboard

* Revenue
* Booking
* Cancellation
* No Show
* Repeat Customer
* Popular Services
* Popular Designs
* Peak Booking Time

---

# EPIC 9 — Settings

**Priority**

Medium

Business Profile

* Business Name
* Logo
* Description
* Address

Social Media

* Instagram
* TikTok
* WhatsApp

Policies

* Cancellation Policy
* Deposit Policy

Deposit

* Deposit Enabled
* Deposit Type
* Deposit Amount
* Payment Instructions

SEO

* Meta Title
* Meta Description
* Open Graph Image

---

# 6. User Flow

## Customer

```text
Landing Page

↓

Gallery

↓

Choose Design

↓

Booking

↓

Promo Code (Optional)

↓

Deposit Required? (Optional)

↓

Upload Payment Proof (Optional)

↓

Waiting Verification (Optional)

↓

Appointment Confirmed

↓

Visit

↓

Review
```

---

## Owner

```text
Dashboard

↓

Calendar

↓

Appointment

↓

Verify Deposit (Optional)

↓

Complete Appointment

↓

Revenue Updated

↓

Analytics Updated
```

---

# 7. Design Guidelines

## Public Website

Target Impression

* Feminine
* Cute
* Playful
* Premium
* Professional
* Modern

Inspirasi

* Korean Beauty
* Japanese Beauty
* Pinterest Style

---

## Color Palette

Primary

Pink

Secondary

Yellow

Accent

Blue

Background

White / Soft Pink

---

## Typography

Friendly

Readable

Modern

Rounded

---

## Illustration

* Soft gradient
* Rounded cards
* Cute icons
* Large photos
* Minimal decoration

---

## Gallery Style

Pinterest / Masonry Grid

---

## Animation

* Smooth
* Soft
* Playful

Avoid

* Heavy animation
* Flashy effects

---

# 8. Technical Stack

## Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui

---

## Backend

* Next.js Route Handler

---

## Database

* Supabase PostgreSQL

---

## Authentication

* Supabase Auth

Future Ready

* Google Login
* Email Login

---

## Storage

* Supabase Storage

Digunakan untuk:

* Gallery Images
* Review Images
* Deposit Proof Images

---

## Deployment

Frontend

* Vercel

Backend

* Vercel

Database

* Supabase

Storage

* Supabase Storage

---

# 9. Non Functional Requirements

Performance

* Lighthouse > 90
* Mobile First
* Responsive

SEO

* Server Side Rendering
* Dynamic Metadata
* Sitemap
* robots.txt
* Open Graph
* JSON-LD
* Canonical URL

Accessibility

* Keyboard Friendly
* Proper Heading
* Alt Image

Security

* Row Level Security
* Protected Dashboard
* Protected Customer Portal

---

# 10. Out of Scope (V1)

* Payment Gateway Integration
* Automatic Payment Verification
* QRIS Integration
* Virtual Account
* Payment Webhook
* Multi Branch
* Multi Staff
* Payroll
* Inventory
* Loyalty Point
* Membership
* Referral
* AI Recommendation
* WhatsApp Broadcast
* Multi Tenant SaaS

---

# 11. Future Roadmap

## V2

* Payment Gateway Integration
* Automatic Payment Verification
* QRIS
* Virtual Account
* Loyalty
* Membership
* Coupon

## V3

* Inventory
* Staff Management
* Commission
* Payroll

## V4

* Multi Branch
* SaaS Platform
* White Label
* Public API
