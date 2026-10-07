ZatcaWeb is an independent cloud platform for Saudi e-invoicing, VAT and business management. The system below is how every ZatcaWeb surface looks, reads and behaves — the marketing site, onboarding, the app, the super-admin console and printed invoices. It is **Arabic-first and fully bilingual**: every rule applies in both directions unless it says otherwise.

> **Independence rule.** ZatcaWeb is not a government service. Never use the official ZATCA logo, seal, colours or the words "official", "approved by ZATCA" or "certified" in UI or marketing. Say *"Built for Saudi e-invoicing requirements"* — never *"ZATCA-compliant invoices"* as a blanket promise.

## Content fundamentals

**Voice: a calm senior accountant who also writes good software.** Precise, reassuring, never alarmist, never cute. Money and compliance are serious; the interface should lower the user's heart rate.

- Address the user as **you** (EN) and with the polite plural-neutral form in Arabic (**أنت** / imperatives like **أنشئ فاتورة**). The product speaks as **ZatcaWeb**, not "we", inside the app; marketing may use "we".
- **Sentence case** everywhere in English: "Create invoice", "VAT Center", "Record payment". Product nouns keep their capitals: *Compliance Center, VAT Center, Zatca AI*.
- Lead with the verb on actions: **Create invoice · Record payment · Send reminder · Export VAT return**. Never "Click here", "Submit", "OK".
- Numbers over adjectives: "**4 invoices** are overdue (SAR 31,200.00)" — not "Several invoices need attention".
- Errors say **what happened, why, and what to do**, in that order: *"Payment couldn't be recorded. The amount exceeds the balance due (SAR 5,425.00). Enter an amount up to the balance."*
- Compliance copy reports **facts from validation**, never promises: "Validation passed", "Accepted with 1 warning", "Rejected — BR-KSA-37". See **Compliance states**.
- No emoji in product UI or invoices. No exclamation marks except in the onboarding welcome ("Welcome to ZatcaWeb!" is the one allowed).
- Arabic is written natively, not translated word-for-word. Prefer Saudi business vocabulary: **فاتورة ضريبية، فاتورة ضريبية مبسطة، إشعار دائن، إشعار مدين، الرقم الضريبي، السجل التجاري، العنوان الوطني**.

Real examples:

| Context | English | Arabic |
| --- | --- | --- |
| Empty state | No invoices yet. Create your first invoice and start tracking your sales. | لا توجد فواتير بعد. أنشئ فاتورتك الأولى وابدأ بمتابعة مبيعاتك. |
| Insight | Your outstanding invoices increased by 18% compared with last month. | ارتفعت الفواتير المستحقة بنسبة ١٨٪ مقارنة بالشهر الماضي. |
| Destructive confirm | Cancel invoice INV-2026-00126? Cancelling creates a credit note for SAR 13,200.00. | إلغاء الفاتورة INV-2026-00126؟ سيتم إنشاء إشعار دائن بمبلغ 13,200.00 ر.س. |
| Success toast | Invoice INV-2026-00126 issued — validated and reported. | تم إصدار الفاتورة INV-2026-00126 — تم التحقق والإبلاغ. |

### Money, numbers and dates

- Show amounts with **two decimals, thousands separators and tabular figures**: `13,200.00`. Use the `Amount` component — never format money by hand.
- Currency label: **SAR** in English, **ر.س** in Arabic, **SAR / ر.س** on bilingual documents. The label follows the number at 62% size in `ink-muted`. When the product fonts include the new Saudi riyal sign (U+20C1) it may replace the label; until then use the code.
- Use **Western digits (0–9) for all financial figures in both languages** — invoices, tables, KPIs, VAT and CR numbers. Arabic-Indic digits (٠–٩) are allowed only in Arabic running prose (e.g. "خلال ٣٠ يومًا").
- Negative amounts use a true minus (−) and `danger-fg`; never parentheses in the app (reports may use accounting parentheses).
- Dates: `7 Oct 2026` in tables, `7 October 2026` in forms and documents. Arabic: `7 أكتوبر 2026`. Show the Hijri date as a secondary line where users choose it (`DatePicker showHijri`).
- Identifiers — invoice numbers `INV-2026-00124`, VAT `310123456700003`, CR, IBAN, API keys — are set in `mono`, always LTR (`dir="ltr"`), even inside Arabic sentences.

## Visual foundations

**The idea: ledger paper, Palm green, one gold pixel.** ZatcaWeb is quiet neutral surfaces with a slightly green cast, a deep **Palm** green for action and identity, and **Dune** gold used sparingly as the "spark" — the pixel in the logo, AI insights, upgrades. Structure comes from hairline borders and spacing, not heavy shadows or gradients.

### Color

- Page ground is `bg-canvas`; work happens on `bg-surface` cards. Use `bg-sunken` for table headers, read-only fields and the light sidebar; `bg-raised` + `shadow-md`/`shadow-lg` for anything floating.
- Text: `ink` for primary text and figures, `ink-secondary` for table body and labels, `ink-muted` for helper text and timestamps. All three pass 4.5:1 on every `bg-*` surface in both themes. `ink-disabled` is for disabled labels only.
- **Palm (brand)**: `brand-600` is the primary action fill with `on-brand` text; `brand-700` is its hover. `ink-brand` is for links, the active nav label and selected values. `brand-50`/`brand-100` are washes for selection and highlights; `brand-900` is the deep ground for the hero KPI, marketing bands and the AI button, with `on-brand-deep` text.
- **Dune (accent)**: `accent-500` fill with `on-accent` text — upgrade buttons, the logo pixel, chart series 2. `accent-100` + `accent-700` for AI/"smart" insights. Never use Dune for status.
- **One primary button per view region.** Everything else is `secondary` or `ghost`.
- **Status colors are reserved for state**: `success-*` (paid, accepted), `warning-*` (partially paid, warnings, requires action), `danger-*` (overdue, rejected, destructive), `info-*` (pending, sent, submission pending), `neutral-*` (draft, not validated, cancelled). Pair each `*-fg` with its `*-bg`. **Every status carries an icon and a word** — never colour alone.
- In charts, success and danger are separated by lightness (`success-fill` vs `danger-fill`, ≥3:1 in both themes) so paid/overdue stay distinguishable for colour-blind users.
- Dark mode is a designed theme, not an inversion: surfaces step up in lightness (`bg-canvas` → `bg-surface` → `bg-raised`), Palm turns into a lighter mint for fills (`brand-600` dark) with dark `on-brand` text, and `brand-900` stays a deep green ground.
- Never use gradients for brand surfaces. The only gradient is the skeleton shimmer.

### Typography

- **English: Inter** (variable). **Arabic: IBM Plex Sans Arabic**. **Identifiers: IBM Plex Mono.** The `sans` stack lists Inter then Plex Arabic, so mixed strings ("شركة البناء الحديث — INV-2026-00124") render each script in its own face automatically. Use `arabic` as the primary family when the interface language is Arabic.
- Scale: `display-xl`/`display-lg` (marketing only), `h1` page titles, `h2` card and dialog titles, `h3`/`h4` sub-sections, `body` (default 14px app text), `body-sm` dense tables, `caption` badges and chart labels, `overline` English kickers.
- Arabic gets its own styles — `ar-h1`, `ar-h2`, `ar-body`, `ar-body-sm`, `ar-label` — one step larger with ~1.35× leading, so both scripts look the same optical size. Never apply `overline` or uppercase/letter-spacing to Arabic.
- All figures use `num-*` styles or `.zw-tnum` (tabular numbers): `num-hero` grand totals, `num-kpi` KPI cards, `num-table` amount columns.
- Weights: 400 body, 500–550 labels and table primaries, 600 headings, 650 display. Never use 300 or lighter in the app.

### Spacing, layout and density

- 4px grid: `space-1` (4) → `space-24` (96). Card padding `space-6` (`space-5` for compact/KPI cards), gaps between dashboard cards `space-6`, page gutter `space-8` on desktop, `space-6` tablet, `space-4` mobile.
- App frame: sidebar `sidebar-width` (264px, collapses to `sidebar-collapsed`), top bar `topbar-height` (64px), content max `content-max` (1440px).
- Controls: `control-md` (40px) default, `control-sm` (32px) in tables/toolbars, `control-lg` (48px) for marketing CTAs, onboarding and mobile primary actions (≥44px touch targets on mobile).
- Breakpoints: **≥1280 desktop** (sidebar expanded), **1024–1279 laptop** (sidebar collapsible), **640–1023 tablet** (sidebar becomes a drawer), **<640 mobile** (single column, bottom sheets, search as icon).
- Dashboards mix forms — one emphasis KPI, plain KPIs, a wide chart, a list, an insight — never a wall of identical cards. Leave whitespace; don't fill every column.

### Shape, borders and elevation

- Radii: `radius-xs` checkboxes and QR modules · `radius-sm` badges and menu items · `radius-md` buttons and inputs · `radius-lg` cards, popovers, toasts · `radius-xl` dialogs, drawers, invoice paper · `radius-2xl` marketing panels and mobile sheets · `radius-full` avatars, switches, pills.
- Cards = `bg-surface` + 1px `border-default` + `shadow-sm`. Floating layers = `bg-raised` + `shadow-md` (menus) or `shadow-lg` (dialogs, command menu).
- Control borders use `border-control` (3:1 against the surface); purely decorative dividers use `border-subtle`/`border-default`.

### Interaction states and motion

- Hover: `bg-hover` fill on rows, nav items and ghost buttons; primary buttons darken to `brand-700`.
- **Focus: a solid 2px `border-focus` ring with a 2px surface gap** on every focusable element (≥3:1 on all surfaces, both themes). Inputs show the ring colour on their border plus a soft glow. Never remove focus outlines.
- Selected: `bg-selected` with `ink-brand` text. Disabled: 50% opacity and `not-allowed` cursor; disabled controls must still explain why via tooltip when the reason isn't obvious.
- Loading: skeletons that mirror the final layout (never a page-level spinner); buttons show an inline spinner and keep their width.
- Motion is short and purposeful: 120ms for hover/press, 200ms for popovers, dialogs and drawers, easing `cubic-bezier(.2,.8,.2,1)`. Drawers slide from the inline-end edge (right in LTR, left in RTL). Respect `prefers-reduced-motion`.
- Use optimistic updates for low-risk actions (marking as sent, tagging) and confirm dialogs for irreversible ones (issuing, cancelling, deleting). Issued tax invoices are never deleted — they are cancelled with a credit note.

## Iconography

- **Lucide** line icons, 24px grid, **1.75px stroke**, round caps and joins; rendered at 16px (dense), 18px (default) and 20–24px (empty states, feature tiles). The bundle's `Icon` component carries the curated set (`ZatcaWeb.ICON_NAMES`); the Icons asset group holds SVG copies in `ink`.
- Icons inherit `currentColor`. In nav and menus they sit in `ink-muted`, turning `ink-brand` when active.
- **Mirror only directional icons in RTL** (arrows, chevrons, send, log-out, panel-left). Never mirror the QR code, clocks, checkmarks, charts' trend arrows, logos or brand marks. `Icon` handles this automatically.
- No emoji, no filled/duotone icon mixing, no illustrations of people. Empty-state art is built from brand shapes (invoice sheet, QR modules, discs) via `EmptyState`.

## Logo

- The mark is a Palm tile (`logo-tile`) holding a **Z built from ledger bars**, its top-right corner replaced by a **Dune pixel** (`accent-500`) — a QR module and a stamp at once. The wordmark sets **Zatca** in Inter Bold `ink` and **Web** in Inter Medium `brand-600`, outlined so it never depends on installed fonts.
- Use `Logo` in product (it follows the theme). Files: `zatcaweb-wordmark.svg` on light grounds, `zatcaweb-wordmark-reversed.svg` on dark grounds, `zatcaweb-wordmark-ar.svg` for Arabic surfaces (mark on the right), `zatcaweb-mark.svg` for favicons and avatars, `zatcaweb-app-icon.svg` for app stores.
- Clear space = half the mark's height on every side. Minimum size: mark 16px, wordmark 96px wide.
- Never recolour, stretch, outline, add effects or place the mark next to government emblems.

## Components at a glance

Build screens from the bundle (`window.ZatcaWeb`): **AppShell** (Sidebar + Topbar + content + Ask Zatca AI), **PageHeader**, **StatCard**, **Chart**, **DataGrid**/**Table**, **InvoiceStatus**/**ComplianceStatus**/**QuoteStatus**, **QrPanel**, form fields (**Input**, **Select**, **Combobox**, **DatePicker**, **CurrencyInput**, **VatInput**, **PhoneInput**, **FileUpload**, **Checkbox**, **Switch**), overlays (**Dialog**, **Drawer**, **DropdownMenu**, **CommandMenu**, **Tooltip**, **Toast**), feedback (**Alert**, **Insight**, **EmptyState**, **Skeleton**, **UsageMeter**) and navigation (**Tabs**, **SegmentedControl**, **Breadcrumb**, **Pagination**, **Stepper**, **Accordion**, **OrgSwitcher**). Wrap a subtree in `LocaleProvider lang="ar"` to switch built-in strings and direction. Each component's guidelines say what the consumer provides.
