# DatePicker

Gregorian date field with a calendar popover, optional Hijri secondary date and quick presets.

**Props:** `label`, `value` / `defaultValue` (ISO `yyyy-mm-dd`), `onChange(iso)`, `showHijri` (Umm al-Qura date in the hint and calendar header), `presets` (`[{label, value}]`, e.g. due-date terms), `today` (ISO, for testing), `placeholder`, `size`, `hint`, `error`.

- Store and send ISO dates; display via the component ("7 October 2026" / "7 أكتوبر 2026").
- Due-date fields offer the customer's payment terms as presets.
