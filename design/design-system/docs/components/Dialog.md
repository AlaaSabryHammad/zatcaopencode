# Dialog

Modal for confirmations and short focused tasks; focus is trapped and returned.

**Props:** `open`, `onClose`, `title`, `description`, `children` (body), `footer` (buttons, primary last), `tone` (`danger` → alertdialog with icon; `info`, `warning`, `success`), `icon`, `size` (`sm` · `md` · `lg`), `dismissable={false}`, `contained` (render inside a positioned parent).

- Destructive dialogs name the object and the consequence ("creates a credit note for SAR 13,200.00"). Focus starts on the first field, never the destructive button.
- On mobile, dialogs become bottom sheets.
