# ComplianceStatus

E-invoicing result states, rendered only from real validation or platform responses.

**Props:** `status` — `not_validated` · `passed` · `warning` · `submission_pending` · `accepted` · `rejected` · `requires_action`; `variant='detailed'` for a card with `detail` (error code + description) and `meta` (time); `size`, `label`.

- Never show `accepted` unless the platform accepted the document. See the **Compliance states** section.
- Rejected/warning details lead with the rule code (`BR-KSA-37`) and a plain-language fix.
