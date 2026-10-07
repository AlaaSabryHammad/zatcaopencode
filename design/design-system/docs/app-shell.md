# App shell & navigation

## Multi-tenant model

Every registered organization gets an isolated workspace — its own users, customers, products, invoices, expenses, reports and settings. A person can belong to several organizations with a different role in each.

- The **OrgSwitcher** sits at the bottom of the sidebar and always shows the current organization's name and the user's role/plan in it. Switching reloads the workspace; never mix data from two organizations on one screen.
- Organization identity uses a **square** `Avatar` (people use round ones). Show the organization's VAT number in the switcher so look-alike names can be told apart.
- The super-admin console is a separate product surface: it uses the same system but an `ink`-dark sidebar header strip and a persistent "Platform admin" badge, so operators never confuse it with a tenant workspace. Every admin action on an organization is confirmed and logged.

## Shell anatomy

- `AppShell` = `Sidebar` (inline-start) + `Topbar` + scrolling content + the floating **Ask Zatca AI** button.
- **Sidebar** groups: Dashboard · *Sales* (Invoices, Quotations, Credit & debit notes, Recurring, Customers, Payments) · *Purchases* (Purchases, Expenses, Suppliers, Products & services, Inventory) · *Finance* (Reports, Accounting, VAT Center, E-Invoicing) · *Workspace* (Branches, Users & roles, Integrations, Notifications, Settings, Help & support). Favorites pin above the groups; the plan meter and OrgSwitcher sit at the bottom.
- Nav badges count things that need action (unpaid, rejected) — `danger` tone only for blocking problems.
- **Topbar**: breadcrumbs (or page title) · global search trigger (`⌘K` / `Ctrl K`) · Quick create (`N`) · notifications · language (ع / EN) · theme · help · user.
- The sidebar collapses to icons on laptops and becomes a drawer below 1024px. On mobile, primary actions (New invoice, Add expense) live in a bottom action bar.

## Finding things

- **Command menu (`⌘K`)** searches invoices, customers, products, payments, settings and reports, and runs actions ("Create invoice", "Open VAT report", "Switch organization", "Change theme"). Results are grouped by category; each row shows an icon, a muted second line and its shortcut.
- **Quick create** offers: New invoice (N), New quotation (Q), New customer (C), New product (P), New expense (E), New supplier, Record payment (R).
- Breadcrumbs appear on every page deeper than a section root. Recently visited items show in the command menu when the query is empty.

## Page pattern

1. `PageHeader` — kicker (breadcrumb or date), title, one-line description with a real number, actions on the inline-end (one primary).
2. Filters row (period `SegmentedControl`, `FilterChip`s).
3. Content: KPIs → primary chart/table → secondary lists. Detail pages put the document preview on the main column and status, payments and activity (`Timeline`) in a side column.
4. Destructive and irreversible actions live in an overflow `DropdownMenu`, last, in `danger` styling, behind a `Dialog`.
