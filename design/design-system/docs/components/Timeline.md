# Timeline

A vertical sequence of events — the e-invoice pipeline, customer activity, audit trails.

**Props:** `items` (`[{id, title, description, time, icon, tone, state: 'pending', meta}]`), `compact`.

- Most recent first for activity feeds; chronological for pipelines.
- Future steps use `state: 'pending'`.
