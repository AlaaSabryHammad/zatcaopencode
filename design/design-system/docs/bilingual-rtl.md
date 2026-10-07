# Bilingual & RTL

Arabic is the primary language; English is a full peer. Design every screen in both — never ship an English layout and "flip it".

## Direction

- Set `dir` and `lang` on the root (`<html dir="rtl" lang="ar">`) or wrap a subtree in `LocaleProvider lang="ar"`. Components read the locale for built-in strings (search, pagination, statuses) and the date picker.
- Write CSS with **logical properties only**: `margin-inline-start`, `padding-inline`, `inset-inline-end`, `border-inline-start`, `text-align: start`. Never `left`/`right` in component styles.
- The sidebar sits on the inline-start edge: **left in English, right in Arabic**. Drawers open from the inline-end edge. The Ask Zatca AI button sits at the inline-end bottom corner.
- Mirror layout order, not content: in Arabic the KPI row, table columns, breadcrumbs, steppers and form label alignment all start from the right.
- **Do not mirror**: the QR code, the logo, media controls, clocks, phone numbers, IBANs, invoice/VAT/CR numbers, code and API keys (always `dir="ltr"`), and checkmarks.
- **Mirror** directional icons (arrows, chevrons, send, back/forward, panel toggles). `Icon` does this for the known directional set.
- Time-series charts run right-to-left in Arabic (latest period at the left end, y-axis on the right). `Chart` mirrors automatically; pass `mirror={false}` for a chart embedded in an English export.

## Type and spacing per script

- Arabic body text is one step larger (`ar-body` 15/26 vs `body` 14/22) and every Arabic style carries ~1.35× leading — Arabic ascenders/descenders need it.
- Never apply uppercase, `overline` or letter-spacing to Arabic. English kickers in uppercase become plain `ar-label` in Arabic.
- Arabic labels run ~20–30% shorter or longer than English; size buttons by padding, never fixed widths. Test truncation in both languages.
- Mixed strings (an Arabic customer name in an English table, an invoice number in Arabic copy) are normal: the `sans` stack renders each script in its own face. Wrap identifiers in `dir="ltr"` so punctuation doesn't jump.

## Numbers and currency

- Financial figures use Western digits in both languages and always render LTR (`Amount` sets `dir="ltr"`). Alignment follows the reading direction: amount columns are end-aligned (right in LTR, left in RTL).
- Currency: `SAR` (EN), `ر.س` (AR), `SAR / ر.س` on bilingual invoices.
- Percentages: `15%` in data, `١٥٪` allowed in Arabic prose.

## Bilingual documents

- Tax invoices default to **bilingual Arabic + English**: Arabic block on the right, English on the left, shared tables with two-line headers (`الكمية / Qty`). Templates also offer Arabic-only and English-only.
- Customer and product records store both names (`Name (Arabic)`, `Name (English)`); invoices print whichever the template language requires and fall back to the other.
