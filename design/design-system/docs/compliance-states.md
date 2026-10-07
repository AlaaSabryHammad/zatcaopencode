# Compliance states

ZatcaWeb must **never visually claim an invoice is compliant because the UI generated it**. Every compliance badge, check, QR and banner reflects a result returned by validation or by the e-invoicing platform — and the absence of a result is shown as such.

## The state model

Use `ComplianceStatus` with exactly these values. The colour, icon and wording are fixed; don't invent synonyms.

| Value | English | Arabic | Tone | Meaning |
| --- | --- | --- | --- | --- |
| `not_validated` | Not validated | لم يتم التحقق | neutral | No validation has run (drafts, imported history). |
| `passed` | Validation passed | اجتاز التحقق | success | Local schema and business-rule checks passed. Not yet a platform result. |
| `warning` | Warning | تحذير | warning | Accepted or passable, with warnings the user should fix on future invoices. |
| `submission_pending` | Submission pending | بانتظار الإرسال | info | Queued for reporting/clearance; retrying automatically. |
| `accepted` | Accepted | مقبولة | success | The platform accepted (reported or cleared) the document. |
| `rejected` | Rejected | مرفوضة | danger | The platform rejected it. The invoice is not valid until corrected and resubmitted. |
| `requires_action` | Requires action | يتطلب إجراء | warning | Blocked on the user: missing data, expired certificate, device not onboarded. |

Invoice lifecycle status (`InvoiceStatus`: draft → pending → issued → sent → viewed → partially paid → paid / overdue, plus cancelled and credited) is **separate** from compliance status. Show both side by side in lists; never merge them into one badge.

## Rules

- **Only show "Accepted" when the platform said so.** `passed` is the strongest state the app can assign by itself.
- The QR code appears **only after issue and validation**. Before that, `QrPanel` shows a dashed placeholder ("Generated on issue").
- Production QR payloads, hashes and signatures come from the backend signing step. `ZatcaWeb.tlvBase64()` builds the basic TLV (tags 1–5) for demos and sample data only.
- Standard tax invoices (B2B) may require clearance before they are shared; simplified invoices (B2C) are reported after issue. Label the step "Reporting / clearance" and let the configured flow decide which applies.
- Rejected and warning results always show the **error code, plain-language description, affected invoice, recommended action and a Retry** control. Never show a raw JSON payload as the primary message; offer it behind "Technical details".
- Regulatory rules change. Keep wording, rule codes and requirements in configuration, not hard-coded in components; the components only render the state they are given.

## Lifecycle timeline

Render the e-invoice pipeline with `Timeline`: **Invoice created → Validated → Signed → QR generated → Processed → Accepted / Warning / Rejected**. Completed steps use `success` (or `brand` for creation), the current step `info`, future steps `state: 'pending'`, failures `danger` with the error code in `description`.

## Compliance Center tone

- Status first, then counts, then logs. The top of the Compliance Center answers one question — *"Is anything blocking my invoices?"* — with a `ComplianceStatus variant="detailed"` card.
- Certificate expiry warnings start 30 days out (`Alert tone="warning"`) and become `danger` at 7 days.
- Audit every compliance-affecting action (device onboarding, certificate renewal, resubmission) in the audit log with user, time, IP and before/after values.
