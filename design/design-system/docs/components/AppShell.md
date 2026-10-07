# AppShell

The full app frame: sidebar, top bar, scrolling content and the floating Ask Zatca AI button.

**Props:** `sidebar` (a `Sidebar`), `topbar` (a `Topbar`), `children` (page content), `height`, `assistant={false}` to hide the AI button, `onAssistant`.

- Below 1024px the sidebar becomes an off-canvas drawer (`.is-open`).
