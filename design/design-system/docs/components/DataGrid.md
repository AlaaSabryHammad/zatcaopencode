# DataGrid

The full list experience: search, filter chips, bulk actions, selection, sorting and pagination.

**Props:** `columns`, `rows`, `rowKey`, `searchKeys`, `searchPlaceholder`, `filters` (`FilterChip` elements), `actions` (toolbar buttons — one primary), `bulkActions` (`[{label, icon, danger, onClick(ids)}]`), `pageSize`, `onRowClick`, `density`, `loading`, `empty`, `selectable={false}`, `defaultSort`.

`FilterChip` takes `label`, `value`, `icon`, `active`, `onClick`, `onRemove`.

- Bulk actions replace the toolbar while rows are selected.
- Server-side data: pass the current page's rows and drive search/pagination from your API.
