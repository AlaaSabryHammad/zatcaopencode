# Data, tables & charts

ZatcaWeb is used by owners on phones and accountants for hours at a desk. Tables and charts are the product; treat them with the same care as the logo.

## Tables

- Use `DataGrid` for any list a user works through (invoices, customers, products, payments, logs): search, filter chips, bulk actions, sticky header, pagination and selection are built in. Use `Table` inside cards for short read-only lists (≤ 8 rows).
- Column order: **identifier → party → dates → statuses → amount**. The amount column is always last and end-aligned, rendered with `Amount`.
- Identifiers in `mono`; the party column pairs an `Avatar` (square for companies) with the name and a muted second line (branch, city or VAT).
- Show status as badges (`InvoiceStatus`, `ComplianceStatus`), never as coloured text.
- Row height 56px default; `density="compact"` (44px) for accountant views. Cells don't wrap — the grid scrolls horizontally on narrow screens; on mobile, switch to a card list.
- Totals go in a `tfoot` row on `bg-sunken`. Selected rows use `bg-selected`; bulk actions replace the toolbar while rows are selected.
- Empty, loading and error states are mandatory: `EmptyState` (with a create action) for no data, skeleton rows for loading, `Alert tone="danger"` with retry for failures.

## Choosing a chart

| Question | Form |
| --- | --- |
| One headline number | `StatCard` (no chart) — optionally a sparkline |
| Change over time | `Chart type="line"` or `"area"` (cash flow) |
| Compare periods / categories | `Chart type="bar"` (grouped) |
| Part of a whole, ≤ 5 parts | `Chart type="donut"` with a value legend |
| Composition over time | `Chart type="stacked"` |
| Exact values matter | Table, or `tableToggle` on the chart |

Never use dual y-axes, 3D, or pie charts with more than five slices (fold the rest into "Other").

## Color in charts

- Series take `chart-1` … `chart-5` **in that fixed order** (validated for colour-vision deficiency in both themes). `chart-1` (Palm) is always the business's own primary measure — revenue, sales.
- Expenses and purchases use `chart-3`; comparison periods use `chart-2` or a dashed line of the same series.
- Status breakdowns use status fills (`success-fill`, `chart-2` for unpaid, `danger-fill`, `neutral-fg` for drafts) — never the categorical order.
- Text in charts (axis labels, values, legends) stays in `ink`, `ink-secondary` or `ink-muted` — never in the series colour.
- Gridlines use `chart-grid`; the baseline uses `border-default`.

## Marks and interaction

- Bars: max 18px wide per series, 4px rounded data end, 2px gap between grouped bars. Lines: 2px, round joins; markers only on hover.
- Every chart has a hover/focus tooltip listing each series' value with currency; line and area charts show a crosshair.
- Two or more series always show a legend above the plot. Donuts list every segment with value and percentage.
- Axis values use compact notation (`150K`); tooltips and tables show full values (`150,000.00 SAR`).
- Filters for a chart sit in one row above it (`SegmentedControl` for period, `FilterChip` for dimensions); the dashboard period control filters all charts on the page.

## AI answers

Answers from Zatca AI use the same components: a sentence with the key number in bold, then a `StatCard`, `Chart` or `Table`, then suggested actions as buttons. Actions that change data (create invoice, send reminders) open a confirmation step before running.
