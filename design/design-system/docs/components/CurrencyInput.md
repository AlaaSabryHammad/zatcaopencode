# CurrencyInput

Money field: raw while typing, formatted to two decimals on blur, with the SAR / ر.س tag.

**Props:** `label`, `value` / `defaultValue` (number), `onChange(number|null)`, `decimals` (default 2), `currencyDisplay` (`'both'` for bilingual), plus Input props.

- Value is a number, never a formatted string.
- Amounts are end-aligned and tabular.
