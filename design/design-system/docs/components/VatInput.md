# VatInput

Saudi VAT registration number field: 15 digits, starting and ending with 3, with live format feedback.

**Props:** `label`, `value` / `defaultValue`, `onChange(digits)`, `hint`, `error`, plus Input props. `ZatcaWeb.isVatFormat(v)` exposes the same check.

- This is a format check only — it does not prove the number is registered. Don't show it as "verified".
- Always LTR and monospaced.
