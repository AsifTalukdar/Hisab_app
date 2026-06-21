# হিসাব (Hisab) — Invoicing for Bangladesh SMEs

**হিসাব (Hisab)** is a lightweight, modern invoicing and billing web application tailored for Small and Medium Enterprises (SMEs) in Bangladesh. It simplifies client management, invoice tracking, and professional PDF generation (with complete Bengali font support) for local businesses.

---

## 🚀 Features

- **Passwordless Authentication**: Log in securely using email OTP or Magic Links powered by Supabase Auth.
- **Analytics Dashboard**: Get a birds-eye view of your business metrics (Total Revenue, Pending Payments, Overdue Invoices, and Total Clients).
- **Invoice Management**: Complete lifecycle tracking of invoices from `Draft` ➡️ `Sent` ➡️ `Paid` / `Overdue`.
- **Beautiful PDF Generation**: Generate professional, print-ready PDF invoices on the fly using `@react-pdf/renderer` with support for local currencies (BDT/৳).
- **Bangla Font Rendering**: Full support for Bangla text in PDF invoices using Google's `Noto Sans Bengali` font.
- **Business Profile Settings**:
  - Configure business name, address, phone number.
  - Upload a custom business logo directly to Supabase Storage.
  - Setup a **bKash** payment number that dynamically appears on PDF invoices.
- **Client Registry**: Keep a simple directory of clients and their details.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL, Storage, & GoTrue Auth)
- **PDF Generation**: `@react-pdf/renderer`
- **Language**: TypeScript

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the root directory and configure the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 📦 Database & Storage Configuration

### Supabase Tables Schema

1. **profiles**
   - Contains user profile metadata such as `business_name`, `phone`, `logo_url`, `address`, and `bkash_number`.
2. **clients**
   - Stores details of the SME's clients (`name`, `phone`, `address`).
3. **invoices**
   - Stores invoice details (`invoice_number`, `issue_date`, `due_date`, `status`, `subtotal`, `total`).
4. **invoice_items**
   - Individual line items for each invoice (`description`, `quantity`, `unit_price`, `amount`).

### Supabase Storage Bucket

Create a public storage bucket in your Supabase dashboard named:
* **`logos`** (with public read access allowed, used for storing business logo uploads).

---

## 💻 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 3. Build for Production
```bash
npm run build
```

---

## 🕒 Recent Updates & Changelog

### Commit Differences (`33ad118c` ➡️ `461e516d`)
- **PDF & Invoice Generation**:
  - Implemented the PDF generator template (`src/components/invoice/InvoicePDF.tsx`) utilizing Google's `Noto Sans Bengali` for correct local font styling.
  - Added an asynchronous client-side downloader (`src/components/invoice/InvoicePDFDownload.tsx`).
  - Added the invoice details view page (`src/app/dashboard/invoices/[id]/page.tsx`).
- **Settings Enhancements**:
  - Added real-time logo uploads to the Supabase Storage bucket `logos`.
  - Added a bKash configuration interface to save numbers directly to the user profile schema.
- **Routing & Fixes**:
  - Redirected settings, sidebar, and invoice page links to correctly resolve paths under the `/dashboard` prefix.
  - Added `emailRedirectTo: callback` to OTP logins.

### Compiler Resolutions & Fixes
- **Authentication Magic Links**: Configured `emailRedirectTo` inside `signInWithOtp` options to route to `/auth/callback`, which exchanges PKCE codes for sessions and correctly logs users in.
- **TypeScript Type Safety**:
  - Added explicit annotations to `cookiesToSet` arrays inside `src/lib/supabase/server.ts` and `src/middleware.ts` to solve implicit `any` compilation errors.
  - Fixed an invalid type comparison in `src/app/dashboard/page.tsx` where invoice statuses were mistakenly checked against `"pending"` (which is not in the `InvoiceStatus` type union).
- **Compile Status**: `npx tsc --noEmit` and `npm run build` now build successfully with 0 errors.
