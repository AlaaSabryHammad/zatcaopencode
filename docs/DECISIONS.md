# Decisions log

Choices made where the design handoff (`design/`) or the build prompt was ambiguous, or where the
environment forced a trade-off. Newest first within each phase.

## Phase 1 — Foundation

### D-001 · Component styling: verbatim reference CSS + Tailwind for layout

The prompt asks to re-implement components "with Tailwind + shadcn/ui so they look and behave the same".
The reference `bundle.css` (≈700 rules) is already token-only (`var(--…)`) and uses logical properties
throughout. Rewriting it as utility classes would risk visual drift with no user benefit.

- `scripts/sync-design-assets.mjs` copies `bundle.css` **verbatim** to `src/components/zw/styles/zw-components.css`.
- Components are typed TSX ports of `bundle.js` with the same `zw-*` markup and the props from `index.d.ts`.
- `zw-overrides.css` holds the few adjustments the port needs: Radix popper positioning, valid button nesting
  in `FilterChip`, a `<button>` reset for sidebar disclosure items, and a skip link.
- **Tailwind** is mapped to the same tokens (`tailwind.config.ts`) and is used for page layout and composition.
  App code uses semantic names only (`bg-surface`, `text-fg-muted`, `border-border`) — never raw hex.
- **shadcn/ui (Radix)** primitives back the overlays that need real a11y behaviour: `Dialog`, `Drawer`,
  `CommandMenu` (Radix Dialog), `DropdownMenu` (typeahead, collision handling) and `Tooltip`.
  `Combobox`, `DatePicker` and `OrgSwitcher` keep the reference's anchored popovers (ARIA combobox/listbox
  patterns), which are simpler and visually identical.

### D-002 · Icons: design-system icon set (Lucide geometry) behind `<Icon name>`

`index.d.ts` defines `Icon({ name: string })` and `ICON_NAMES`. The 102 curated Lucide nodes are extracted
from `bundle.js` into `icon-nodes.ts` (same 1.75px stroke and auto RTL-mirroring of directional icons).
`lucide-react` is installed too, for one-off icons outside the curated set — use the same stroke width (1.75).

### D-003 · Fonts via `next/font/local`, token stacks preserved

Fonts are copied to `public/fonts/` and loaded with `next/font/local` (self-hosted, preloaded, no layout shift).
`next/font` generates hashed family names, so `globals.css` prepends its CSS variables to `--font-sans`,
`--font-arabic` and `--font-mono`. The original family names remain in each stack as fallbacks. No other
token value changed. `tokens.css` is copied unchanged except that its `@font-face` rules are removed.

### D-004 · Built-in component strings in `messages/*.json` (`zw` namespace)

The reference keeps strings (search, pagination, status labels, QR steps, month names) inside the bundle.
To meet "no hard-coded UI text" they live in `messages/{ar,en}.json` under `zw`. Components read them with
`useTranslations('zw')`, so a nested `NextIntlClientProvider` switches both language and direction.
`LocaleProvider` sets `dir`/`lang` and the Arabic type metrics. A unit test enforces key parity between ar and en.

### D-005 · Chart deferred to Phase 4 (Recharts)

The stack calls for Recharts. Chart is not in the Phase 1 core set and is only used on data screens, so it will
be built in Phase 4 on Recharts with the chart tokens, RTL mirroring (latest period on the left, y-axis on the
right) and the reference API (`type`, `series`, `format`, `tableToggle`, donut centre label). The gallery shows
a placeholder until then.

### D-006 · DataGrid: client-side now, server-driven in Phase 5

`DataGrid` matches the reference: client-side search, sort, selection and pagination. Real lists need
server-side cursor pagination, so Phase 5 adds a server-driven mode built on TanStack Table with the same
visual shell and the same loading, empty and error states.

### D-007 · Negative amounts default to `danger-fg`

DESIGN_SPEC §1 requires "true minus + danger-fg" for negative money, but the reference `Amount` only colours
a negative when `tone` is passed. The port applies `danger` automatically to negatives unless a `tone` is given.

### D-008 · Breakpoints follow the design, not Tailwind defaults

`sm` 640 · `md` 1024 · `lg` 1280 · `xl` 1440 (DESIGN_SPEC §1). This means `md:` = laptop/sidebar-visible.

### D-009 · Database roles for RLS

`docker/postgres/init.sql` creates `zatcaweb_owner` (runs migrations, owns tables) and `zatcaweb_app`
(NOSUPERUSER, NOBYPASSRLS, DML only). The Prisma CLI uses `DATABASE_MIGRATION_URL`. The runtime client uses
`DATABASE_URL` (app role), so RLS policies (Phase 2) cannot be bypassed by the app.
`withTenant()` in `src/server/db.ts` sets `app.org_id` with `set_config(..., true)` (≡ `SET LOCAL`) in each
transaction.

### D-010 · Local environment

The development machine has no Docker and no admin rights. PostgreSQL 16.15 runs from the official EDB
portable binaries under `%LOCALAPPDATA%\Programs\PostgreSQL16`:

- data directory: `data\`, scram-sha-256 auth, UTF-8, `localhost:5432`
- `start-postgres.cmd` / `stop-postgres.cmd`, plus a logon starter in the Windows Startup folder
- superuser password in `superuser-password.txt` (local only, never committed)

Roles and databases match `docker/postgres/init.sql`. One difference: locally `zatcaweb_owner` is NOSUPERUSER
with CREATEDB, while in Docker it is the image's superuser. This stricter local setup is fine for migrations.
The `init` migration is applied. `docker-compose.yml` remains the reference setup for other machines and CI.

### D-011 · Gallery fixtures

`/[locale]/dev/components` ports every `design-system/previews/*.html` demo with the same props and fixture
data (`samples.ts`). Fixture text is sample data, not product copy, so it is not in `messages/`. Each demo
can be shown in ar/en × light/dark, using `data-theme` scoping (tokens are attribute-scoped).
The route returns 404 in production unless `ENABLE_DEV_GALLERY=true`.
