# Sidebar

Primary app navigation with grouped, collapsible sections, favorites, plan meter and the organization switcher.

**Props:** `sections` (`[{heading, items: [{id, label, icon, badge, badgeTone, children: [{id, label, badge}]}]}]`), `active` (id), `onNavigate(id)`, `collapsed`, `onToggle`, `favorites` (`[{id, label}]`), `plan` (`{name, badge, used, limit, meter}`), `orgs`, `currentOrg`, `onSwitchOrg`.

- Sits on the inline-start edge: left in English, right in Arabic. See **App shell & navigation** for the canonical group order.
