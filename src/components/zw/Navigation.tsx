'use client';

import * as React from 'react';
import { cx } from './lib/cx';
import { fmtInt } from './lib/format';
import { useZwT } from './lib/locale';
import { Icon } from './Icon';
import { IconButton } from './Button';

/* ───────────────────────────── Tabs ───────────────────────────── */

export interface TabsProps {
  tabs: Array<{ id: string; label: React.ReactNode; icon?: string; count?: number }>;
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  variant?: 'line' | 'pill';
  children?: React.ReactNode | ((active: string) => React.ReactNode);
  className?: string;
}

/** WAI-ARIA tabs with RTL-aware arrow keys. */
export function Tabs({
  tabs,
  value,
  defaultValue,
  onChange,
  variant = 'line',
  children,
  className,
}: TabsProps) {
  const controlled = value !== undefined;
  const [inner, setInner] = React.useState(defaultValue ?? tabs[0]?.id ?? '');
  const val = controlled ? value : inner;
  const refs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const baseId = React.useId();
  const sel = (id: string) => {
    if (!controlled) setInner(id);
    onChange?.(id);
  };
  const onKey = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const rtl = !!e.currentTarget.closest('[dir=rtl]');
    const n = tabs.length;
    let d = 0;
    if (e.key === 'ArrowRight') d = rtl ? -1 : 1;
    if (e.key === 'ArrowLeft') d = rtl ? 1 : -1;
    if (e.key === 'Home') d = -i;
    if (e.key === 'End') d = n - 1 - i;
    if (d) {
      e.preventDefault();
      const next = tabs[(i + d + n) % n];
      if (next) {
        sel(next.id);
        refs.current[next.id]?.focus();
      }
    }
  };
  return (
    <div className={cx('zw-tabs', `zw-tabs--${variant}`, className)}>
      <div role="tablist" className="zw-tablist">
        {tabs.map((tb, i) => {
          const on = tb.id === val;
          return (
            <button
              key={tb.id}
              ref={(el) => {
                refs.current[tb.id] = el;
              }}
              id={`${baseId}-tab-${tb.id}`}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls={children ? `${baseId}-panel` : undefined}
              tabIndex={on ? 0 : -1}
              className={cx('zw-tab', on && 'is-active')}
              onClick={() => sel(tb.id)}
              onKeyDown={(e) => onKey(e, i)}
            >
              {tb.icon ? <Icon name={tb.icon} size={16} /> : null}
              <span>{tb.label}</span>
              {tb.count != null ? <span className="zw-tab-count">{tb.count}</span> : null}
            </button>
          );
        })}
      </div>
      {children ? (
        <div
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${val}`}
          className="zw-tabpanel"
        >
          {typeof children === 'function' ? children(val) : children}
        </div>
      ) : null}
    </div>
  );
}

/* ─────────────────────── SegmentedControl ─────────────────────── */

export interface SegmentedControlProps {
  options: Array<{ value: string; label: React.ReactNode; icon?: string }>;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
  size,
  label,
  className,
}: SegmentedControlProps) {
  const [inner, setInner] = React.useState(defaultValue ?? options[0]?.value ?? '');
  const val = value !== undefined ? value : inner;
  return (
    <div
      className={cx('zw-seg', size === 'sm' && 'zw-seg--sm', className)}
      role="radiogroup"
      aria-label={label}
    >
      {options.map((o) => {
        const on = o.value === val;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            className={cx('zw-seg-btn', on && 'is-on')}
            onClick={() => {
              if (value === undefined) setInner(o.value);
              onChange?.(o.value);
            }}
          >
            {o.icon ? <Icon name={o.icon} size={14} /> : null}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── Breadcrumb ─────────────────────────── */

export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  icon?: string;
  onClick?: () => void;
}

export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  const t = useZwT();
  return (
    <nav aria-label={t('breadcrumb')} className={cx('zw-crumbs', className)}>
      <ol>
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i}>
              {last ? (
                <span aria-current="page">{it.label}</span>
              ) : (
                <a
                  href={it.href ?? '#'}
                  onClick={
                    it.onClick
                      ? (e) => {
                          e.preventDefault();
                          it.onClick?.();
                        }
                      : undefined
                  }
                >
                  {it.icon ? <Icon name={it.icon} size={14} /> : null}
                  {it.label}
                </a>
              )}
              {last ? null : <Icon name="chevron-right" size={14} className="zw-crumb-sep" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ─────────────────────────── Pagination ─────────────────────────── */

export interface PaginationProps {
  page: number;
  pageCount: number;
  total?: number;
  pageSize?: number;
  onChange?: (page: number) => void;
  className?: string;
}

export function Pagination({ page, pageCount, total, pageSize = 10, onChange, className }: PaginationProps) {
  const t = useZwT();
  const count = Math.max(1, pageCount);
  const go = (n: number) => {
    if (n >= 1 && n <= count) onChange?.(n);
  };
  const nums: Array<number | '…'> = [];
  for (let i = 1; i <= count; i++) {
    if (i === 1 || i === count || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== '…') nums.push('…');
  }
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total ?? 0);
  return (
    <nav className={cx('zw-pagination', className)} aria-label={t('page')}>
      {total != null ? (
        <span className="zw-pagination-info">{t('showing', { a: from, b: to, t: fmtInt(total) })}</span>
      ) : (
        <span />
      )}
      <div className="zw-pagination-pages">
        <IconButton
          icon="chevron-left"
          label={t('prev')}
          size="sm"
          variant="secondary"
          disabled={page <= 1}
          onClick={() => go(page - 1)}
        />
        {nums.map((n, i) =>
          n === '…' ? (
            <span key={`e${i}`} className="zw-pagination-gap">
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              className={cx('zw-page', n === page && 'is-active')}
              aria-current={n === page ? 'page' : undefined}
              onClick={() => go(n)}
            >
              {n}
            </button>
          ),
        )}
        <IconButton
          icon="chevron-right"
          label={t('next')}
          size="sm"
          variant="secondary"
          disabled={page >= count}
          onClick={() => go(page + 1)}
        />
      </div>
    </nav>
  );
}

/* ───────────────────────────── Stepper ───────────────────────────── */

export interface StepperProps {
  steps: Array<{ label: React.ReactNode; description?: React.ReactNode }>;
  /** Zero-based index of the current step. */
  current: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Stepper({ steps, current, orientation = 'horizontal', className }: StepperProps) {
  const t = useZwT();
  return (
    <ol
      className={cx('zw-stepper', `zw-stepper--${orientation}`, className)}
      aria-label={t('step', { a: current + 1, b: steps.length })}
    >
      {steps.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo';
        return (
          <li
            key={i}
            className={cx('zw-step', `is-${state}`)}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span className="zw-step-marker">
              {state === 'done' ? <Icon name="check" size={14} strokeWidth={2.5} /> : i + 1}
            </span>
            <span className="zw-step-text">
              <span className="zw-step-label">{s.label}</span>
              {s.description ? <span className="zw-step-desc">{s.description}</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ──────────────────────────── Accordion ──────────────────────────── */

export interface AccordionProps {
  items: Array<{
    id: string;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    icon?: string;
    content: React.ReactNode;
  }>;
  defaultOpen?: string[];
  multiple?: boolean;
  className?: string;
}

export function Accordion({ items, defaultOpen, multiple, className }: AccordionProps) {
  const [open, setOpen] = React.useState<string[]>(defaultOpen ?? []);
  const baseId = React.useId();
  const toggle = (id: string) => {
    const on = open.includes(id);
    setOpen(on ? open.filter((x) => x !== id) : multiple ? [...open, id] : [id]);
  };
  return (
    <div className={cx('zw-accordion', className)}>
      {items.map((it) => {
        const on = open.includes(it.id);
        const panelId = `${baseId}-${it.id}`;
        return (
          <div key={it.id} className={cx('zw-acc-item', on && 'is-open')}>
            <h3 className="zw-acc-h">
              <button
                type="button"
                className="zw-acc-trigger"
                aria-expanded={on}
                aria-controls={panelId}
                onClick={() => toggle(it.id)}
              >
                {it.icon ? <Icon name={it.icon} size={18} /> : null}
                <span className="zw-acc-title">
                  {it.title}
                  {it.subtitle ? <span className="zw-acc-sub">{it.subtitle}</span> : null}
                </span>
                <Icon name="chevron-down" size={18} className="zw-acc-caret" />
              </button>
            </h3>
            {on ? (
              <div className="zw-acc-panel" id={panelId} role="region">
                {it.content}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
