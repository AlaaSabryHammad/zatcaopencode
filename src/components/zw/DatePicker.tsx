'use client';

import * as React from 'react';
import { cx } from './lib/cx';
import { fmtHijri, parseIsoDate, toIsoDate } from './lib/format';
import { useLang, useZwT } from './lib/locale';
import { useOutside } from './lib/use-outside';
import type { Size } from './lib/types';
import { Button, IconButton } from './Button';
import { Field, type FieldProps } from './Field';
import { Icon } from './Icon';

export interface DatePickerProps extends FieldProps {
  /** ISO yyyy-mm-dd */
  value?: string | null;
  defaultValue?: string;
  onChange?: (iso: string) => void;
  /** Show the Umm al-Qura Hijri date as a secondary line. */
  showHijri?: boolean;
  presets?: Array<{ label: string; value: string }>;
  /** Override "today" (ISO) — used by tests and previews. */
  today?: string;
  placeholder?: string;
  size?: Size;
  defaultOpen?: boolean;
  id?: string;
}

/** Gregorian calendar with ISO values; display "7 October 2026" (forms/documents format). */
export function DatePicker({
  value,
  defaultValue,
  onChange,
  showHijri,
  presets,
  today,
  placeholder,
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
}: DatePickerProps) {
  const lang = useLang();
  const t = useZwT();
  const months = t.raw('months') as string[];
  const dow = t.raw('weekdays') as string[];
  const gen = React.useId();
  const id = idProp ?? gen;
  const [inner, setInner] = React.useState<string | null>(defaultValue ?? null);
  const val = value !== undefined ? value : inner;
  const [open, setOpen] = React.useState(!!defaultOpen);
  const base = parseIsoDate(val) ?? parseIsoDate(today) ?? new Date();
  const [month, setMonth] = React.useState(new Date(base.getFullYear(), base.getMonth(), 1));
  const ref = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setOpen(false), []);
  useOutside(ref, open && !defaultOpen, close);

  const todayIso = today ?? toIsoDate(new Date());
  const first = month.getDay();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));

  const fmt = (s: string) => {
    const d = parseIsoDate(s);
    return d ? `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}` : '';
  };
  const pick = (dt: Date | null) => {
    if (!dt) return;
    const s = toIsoDate(dt);
    if (value === undefined) setInner(s);
    onChange?.(s);
    if (!defaultOpen) setOpen(false);
  };
  const valDate = parseIsoDate(val);

  return (
    <Field
      id={id}
      label={label}
      hint={showHijri && valDate ? fmtHijri(valDate, lang) : hint}
      error={error}
      required={required}
      optional={optional}
      labelAside={labelAside}
      className={className}
    >
      <div ref={ref} className="zw-pop-wrap">
        <button
          id={id}
          type="button"
          className={cx(
            'zw-control',
            `zw-control--${size}`,
            'zw-control--button',
            open && 'is-open',
            !!error && 'is-invalid',
          )}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span className="zw-affix zw-affix--icon">
            <Icon name="calendar" size={16} />
          </span>
          <span className={cx('zw-input', !val && 'is-placeholder')}>
            {val ? fmt(val) : (placeholder ?? t('selectDate'))}
          </span>
        </button>
        {open ? (
          <div
            className="zw-pop zw-pop--start zw-cal"
            role="dialog"
            aria-label={typeof label === 'string' ? label : t('calendar')}
          >
            <div className="zw-cal-head">
              <IconButton
                icon="chevron-left"
                label={t('prev')}
                size="sm"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              />
              <div className="zw-cal-title">
                {`${months[month.getMonth()]} ${month.getFullYear()}`}
                {showHijri ? (
                  <span className="zw-cal-hijri">
                    {fmtHijri(new Date(month.getFullYear(), month.getMonth(), 15), lang)}
                  </span>
                ) : null}
              </div>
              <IconButton
                icon="chevron-right"
                label={t('next')}
                size="sm"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              />
            </div>
            <div className="zw-cal-grid" role="grid">
              {dow.map((w) => (
                <span key={w} className="zw-cal-dow" role="columnheader">
                  {w}
                </span>
              ))}
              {cells.map((c, i) => {
                if (!c) return <span key={`b${i}`} />;
                const s = toIsoDate(c);
                return (
                  <button
                    key={s}
                    type="button"
                    role="gridcell"
                    className={cx('zw-cal-day', s === val && 'is-selected', s === todayIso && 'is-today')}
                    aria-selected={s === val}
                    aria-label={fmt(s)}
                    onClick={() => pick(c)}
                  >
                    {c.getDate()}
                  </button>
                );
              })}
            </div>
            <div className="zw-cal-foot">
              <Button size="sm" variant="ghost" onClick={() => pick(parseIsoDate(todayIso))}>
                {t('today')}
              </Button>
              {(presets ?? []).map((pr) => (
                <Button key={pr.label} size="sm" variant="ghost" onClick={() => pick(parseIsoDate(pr.value))}>
                  {pr.label}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Field>
  );
}
