# Toast

Transient confirmation or error after an action, with an optional undo/view action.

**Props:** `tone` (`success` · `danger` · `warning` · `info` · `neutral` · `loading`), `title`, `description`, `action` (`{label, onClick}`), `onClose`. `ToastStack` renders a list (`toasts`) at the inline-end bottom corner (`contained` for inline demos).

- Success toasts auto-dismiss after 5s; danger toasts stay until dismissed.
