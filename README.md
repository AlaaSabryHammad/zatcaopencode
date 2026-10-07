# ZatcaWeb

Bilingual (Arabic-first RTL + English), multi-tenant SaaS for Saudi businesses: e-invoicing, sales, purchases,
expenses, VAT, accounting and reporting. The design handoff lives in [`design/`](design/README.md) (read-only).
The build plan is in [`design/CLAUDE_CODE_PROMPT.md`](design/CLAUDE_CODE_PROMPT.md).

> ZatcaWeb is an independent platform and is not affiliated with ZATCA or any government entity.

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind CSS + Radix (shadcn/ui) · next-intl (ar default, en) ·
next-themes · PostgreSQL 16 + Prisma · Redis/BullMQ · MinIO (S3) · Mailpit · Vitest · Playwright · pnpm.

## Getting started

```bash
corepack enable            # or: npm i -g pnpm
pnpm install
cp .env.example .env       # fill APP_ENCRYPTION_KEY, AUTH_SECRET
docker compose up -d       # Postgres, Redis, MinIO, Mailpit
pnpm db:migrate            # first time: pnpm db:migrate --name init
pnpm db:seed
pnpm dev                   # http://localhost:3000 → /ar
```

- Component gallery (dev only): http://localhost:3000/en/dev/components
- Mailpit: http://localhost:8025 · MinIO console: http://localhost:9001

## Scripts

| Script                                          | Purpose                                                                   |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| `pnpm dev` / `build` / `start`                  | Next.js                                                                   |
| `pnpm lint` · `typecheck` · `test` · `test:e2e` | Quality gates (all must be green per phase)                               |
| `pnpm db:migrate` · `db:seed` · `db:studio`     | Prisma                                                                    |
| `pnpm icons:sync`                               | Re-sync tokens, component CSS, icons, logo paths and fonts from `design/` |

## Layout

```
design/                     design handoff (read-only)
messages/{ar,en}.json       all UI strings (component strings under "zw")
prisma/                     schema, migrations, seed
src/app/[locale]/…          routes (marketing, auth, onboarding, app/[orgSlug], admin)
src/components/zw/          ZatcaWeb design system (typed port of the reference bundle)
src/i18n/                   next-intl routing + request config
src/server/                 db (tenant-scoped), auth, rbac, audit, modules, e-invoicing, jobs
tests/unit · tests/e2e
docs/DECISIONS.md           decisions log
```

## Rules of the road

- Semantic tokens only (`bg-surface`, `text-fg-muted`…); logical utilities only (`ms-`, `pe-`, `start-`, `text-start`).
- Money: `Amount` for display, `decimal.js` for math, `NUMERIC(18,2)` in the DB. Identifiers render LTR in mono.
- `ComplianceStatus` shows only results stored from real validation/submission — never "accepted" by default.
- Every tenant query goes through `withTenant()` with the org id from the session, never from request input.
