# Input

Text field with label, hint, error, affixes and icons — the base for every form control.

**Props:** `label`, `hint`, `error` (replaces the hint, announced to screen readers), `required` / `optional`, `labelAside` (e.g. a character count or link), `prefix` / `suffix` (text in a sunken cell), `iconStart` / `iconEnd`, `size` (`sm` · `md` · `lg`), `mono` (identifiers), `align='end'` (numbers), plus native input props.

- Labels sit above fields, never as placeholders. Placeholders show format examples only (`billing@company.sa`).
- Validate on blur, re-validate on change once an error is showing. Error text says how to fix it.
- Identifiers (CR, IBAN, PO) use `mono` and `dir="ltr"`.
