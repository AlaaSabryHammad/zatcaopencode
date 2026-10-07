# Button

Actions — one `primary` per region, everything else `secondary` or `ghost`.

**Props:** `variant` — `primary` · `secondary` · `ghost` · `danger` · `danger-ghost` · `accent` (upgrades only) · `link`; `size` — `sm` (tables, toolbars) · `md` · `lg` (marketing, onboarding, mobile); `iconStart`, `iconEnd`, `loading`, `kbd` (shortcut hint), `fullWidth`, plus native button props. **Children:** the label — a verb first ("Create invoice").

`IconButton` takes `icon`, `label` (required — becomes the accessible name and tooltip), `variant` (default `ghost`), `size`, `badge`.

- `danger` only for irreversible actions inside a confirmation; elsewhere use `danger-ghost`.
- `loading` keeps width and disables the button; don't swap labels mid-flight except to a progressive ("Issuing…").
- Don't stack more than three buttons; move the rest into a `DropdownMenu`.
