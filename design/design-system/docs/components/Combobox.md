# Combobox

Searchable picker with descriptions, avatars and an inline "Create …" row — used for customers, products and suppliers.

**Props:** `label`, `options` (`[{value, label, description, meta, avatar, square, icon, keywords}]`), `value` / `defaultValue`, `onChange(value, option)`, `onCreate(query)` (shows the create row when nothing matches exactly), `placeholder`, `icon`, `hint`, `error`, `required`.

- Match on name, VAT number and city (`keywords`).
- Show the balance or status in `meta` so the user picks the right record.
- Keyboard: ↑/↓ to move, Enter to pick, Esc to close.
