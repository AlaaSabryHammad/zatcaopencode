# InvoiceStatus

The invoice lifecycle badge: draft, pending, issued, sent, viewed, partially paid, paid, overdue, cancelled, credited.

**Props:** `status` (one of the ten keys, e.g. `'partially_paid'`), `size`, `label` to override the text. Wording comes from the locale (EN/AR).

- Lifecycle ≠ compliance: show `ComplianceStatus` in its own column.
- `overdue` is computed from the due date and balance, never set by hand.
