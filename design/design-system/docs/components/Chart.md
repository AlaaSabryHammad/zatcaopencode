# Chart

Dependency-free SVG charts — bar, stacked, line, area, donut — with tooltips, legends, a table view and RTL mirroring.

**Props:** `type`, `data` (array of objects; donut: `[{label, value, color}]`), `xKey` (default `'label'`), `series` (`[{key, label, color: token name, dashed}]`), `format` (`'currency'` · `'number'` · `'percent'`), `height`, `title`, `subtitle`, `legend={false}`, `tableToggle`, `centerLabel`/`centerValue` (donut), `mirror={false}`.

- Series colours follow `chart-1`…`chart-5` in order; status breakdowns use status fills. See **Data, tables & charts**.
- No dual axes. Five donut slices max.
