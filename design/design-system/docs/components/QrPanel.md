# QrPanel

The invoice QR block with its step-by-step status: generated, validated, compliance, reporting/clearance.

**Props:** `payload` (base64 TLV from the backend — omit before issue to show the placeholder), `steps` (`{generated, validated, compliance, reporting}` each a `ComplianceStatus` value), `size`, `footnote`.

`QrCode` renders any string as a QR (`value`, `size`, `level`); `ZatcaWeb.tlvBase64({seller, vat, timestamp, total, vatTotal})` builds the tags 1–5 TLV for sample data.

- The QR is always dark-on-white, even in dark mode, so it scans.
- Never render a QR for a draft.
