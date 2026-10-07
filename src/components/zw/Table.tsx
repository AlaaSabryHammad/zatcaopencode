'use client';

import * as React from 'react';
import { cx } from './lib/cx';
import { useZwT } from './lib/locale';
import { Icon } from './Icon';
import { Button } from './Button';
import { Checkbox, Input } from './Field';
import { EmptyState, Skeleton } from './Display';
import { Pagination } from './Navigation';

type RowId = string | number;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

export interface TableColumn<R = AnyRow> {
  key: string;
  header: React.ReactNode;
  align?: 'start' | 'end' | 'center';
  width?: number | string;
  sortable?: boolean;
  sortValue?: (row: R) => number | string;
  numeric?: boolean;
  mono?: boolean;
  render?: (row: R) => React.ReactNode;
}

export interface TableProps<R = AnyRow> {
  columns: TableColumn<R>[];
  rows: R[];
  rowKey?: string;
  selected?: RowId[];
  onSelectedChange?: (ids: RowId[]) => void;
  onRowClick?: (row: R) => void;
  density?: 'default' | 'compact';
  stickyHeader?: boolean;
  loading?: boolean;
  loadingRows?: number;
  empty?: React.ReactNode;
  defaultSort?: { key: string; dir: 'asc' | 'desc' };
  footer?: React.ReactNode;
  caption?: string;
  maxHeight?: number | string;
  className?: string;
}

export function Table<R extends AnyRow = AnyRow>({
  columns,
  rows,
  rowKey = 'id',
  selected,
  onSelectedChange,
  onRowClick,
  density,
  stickyHeader,
  loading,
  loadingRows = 5,
  empty,
  defaultSort,
  footer,
  caption,
  maxHeight,
  className,
}: TableProps<R>) {
  const t = useZwT();
  const [sort, setSort] = React.useState(defaultSort ?? null);
  const sorted = React.useMemo(() => {
    if (!sort) return rows;
    const c = columns.find((col) => col.key === sort.key);
    if (!c) return rows;
    const get = c.sortValue ?? ((r: R) => r[c.key] as number | string);
    return rows.slice().sort((a, b) => {
      const x = get(a);
      const y = get(b);
      const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
      return sort.dir === 'asc' ? r : -r;
    });
  }, [rows, sort, columns]);

  const sel = selected;
  const allOn = !!sel && rows.length > 0 && sel.length === rows.length;
  const someOn = !!sel && sel.length > 0 && !allOn;
  const toggleAll = () => onSelectedChange?.(allOn ? [] : rows.map((r) => r[rowKey] as RowId));
  const toggle = (id: RowId) =>
    sel && onSelectedChange?.(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]);
  const colSpan = columns.length + (sel ? 1 : 0);

  return (
    <div className={cx('zw-table-wrap', className)} style={maxHeight ? { maxHeight } : undefined}>
      <table
        className={cx(
          'zw-table',
          density === 'compact' && 'zw-table--compact',
          stickyHeader && 'zw-table--sticky',
        )}
        aria-busy={loading || undefined}
      >
        {caption ? <caption className="zw-sr">{caption}</caption> : null}
        <thead>
          <tr>
            {sel ? (
              <th className="zw-td-check" scope="col">
                <Checkbox
                  checked={allOn}
                  indeterminate={someOn}
                  onChange={toggleAll}
                  aria-label={t('selectAll')}
                />
              </th>
            ) : null}
            {columns.map((c) => {
              const on = sort?.key === c.key;
              return (
                <th
                  key={c.key}
                  scope="col"
                  style={{ width: c.width }}
                  className={cx(c.align === 'end' && 'is-end', c.align === 'center' && 'is-center')}
                  aria-sort={on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {c.sortable ? (
                    <button
                      type="button"
                      className={cx('zw-th-sort', on && 'is-on')}
                      onClick={() =>
                        setSort(
                          on && sort.dir === 'desc'
                            ? { key: c.key, dir: 'asc' }
                            : { key: c.key, dir: 'desc' },
                        )
                      }
                    >
                      {c.header}
                      <Icon
                        name={on ? (sort.dir === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down'}
                        size={14}
                      />
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: loadingRows }).map((_, i) => (
              <tr key={`sk${i}`}>
                {sel ? (
                  <td className="zw-td-check">
                    <Skeleton width={16} height={16} />
                  </td>
                ) : null}
                {columns.map((c) => (
                  <td key={c.key}>
                    <Skeleton width={c.align === 'end' ? 72 : '70%'} />
                  </td>
                ))}
              </tr>
            ))
          ) : sorted.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="zw-td-empty">
                {empty ?? <EmptyState compact icon="inbox" title={t('noResults')} />}
              </td>
            </tr>
          ) : (
            sorted.map((r) => {
              const id = r[rowKey] as RowId;
              const on = !!sel && sel.includes(id);
              return (
                <tr
                  key={id}
                  className={cx(on && 'is-selected', onRowClick && 'is-clickable')}
                  onClick={
                    onRowClick
                      ? (e) => {
                          if ((e.target as HTMLElement).closest('input,button,a,label')) return;
                          onRowClick(r);
                        }
                      : undefined
                  }
                >
                  {sel ? (
                    <td className="zw-td-check">
                      <Checkbox checked={on} onChange={() => toggle(id)} aria-label={t('selectRow')} />
                    </td>
                  ) : null}
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cx(
                        c.align === 'end' && 'is-end',
                        c.align === 'center' && 'is-center',
                        c.mono && 'zw-mono',
                        c.numeric && 'zw-tnum',
                      )}
                    >
                      {c.render ? c.render(r) : (r[c.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
        {footer ? <tfoot>{footer}</tfoot> : null}
      </table>
    </div>
  );
}

export interface FilterChipProps {
  label: React.ReactNode;
  value?: React.ReactNode;
  icon?: string;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export function FilterChip({ label, value, icon, active, onClick, onRemove }: FilterChipProps) {
  const t = useZwT();
  return (
    <span className={cx('zw-chip', active && 'is-active')}>
      <button type="button" className="zw-chip-main" onClick={onClick} aria-pressed={active}>
        {icon ? <Icon name={icon} size={14} /> : null}
        <span>{label}</span>
        {value ? <span className="zw-chip-val">{value}</span> : null}
        {onRemove ? null : <Icon name="chevron-down" size={14} />}
      </button>
      {onRemove ? (
        <button type="button" className="zw-chip-x" aria-label={t('removeFilter')} onClick={onRemove}>
          <Icon name="x" size={12} />
        </button>
      ) : null}
    </span>
  );
}

export interface DataGridProps<R = AnyRow> extends Omit<TableProps<R>, 'selected' | 'onSelectedChange'> {
  searchKeys?: string[];
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  bulkActions?: Array<{ label: string; icon?: string; danger?: boolean; onClick?: (ids: RowId[]) => void }>;
  pageSize?: number;
  selectable?: boolean;
}

/**
 * Client-side grid (search, sort, select, paginate) matching the reference.
 * Server-driven lists (cursor pagination, TanStack Table) build on this in Phase 5.
 */
export function DataGrid<R extends AnyRow = AnyRow>({
  searchKeys,
  searchPlaceholder,
  filters,
  actions,
  bulkActions,
  pageSize = 8,
  selectable = true,
  rows,
  columns,
  className,
  ...tableProps
}: DataGridProps<R>) {
  const t = useZwT();
  const [q, setQ] = React.useState('');
  const [sel, setSel] = React.useState<RowId[]>([]);
  const [page, setPage] = React.useState(1);
  const filtered = React.useMemo(() => {
    if (!q) return rows;
    const s = q.toLowerCase();
    const keys = searchKeys ?? columns.map((c) => c.key);
    return rows.filter((r) =>
      keys.some((k) =>
        String(r[k] ?? '')
          .toLowerCase()
          .includes(s),
      ),
    );
  }, [rows, q, searchKeys, columns]);
  const count = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pg = Math.min(page, count);
  const pageRows = filtered.slice((pg - 1) * pageSize, pg * pageSize);

  return (
    <div className={cx('zw-grid', className)}>
      <div className="zw-grid-toolbar">
        {sel.length ? (
          <div className="zw-grid-bulk" role="region" aria-label={t('bulkActions')} aria-live="polite">
            <span className="zw-grid-bulk-count">{t('rowsSelected', { n: sel.length })}</span>
            {(bulkActions ?? []).map((a, i) => (
              <Button
                key={i}
                size="sm"
                variant={a.danger ? 'danger-ghost' : 'secondary'}
                iconStart={a.icon}
                onClick={() => a.onClick?.(sel)}
              >
                {a.label}
              </Button>
            ))}
            <Button size="sm" variant="ghost" onClick={() => setSel([])}>
              {t('clear')}
            </Button>
          </div>
        ) : (
          <>
            <div className="zw-grid-search">
              <Input
                size="sm"
                iconStart="search"
                type="search"
                placeholder={searchPlaceholder ?? t('search')}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                aria-label={t('search')}
              />
            </div>
            <div className="zw-grid-filters">{filters ?? null}</div>
            <div className="zw-grid-actions">{actions ?? null}</div>
          </>
        )}
      </div>
      <Table<R>
        {...tableProps}
        columns={columns}
        rows={pageRows}
        selected={selectable ? sel : undefined}
        onSelectedChange={setSel}
        stickyHeader
      />
      <div className="zw-grid-foot">
        <Pagination
          page={pg}
          pageCount={count}
          total={filtered.length}
          pageSize={pageSize}
          onChange={setPage}
        />
      </div>
    </div>
  );
}
