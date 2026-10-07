# Table

A sortable, selectable table for read-only lists inside cards; `DataGrid` wraps it for full list screens.

**Props:** `columns` (`[{key, header, align: 'end'|'center', width, sortable, sortValue, numeric, mono, render(row)}]`), `rows`, `rowKey` (default `'id'`), `selected` + `onSelectedChange` (enables checkboxes), `onRowClick`, `density='compact'`, `stickyHeader`, `loading`, `empty`, `defaultSort`, `footer` (tfoot rows), `caption` (screen readers), `maxHeight`.

- Amount column last, end-aligned, rendered with `Amount`.
- Cells don't wrap; the wrapper scrolls horizontally.
