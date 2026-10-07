# FileUpload

Drop zone plus file list with progress, success and error rows — receipts, attachments, imports.

**Props:** `label`, `hint` (types and size limit), `accept`, `multiple`, `icon` (`scan-line` for receipts), `compact` (one-line zone), `files` (`[{name, size, status: 'uploading'|'done'|'error', progress, error}]`), `onFiles(FileList)`.

- Errors name the row or reason ("Row 14: VAT number must be 15 digits").
- Keyboard: Enter/Space opens the picker.
