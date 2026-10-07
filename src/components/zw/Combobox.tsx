'use client';

import * as React from 'react';
import { cx } from './lib/cx';
import { useZwT } from './lib/locale';
import { useOutside } from './lib/use-outside';
import type { Size } from './lib/types';
import { Icon } from './Icon';
import { Field, type FieldProps } from './Field';
import { Avatar } from './Display';

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  meta?: React.ReactNode;
  avatar?: boolean;
  square?: boolean;
  icon?: string;
  keywords?: string;
}

export interface ComboboxProps extends FieldProps {
  options: ComboboxOption[];
  value?: string | null;
  defaultValue?: string;
  onChange?: (value: string, option: ComboboxOption) => void;
  /** Shows a “Create …” row when the query matches nothing exactly. */
  onCreate?: (query: string) => void;
  placeholder?: string;
  icon?: string;
  size?: Size;
  defaultOpen?: boolean;
  id?: string;
}

/** Searchable select (ARIA 1.2 combobox pattern) with optional inline create. */
export function Combobox({
  options,
  value,
  defaultValue,
  onChange,
  onCreate,
  placeholder,
  icon,
  size = 'md',
  defaultOpen,
  id: idProp,
  label,
  hint,
  error,
  required,
  optional,
  labelAside,
  className,
}: ComboboxProps) {
  const t = useZwT();
  const gen = React.useId();
  const id = idProp ?? gen;
  const [open, setOpen] = React.useState(!!defaultOpen);
  const [q, setQ] = React.useState('');
  const [inner, setInner] = React.useState<string | null>(defaultValue ?? null);
  const val = value !== undefined ? value : inner;
  const [active, setActive] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setOpen(false), []);
  useOutside(ref, open && !defaultOpen, close);

  const needle = q.toLowerCase();
  const opts = options.filter(
    (o) => !needle || `${o.label} ${o.description ?? ''} ${o.keywords ?? ''}`.toLowerCase().includes(needle),
  );
  const current = options.find((o) => o.value === val);
  const showCreate = !!onCreate && !!q && !opts.some((o) => o.label.toLowerCase() === needle);

  const pick = (o: ComboboxOption) => {
    if (value === undefined) setInner(o.value);
    onChange?.(o.value, o);
    setOpen(false);
    setQ('');
  };
  const create = () => {
    onCreate?.(q);
    setOpen(false);
  };
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const n = Math.max(opts.length + (showCreate ? 1 : 0), 1);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % n);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a - 1 + n) % n);
    }
    if (e.key === 'Enter' && open) {
      e.preventDefault();
      const o = opts[active];
      if (o) pick(o);
      else if (showCreate) create();
    }
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      labelAside={labelAside}
      className={className}
    >
      <div ref={ref} className="zw-pop-wrap zw-combo">
        <div className={cx('zw-control', `zw-control--${size}`, open && 'is-open', !!error && 'is-invalid')}>
          {current?.avatar && !open ? (
            <span className="zw-affix">
              <Avatar name={current.label} size="xs" square={current.square} />
            </span>
          ) : (
            <span className="zw-affix zw-affix--icon">
              <Icon name={icon ?? 'search'} size={16} />
            </span>
          )}
          <input
            id={id}
            className="zw-input"
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            aria-activedescendant={open && (opts[active] || showCreate) ? `${id}-opt-${active}` : undefined}
            aria-invalid={error ? true : undefined}
            autoComplete="off"
            required={required}
            placeholder={current ? current.label : (placeholder ?? t('search'))}
            value={open ? q : (current?.label ?? '')}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
              setActive(0);
            }}
            onKeyDown={onKey}
          />
          <span className="zw-affix zw-affix--icon">
            <Icon name="chevrons-up-down" size={16} />
          </span>
        </div>
        {open ? (
          <div id={`${id}-list`} role="listbox" className="zw-pop zw-pop--start zw-listbox">
            {opts.length === 0 && !showCreate ? (
              <div className="zw-listbox-empty">{t('noResults')}</div>
            ) : null}
            {opts.map((o, i) => (
              <div
                key={o.value}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={o.value === val}
                className={cx('zw-option', i === active && 'is-active')}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(o);
                }}
              >
                {o.avatar ? (
                  <Avatar name={o.label} size="sm" square={o.square} />
                ) : o.icon ? (
                  <Icon name={o.icon} size={16} />
                ) : null}
                <span className="zw-option-text">
                  <span className="zw-option-label">{o.label}</span>
                  {o.description ? <span className="zw-option-desc">{o.description}</span> : null}
                </span>
                {o.meta ? <span className="zw-option-meta">{o.meta}</span> : null}
                {o.value === val ? <Icon name="check" size={16} className="zw-option-check" /> : null}
              </div>
            ))}
            {showCreate ? (
              <div
                id={`${id}-opt-${opts.length}`}
                role="option"
                aria-selected={false}
                className={cx('zw-option', 'zw-option--create', active === opts.length && 'is-active')}
                onMouseDown={(e) => {
                  e.preventDefault();
                  create();
                }}
              >
                <Icon name="plus" size={16} />
                <span className="zw-option-label">{t('createX', { x: q })}</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </Field>
  );
}
