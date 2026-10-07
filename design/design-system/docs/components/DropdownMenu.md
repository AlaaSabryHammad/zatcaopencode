# DropdownMenu

Action menu for overflow actions, quick create and row menus.

**Props:** `trigger` (a Button/IconButton element), `items` (`[{label, icon, shortcut, description, danger, disabled, onSelect}]`, `{divider: true}`, `{heading}`), `align` (`'start'` · `'end'`), `width`, `header`.

- Destructive items go last, after a divider. Arrow keys move focus; Esc closes.
