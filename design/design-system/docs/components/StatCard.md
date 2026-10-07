# StatCard

A KPI tile: label, value, delta versus the previous period and an optional sparkline.

**Props:** `label`, `value` (number → formatted as money; string → shown as-is), `currency={false}` for counts, `size` (`'kpi'` default, `'hero'`), `icon`, `tone` (icon tint), `delta` (percent), `invert` (rising is bad — overdue, expenses), `footnote`, `trend` (number array), `trendTone`, `emphasis` (deep green hero tile — one per dashboard), `info` (tooltip), `loading`.

- Mix one emphasis tile with plain ones; don't build a wall of identical tiles.
- Deltas always state the comparison ("vs last month").
