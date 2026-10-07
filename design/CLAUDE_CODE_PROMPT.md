# ZatcaWeb — Build prompt for Claude Code

> **How to use:** unzip this package into an empty folder, copy it to `./design/` inside your new repo (or open Claude Code in the unzipped folder and let it create `app/` next to it), then paste everything below the line into Claude Code. Work phase by phase: after each phase, review, run the app, commit, then type `continue with phase N`.

---

You are a senior full-stack engineer building **ZatcaWeb**, a bilingual (Arabic-first RTL + English) multi-tenant SaaS for Saudi businesses: e-invoicing, sales, purchases, expenses, VAT, accounting and reporting. A complete design handoff is in `./design/`. Build a production-quality application that matches it.

## 0. Read first (before writing code)

1. `design/README.md` — package overview.
2. `design/docs/DESIGN_SPEC.md` — screen inventory, routes, sections, components, entities and domain rules. **This is the functional spec.**
3. `design/design-system/docs/brand-book.md`, `bilingual-rtl.md`, `compliance-states.md`, `data-and-charts.md`, `app-shell.md`.
4. `design/design-system/tokens.json` and `tokens.css` — the only source of colours, type, spacing, radii, shadows, motion.
5. `design/design-system/docs/components/*.md` and `components/index.d.ts` — component APIs.
6. Open `design/screens/index.html` and `design/design-system/previews/index.html` in a browser (or view the `.webp` files) to see every screen and component. `design/screens/source/*.dc.html` contain the exact markup and sample data behind each render.

The `design-system/components/bundle.js` is a **visual reference implementation** (plain React, no build). Do not import it into the app. Re-implement each component in TypeScript with Tailwind + shadcn/ui so it looks and behaves the same.

Ask me before deviating from the design or the stack. When something is ambiguous, pick the option most consistent with the design files and note it in `docs/DECISIONS.md`.

## 1. Stack (fixed)

- **Next.js 15** (App Router, React Server Components, Server Actions where suitable) + **TypeScript strict**.
- **Tailwind CSS** + **shadcn/ui** (Radix) + `lucide-react` (icons match the design's 1.75 px stroke style).
- **PostgreSQL 16** + **Prisma ORM** (migrations committed). Use `Decimal` / `NUMERIC` for all money.
- **Auth:** Auth.js (NextAuth v5) with credentials + email verification + phone OTP, TOTP 2FA, database sessions. Passwords hashed with argon2id.
- **Validation:** Zod schemas shared between client and server. Forms: react-hook-form + zod resolver.
- **Data fetching:** server components + server actions for mutations; TanStack Query only for client-heavy screens (data grids, invoice editor). Tables: TanStack Table.
- **i18n:** `next-intl`, locales `ar` (default) and `en`, `dir` set on `<html>`. All strings in `messages/ar.json` and `messages/en.json` — no hard-coded UI text.
- **Charts:** Recharts, styled with the chart tokens (`--chart-1…8`), RTL-aware.
- **Background jobs:** Redis + BullMQ (e-invoice submission, emails, PDFs, recurring invoices, report schedules).
- **Files:** S3-compatible object storage (MinIO in dev) for logos, attachments, PDFs, XML.
- **PDF:** server-side HTML → PDF with Playwright (Chromium), bilingual template from the design.
- **Email:** React Email + SMTP (Mailpit in dev). SMS/WhatsApp behind a provider interface (mock in dev).
- **Testing:** Vitest (unit), Playwright (e2e), plus a Prisma test database.
- **Tooling:** pnpm, ESLint, Prettier, Husky + lint-staged, `docker-compose.yml` for Postgres, Redis, MinIO and Mailpit.
- **Deploy target:** Docker image; `.env.example` documents every variable.

## 2. Repository layout

```
/design                     ← this handoff package (read-only)
/app (repo root of the Next.js project)
  prisma/schema.prisma, prisma/migrations/, prisma/seed.ts
  src/app/[locale]/(marketing)/…        public site
  src/app/[locale]/auth/…               login, register, verify, reset, 2fa
  src/app/[locale]/onboarding/…
  src/app/[locale]/app/[orgSlug]/…      tenant app (all modules)
  src/app/[locale]/admin/…              platform super admin
  src/app/api/v1/…                      public REST API (API keys)
  src/components/ui/                    shadcn primitives themed with tokens
  src/components/zw/                    ZatcaWeb components (StatCard, Amount, InvoiceStatus, ComplianceStatus, QrPanel, DataGrid, Stepper, UsageMeter, Insight, Timeline, AppShell, Sidebar, Topbar, CommandMenu…)
  src/server/db.ts                      Prisma client + tenant-scoped helper
  src/server/auth/, src/server/rbac/, src/server/audit/
  src/server/modules/<module>/          service + repository + zod schemas per domain
  src/server/einvoicing/                e-invoicing adapter (see §7)
  src/server/jobs/                      BullMQ queues + workers
  src/lib/money.ts, dates.ts, format.ts, vat.ts, numbering.ts
  messages/ar.json, messages/en.json
  tests/unit, tests/e2e
docs/DECISIONS.md, docs/API.md
```

## 3. Design-system integration

- Copy `design/design-system/fonts/*.woff2` to `public/fonts/` and load with `next/font/local`: Inter Variable (Latin), IBM Plex Sans Arabic (Arabic), IBM Plex Mono (identifiers).
- Port `tokens.css` into `src/app/globals.css` **unchanged in values**: semantic CSS variables for light under `:root, [data-theme="light"]` and dark under `[data-theme="dark"]`. Map them in `tailwind.config.ts` (`colors.surface`, `colors.fg.muted`, `colors.brand`, `success/warning/danger/info` with `-bg`/`-fg`/`-border`, `chart-1…8`, radii, shadows, font families, font sizes, spacing). Components use these semantic names only — never raw hex.
- Theme switch: `next-themes` with `attribute="data-theme"`, system default, persisted per user.
- RTL: only logical utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`). Directional icons (arrows, chevrons) flip in RTL. Numbers, money, VAT/CR/IBAN, invoice numbers, emails and phone numbers render in `dir="ltr"` spans with tabular figures. Western digits in both locales.
- Build every component listed in `design-system/docs/components/` with the same props/variants as `index.d.ts`. Add a `/[locale]/dev/components` page (dev only) that shows all of them in light/dark × ar/en, mirroring `design-system/previews/`.
- Every list has loading skeletons, empty state (with create action) and error state with retry. Keyboard: ⌘K/Ctrl K command menu, `N` quick create, visible focus rings.
- Accessibility: WCAG 2.2 AA, labelled inputs, aria-live for toasts and status changes, reduced-motion support.

## 4. Multi-tenancy & security (non-negotiable)

- Every tenant table has `organizationId` (UUID, indexed, FK). All queries go through a tenant-scoped repository that injects `organizationId` from the authenticated session — never from request input.
- Enable **PostgreSQL Row-Level Security** on tenant tables as defence in depth: policy `organization_id = current_setting('app.org_id')::uuid`; set it with `SET LOCAL app.org_id` inside a transaction per request (Prisma `$transaction` + `$executeRaw`). The app DB role must not be a superuser or table owner bypassing RLS. Add a test proving cross-tenant reads return nothing.
- RBAC: roles Owner, Admin, Accountant, Sales Manager, Sales, Purchasing, Viewer (+ custom roles) with permission keys like `invoice.create`, `invoice.issue`, `invoice.approve`, `invoice.void`, `report.view`, `vat.file`, `settings.manage`, `users.manage`, `billing.manage`. Check permissions in every server action and API route via one `authorize(ctx, permission, resource?)` helper. Optional branch scoping per membership.
- Audit log (`AuditLog`) for every mutation: actor, org, entity, entityId, action, before/after JSON diff, IP, user agent, timestamp. Append-only (no update/delete grants).
- Rate limiting (Redis) on auth, OTP and API. CSRF protection for server actions, secure cookies, CSP headers, input validation with Zod everywhere.
- Secrets (e-invoicing private keys, API keys, OTP secrets) encrypted at rest with envelope encryption (`APP_ENCRYPTION_KEY`), never logged, never returned to the client. API keys stored as hashes.
- Super-admin (`/admin`) is a separate platform role, MFA required. "Support view" is read-only, time-limited, reason-required and logged. Suspensions need a reason + second approver.

## 5. Data model (Prisma) — implement this, refine as needed

Conventions: `id String @id @default(uuid()) @db.Uuid`, `createdAt`, `updatedAt`, `deletedAt?` (soft delete for master data only, never for issued documents), `createdById`. Money `Decimal @db.Decimal(18,2)`, quantities `@db.Decimal(18,4)`, rates `@db.Decimal(5,2)`. Use Postgres enums. Add composite indexes on `(organizationId, …)` for every list filter.

**Platform & identity**
- `User` (name, email unique, phone, passwordHash, emailVerifiedAt, phoneVerifiedAt, locale, theme, twoFactorSecret?, twoFactorEnabled), `Account`/`Session`/`VerificationToken` (Auth.js), `OtpCode` (hashed, purpose, expiresAt, attempts), `Passkey` (later), `PlatformAdmin`.
- `Organization` (slug, nameAr, nameEn, legalName, crNumber, vatNumber (15 digits, starts and ends with 3), tin, businessType, industry, employeesRange, invoiceVolume, logoKey, brandColor, defaultLocale, currency SAR, fiscalYearStartMonth, status active/suspended/trial), `OrganizationAddress` (National Address: buildingNo, street, district, city, postalCode (5), additionalNo (4), shortAddress, country SA).
- `Membership` (userId, organizationId, roleId, status, branchIds[]), `Role` (system/custom), `Permission`, `RolePermission`, `Invitation`.
- `Branch` (code, nameAr/En, address, isHeadOffice, eInvoiceDeviceId?), `Warehouse`.

**Sales**
- `Customer` (type company/individual, nameAr/En, vatNumber?, crNumber?, email, phone, address, creditLimit, paymentTermsDays, tags, notes), `CustomerContact`.
- `Product` (type product/service/bundle, sku, barcode, nameAr/En, description, categoryId, unit, purchasePrice, sellingPrice, vatCategory STANDARD/ZERO/EXEMPT/OUT_OF_SCOPE, vatRate, trackStock, minStock, isActive), `ProductVariant`, `Category`, `StockLevel` (productId, warehouseId, qty), `StockMovement`.
- `Invoice` (type TAX/SIMPLIFIED/CREDIT_NOTE/DEBIT_NOTE, number?, provisional/draft, status enum from DESIGN_SPEC §3.7, complianceStatus enum §3.6, customerId, branchId, issueDate, supplyDate, dueDate, paymentTerms, salespersonId, currency, poRef, contractRef, originalInvoiceId (for notes) + reason, subtotal, discountTotal, taxableAmount, vatTotal, otherCharges, rounding, grandTotal, amountPaid, balanceDue, notes, terms, templateId, issuedAt, issuedById, uuid (document UUID), icv (invoice counter value), previousInvoiceHash, invoiceHash, qrPayload, xmlKey, pdfKey, lockedAt).
- `InvoiceLine` (position, productId?, description, descriptionAr, qty, unit, unitPrice, discountPct, vatCategory, vatRate, netAmount, vatAmount, lineTotal, exemptionReasonCode?).
- `InvoiceSequence` (organizationId, branchId, documentType, prefix, nextValue, year) — allocate numbers with `SELECT … FOR UPDATE` inside the issue transaction; gap-free.
- `Quotation` + `QuotationLine` (convert to invoice), `RecurringInvoice` (template + schedule + nextRunAt), `Payment` (invoiceId, amount, method cash/bank/card/mada/transfer, date, reference, bankAccountId), `PaymentAllocation` (one payment → many invoices), `ShareLink` (token, expiresAt, viewedAt).

**Purchases & expenses**
- `Supplier`, `PurchaseOrder` + lines (status draft/pending_approval/approved/sent/received/billed/paid), `Bill` + lines, `Expense` (categoryId, supplierId?, reference, date, paymentMethod, amountInclVat, vatAmount, recoverable, vatInvoiceReceived, branchId, projectId?, costCenterId?, status draft/pending/approved/rejected/paid), `ExpenseCategory`, `Project`, `CostCenter`.

**Finance**
- `Account` (chart of accounts tree: code, nameAr/En, type asset/liability/equity/revenue/expense, parentId, isSystem), `JournalEntry` (date, source INVOICE/PAYMENT/EXPENSE/BILL/MANUAL, sourceId, memo, posted), `JournalLine` (accountId, debit, credit, branchId?, costCenterId?) — enforce Σdebit = Σcredit in a DB constraint trigger. Auto-post entries from documents via posting rules.
- `BankAccount` (name, bank, IBAN), `BankTransaction`, reconciliation matches.
- `VatPeriod` (start, end, dueDate, status open/locked/filed), `VatReturn` (immutable snapshot of boxes 1–16 + generatedById + filedAt).
- `FiscalPeriod` (lock dates).

**E-invoicing**
- `EInvoiceDevice` (EGS unit: name, serial, branchId, environment sandbox/simulation/production, status, csr, encrypted private key, complianceCsid, productionCsid, certificate, certExpiresAt, lastIcv, lastInvoiceHash).
- `EInvoiceSubmission` (invoiceId, deviceId, mode CLEARANCE/REPORTING, requestXmlKey, responseJson, httpStatus, result ACCEPTED/ACCEPTED_WITH_WARNINGS/REJECTED/ERROR, warnings[], errors[], attempt, submittedAt, respondedAt).
- `EInvoiceError` (code, message, invoiceId, status open/resolved, recommendedAction).

**Workspace**
- `ApprovalWorkflow` (documentType, condition JSON e.g. `{ "gt": 50000 }`, isActive) + `ApprovalStep` (order, roleId/userId) + `ApprovalRequest` / `ApprovalDecision`.
- `Attachment` (entityType, entityId, key, mime, size), `Note`, `ActivityLog`, `AuditLog`, `Notification`, `NotificationPreference`, `InvoiceTemplate` (JSON config from the designer), `BrandSettings`, `SavedReport`, `ReportSchedule`, `ApiKey`, `Webhook` + `WebhookDelivery`, `ImportJob`, `ExportJob`, `OnboardingChecklist`.

**Billing (ZatcaWeb's own SaaS)**
- `Plan` (Starter/Professional/Business/Enterprise, limits JSON, priceMonthly/Yearly — leave prices configurable, the design shows `[SAR —]` placeholders), `Subscription`, `UsageCounter` (per org per month), `PaymentMethod`, `PlatformInvoice`, `FeatureFlag`, `SupportTicket`, `PlatformAuditLog`.

## 6. Business rules

- Line math (server is the source of truth, client mirrors it in `src/lib/vat.ts`): `net = round2(qty × unitPrice × (1 − discount%))`, `vat = round2(net × rate)`, totals are sums of rounded line values. Use `decimal.js` — never JS floats for money. Unit tests for rounding edge cases.
- **Issue** = one DB transaction: validate (customer VAT required for TAX type, National Address present, at least one line, totals consistent) → allocate number → set ICV, previous hash, UUID → compute hash → lock (`lockedAt`) → create journal entry → audit → enqueue e-invoicing job. Issued invoices cannot be edited or deleted; corrections only via credit/debit notes referencing the original. Enforce immutability in the service layer **and** with a DB trigger that rejects updates to locked financial fields.
- Simplified (B2C) vs Tax (B2B) invoice behaviour as in the spec (reporting vs clearance; clearance must succeed before the invoice is shared with the buyer).
- Approval workflows: if a workflow matches, "Issue" becomes "Submit for approval"; issuing happens on final approval.
- Overdue is derived (`dueDate < today && balanceDue > 0`), computed in queries or a nightly job — not stored manually.
- VAT return boxes 1–16 aggregated from issued invoice lines and approved expenses/bills in the period by VAT category; snapshot on generate; locked periods reject back-dated documents.
- Plan limits enforced server-side from `UsageCounter` (invoices/month, users, branches, storage, API calls, automations) with clear upgrade prompts.

## 7. E-invoicing (ZATCA / FATOORA) module — honesty rules

- Implement behind an interface: `EInvoicingProvider { onboardDevice, generateXml (UBL 2.1), sign, buildQr (TLV base64), checkCompliance, clear, report }`, with two adapters: `MockProvider` (default in dev/tests, clearly labelled "Sandbox / Simulation" in the UI) and `ZatcaProvider`.
- **Before implementing `ZatcaProvider`, read the current official ZATCA developer documentation and SDK** (XML implementation standard, security features standard, API specs for compliance, clearance and reporting, sandbox endpoints). Do not rely on memory for field names, endpoints, hashing/canonicalisation, certificate profiles or QR tags; cite the document/version you used in `docs/DECISIONS.md`. Validate generated XML with the official SDK in CI.
- Status shown in the UI (`ComplianceStatus`) must come **only** from real validation/submission results stored in `EInvoiceSubmission`. Never mark anything "Accepted"/"Cleared"/"Compliant" by default. The marketing site must not claim official certification unless it is true; keep the independence disclaimer from the design.
- Submissions run in BullMQ with retries + exponential backoff, idempotency per invoice UUID, and full request/response logging (secrets redacted). Errors create `EInvoiceError` cards with code, affected document and recommended action, as designed in the Compliance Center.
- Private keys encrypted at rest; certificate expiry alerts at 30/7/1 days.

## 8. Seed data (must match the designs)

`prisma/seed.ts` creates a demo login `demo@zatcaweb.sa` / `Demo@12345` (dev only) and the organization from the renders:
- **شركة آفاق التقنية المحدودة / Afaq Technology Co. Ltd.**, VAT `310123456700003`, CR `1010654321`, 7421 King Fahd Rd, Al Olaya, Riyadh 12214.
- Branches: Head Office (Riyadh), Dammam, Jeddah; devices `EGS-RYD-01`, `EGS-DMM-01`, `EGS-JED-01` (MockProvider, sandbox).
- Customers, suppliers, products, invoices `INV-2026-00116 … INV-2026-00128`, payments and expenses taken from `design/screens/source/*.dc.html` so the dashboard reproduces: total sales 248,930.50, VAT collected 37,339.58, net revenue 241,610.50, expenses 126,480.00, net profit 115,130.50, outstanding 95,450.00 (period Sep–Oct 2026); Q3 VAT net payable 49,125.00. If the sample set does not add up exactly, adjust the seed (not the formulas) and note it.
- Users and roles shown on the Users screen; plans Starter/Professional/Business/Enterprise with the limits on the Billing screen.

## 9. Phased delivery (stop after each phase for review)

Each phase ends with: migrations applied, seed updated, `pnpm lint && pnpm typecheck && pnpm test` green, e2e for the new flows, screens checked in **ar + en × light + dark** against `design/screens/*.webp`, and a short summary of what was built and what's next.

1. **Foundation** — scaffold, docker-compose, Prisma setup, tokens → Tailwind, fonts, next-intl (ar default, RTL), theme, shadcn primitives themed, `src/components/zw/*` core set (Button, Badge, Input family, Amount, StatCard, InvoiceStatus, ComplianceStatus, Alert, EmptyState, Skeleton, Tabs, DataGrid, Stepper, UsageMeter), dev component gallery. *Accept:* gallery matches `design-system/previews`.
2. **Auth & tenancy** — register/login/verify email/phone OTP/reset/2FA, Organization + Membership + RBAC + RLS + audit log, org switcher. *Accept:* cross-tenant test passes; screens match `02-Auth`.
3. **Onboarding** — the 6-step wizard incl. National Address, branding, tax & numbering, workspace creation, welcome checklist. *Accept:* matches `03-Onboarding`; creates org, head-office branch, sequences, default chart of accounts.
4. **App shell + Dashboard** — Sidebar/Topbar/command menu/quick create/notifications bell, dashboard widgets with real aggregates and period filter. *Accept:* seeded numbers equal §8; matches `04-Dashboard`, `05-DashboardAR`, tablet & mobile renders.
5. **Customers & Products** — lists, profiles, editor panel, import CSV. *Accept:* `09`, `10`, `11`.
6. **Invoicing core** — create/edit draft with live bilingual preview, issue transaction, numbering, immutability, details page, PDF, share link, email, record payment, credit/debit notes, quotations, recurring. *Accept:* `06`, `07`, `08`, mobile invoice & share renders; unit tests for totals and numbering under concurrency.
7. **E-invoicing** — provider interface, MockProvider, QR (TLV) generation, submission queue, Compliance Center, device onboarding UI; then ZatcaProvider against the sandbox after reading the official docs. *Accept:* `14`; no status shown without a stored result.
8. **Expenses, Purchases, Suppliers, Payments, Banking** — incl. approval workflows engine. *Accept:* `12`, approval builder on `17`.
9. **Accounting & VAT** — chart of accounts, posting rules, journal, ledger, trial balance, P&L, balance sheet, VAT Center with boxes 1–16 and period locking. *Accept:* `13`, `16`; trial balance always balances.
10. **Reports** — report catalogue, filters, compare, save, schedule (email), export PDF/Excel/CSV. *Accept:* `15`.
11. **Users & permissions, Settings, Template designer** — permission matrix, invitations, sessions, invoice template designer with live A4 preview, numbering, email & notifications settings. *Accept:* `17`, `19`.
12. **Billing & Super admin** — plans, subscription, usage metering & limits (payment gateway behind an interface, mock in dev), `/admin` with org management, feature flags, health, tickets. *Accept:* `18`, `20`.
13. **Public site** — landing page with pricing, FAQ, legal pages, SEO, OG images. *Accept:* `01-Main`.
14. **Platform extras** — REST API v1 + API keys + webhooks + developer center, import/export centre, notifications centre, documents, org audit log, AI assistant panel (behind a feature flag), hardening (CSP, rate limits, backups doc), performance (indexes, pagination, caching), observability (structured logs, Sentry hooks).

## 10. Working agreements

- Small, reviewable commits with clear messages; never commit secrets.
- Don't invent business facts (prices, customer counts, certifications) — use the placeholders from the design.
- Prefer server components; keep client bundles small; paginate every list server-side (cursor-based).
- All dates stored as `timestamptz`/`date` in UTC with Asia/Riyadh display; optional Hijri secondary display via `Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura')`.
- When a design detail is missing, follow the closest existing screen pattern and the component docs.

**Start now with Phase 1.** First, print a short plan for Phase 1 (files you'll create, commands you'll run), then implement it.
