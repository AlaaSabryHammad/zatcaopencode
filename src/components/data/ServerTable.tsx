'use client';

/**
 * Server-driven table (D-006): TanStack Table for sort/selection state with the
 * same `zw-table` visual shell as the client DataGrid. Search, sort, filter and
 * pagination all round-trip to the server via URL query (see callers).
 */
import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type SortingState,
  type RowSelectionState,
  type Updater,
} from '@tanstack/react-table';
import { cx } from '@/components/zw/lib/cx';
import { Checkbox } from '@/components/zw/Field';
import { EmptyState, Skeleton } from '@/components/zw/Display';
import { Icon } from '@/components/zw/Icon';
import { Pagination } from '@/components/zw/Navigation';

export interface ServerColumn<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'start' | 'end' | 'center';
  width?: number | string;
  mono?: boolean;
  numeric?: boolean;
}

export interface ServerTableProps<T> {
  columns: Array<ServerColumn<T>>;
  rows: T[];
  getRowId?: (row: T) => string;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSortChange?: (key: string) => void;
  selectable?: boolean;
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  onRowClick?: (row: T) => void;
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  empty?: React.ReactNode;
  emptyTitle?: React.ReactNode;
  density?: 'default' | 'compact';
  stickyHeader?: boolean;
  caption?: string;
  className?: string;
}

export function ServerTable<T>({
  columns,
  rows,
  getRowId,
  sortKey,
  sortDir = 'asc',
  onSortChange,
  selectable,
  selected,
  onSelectedChange,
  onRowClick,
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
  loading,
  empty,
  emptyTitle,
  density,
  stickyHeader,
  caption,
  className,
}: ServerTableProps<T>) {
  const sorting: SortingState = React.useMemo(
    () => (sortKey ? [{ id: sortKey, desc: sortDir === 'desc' }] : []),
    [sortKey, sortDir],
  );
  const rowSelection: RowSelectionState = React.useMemo(() => {
    const s: RowSelectionState = {};
    for (const id of selected ?? []) s[id] = true;
    return s;
  }, [selected]);

  const rowIdOf = (row: T, index: number) => getRowId?.(row) ?? String(index);

  const table = useReactTable({
    data: rows,
    columns: React.useMemo(
      () =>
        columns.map((c) => ({
          id: c.key,
          header: () => c.header,
          enableSorting: !!c.sortable && !!onSortChange,
          cell: (info: { row: { original: T } }) => c.cell(info.row.original),
        })),
      [columns, onSortChange],
    ),
    state: { sorting, rowSelection } as { sorting: SortingState; rowSelection: RowSelectionState },
    manualSorting: true,
    manualPagination: true,
    enableRowSelection: !!selectable,
    onSortingChange: (updater: Updater<SortingState>) => {
      const next = typeof updater === 'function' ? (updater as (old: SortingState) => SortingState)(sorting) : updater;
      const s = next[0];
      if (s) onSortChange?.(s.id);
    },
    onRowSelectionChange: (updater: Updater<RowSelectionState>) => {
      const next = typeof updater === 'function' ? (updater as (old: RowSelectionState) => RowSelectionState)(rowSelection) : updater;
      onSelectedChange?.(Object.keys(next).filter((k) => next[k]));
    },
    getRowId: (row: T, index: number) => rowIdOf(row, index),
    getCoreRowModel: getCoreRowModel(),
  });

  const sel = selectable;
  const allOn = !!sel && rows.length > 0 && (selected?.length ?? 0) >= rows.length;
  const someOn = !!sel && (selected?.length ?? 0) > 0 && !allOn;
  const colSpan = columns.length + (sel ? 1 : 0);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3">
      <div className={cx('zw-table-wrap', className)}>
        <table
          className={cx('zw-table', density === 'compact' && 'zw-table--compact', stickyHeader && 'zw-table--sticky')}
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
                    onChange={() => {
                      const ids = rows.map((r, i) => rowIdOf(r, i));
                      onSelectedChange?.(allOn ? [] : ids);
                    }}
                    aria-label="Select all rows"
                  />
                </th>
              ) : null}
              {table.getHeaderGroups()[0]?.headers.map((h) => {
                const c = columns.find((col) => col.key === h.id)!;
                const on = sortKey === c.key;
                return (
                  <th
                    key={h.id}
                    scope="col"
                    style={{ width: c.width }}
                    className={cx(c.align === 'end' && 'is-end', c.align === 'center' && 'is-center')}
                    aria-sort={on ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    {c.sortable && onSortChange ? (
                      <button type="button" className={cx('zw-th-sort', on && 'is-on')} onClick={() => onSortChange(c.key)}>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        <Icon name={on ? (sortDir === 'asc' ? 'chevron-up' : 'chevrons-up-down') : 'chevrons-up-down'} size={14} />
                      </button>
                    ) : (
                      flexRender(h.column.columnDef.header, h.getContext())
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
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
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="zw-td-empty">
                  {empty ?? <EmptyState compact icon="inbox" title={emptyTitle ?? ''} />}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((r, ri) => {
                const original = r.original as T;
                const id = rowIdOf(original, ri);
                const isSel = !!selected?.includes(id);
                return (
                  <tr
                    key={id}
                    className={cx(isSel && 'is-selected', onRowClick && 'is-clickable')}
                    onClick={
                      onRowClick
                        ? (e) => {
                            if ((e.target as HTMLElement).closest('input,button,a,label')) return;
                            onRowClick(original);
                          }
                        : undefined
                    }
                  >
                    {sel ? (
                      <td className="zw-td-check">
                        <Checkbox
                          checked={isSel}
                          onChange={() =>
                            onSelectedChange?.(isSel ? (selected ?? []).filter((x) => x !== id) : [...(selected ?? []), id])
                          }
                          aria-label="Select row"
                        />
                      </td>
                    ) : null}
                    {r.getVisibleCells().map((cell) => {
                      const c = columns.find((col) => col.key === cell.column.id)!;
                      return (
                        <td
                          key={cell.id}
                          className={cx(
                            c.align === 'end' && 'is-end',
                            c.align === 'center' && 'is-center',
                            c.mono && 'zw-mono',
                            c.numeric && 'zw-tnum',
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-fg-muted tabular-nums">
          {from}–{to} / {total}
        </span>
        {pageCount > 1 ? (
          <Pagination page={page} pageCount={pageCount} total={total} pageSize={pageSize} onChange={onPageChange ?? (() => {})} />
        ) : null}
      </div>
    </div>
  );
}
