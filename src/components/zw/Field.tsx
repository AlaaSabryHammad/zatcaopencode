'use client';

import * as React from 'react';
import { cx } from './lib/cx';
import { fmtNumber, fmtPhone, isVatFormat } from './lib/format';
import { useZwT } from './lib/locale';
import type { Size } from './lib/types';
import { Icon } from './Icon';

export interface FieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  labelAside?: React.ReactNode;
  className?: string;
}

interface FieldShellProps extends FieldProps {
  id: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

/** Label + control + hint/error wrapper shared by every form control. */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  optional,
  labelAside,
  className,
  disabled,
  children,
}: FieldShellProps) {
  const t = useZwT();
  return (
    <div className={cx('zw-field', !!error && 'has-error', disabled && 'is-disabled', className)}>
      {label ? (
        <label className="zw-label" htmlFor={id}>
          <span>{label}</span>
          {required ? (
            <span className="zw-req" aria-hidden>
              *
            </span>
          ) : null}
          {optional ? <span className="zw-opt">{t('optional')}</span> : null}
          {labelAside ? <span className="zw-label-aside">{labelAside}</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <div className="zw-field-msg zw-field-msg--error" id={`${id}-msg`} role="alert">
          <Icon name="circle-alert" size={14} />
          <span>{error}</span>
        </div>
      ) : hint ? (
        <div className="zw-field-msg" id={`${id}-msg`}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export interface InputProps
  extends FieldProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  iconStart?: string;
  iconEnd?: string;
  size?: Size;
  mono?: boolean;
  align?: 'start' | 'end';
  trailing?: React.ReactNode;
  inputClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id: idProp,
    label,
    hint,
    error,
    required,
    optional,
    labelAside,
    className,
    prefix,
    suffix,
    iconStart,
    iconEnd,
    size = 'md',
    mono,
    align,
    trailing,
    inputClassName,
    disabled,
    readOnly,
    ...rest
  },
  ref,
) {
  const gen = React.useId();
  const id = idProp ?? gen;
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
      disabled={disabled}
    >
      <div
        className={cx(
          'zw-control',
          `zw-control--${size}`,
          !!error && 'is-invalid',
          disabled && 'is-disabled',
          readOnly && 'is-readonly',
        )}
      >
        {iconStart ? (
          <span className="zw-affix zw-affix--icon">
            <Icon name={iconStart} size={16} />
          </span>
        ) : null}
        {prefix ? <span className="zw-affix">{prefix}</span> : null}
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          {...rest}
          className={cx('zw-input', mono && 'zw-mono', align === 'end' && 'zw-input--end', inputClassName)}
        />
        {suffix ? <span className="zw-affix">{suffix}</span> : null}
        {iconEnd ? (
          <span className="zw-affix zw-affix--icon">
            <Icon name={iconEnd} size={16} />
          </span>
        ) : null}
        {trailing ?? null}
      </div>
    </Field>
  );
});

export interface TextareaProps extends FieldProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { id: idProp, label, hint, error, required, optional, labelAside, className, rows = 3, ...rest },
  ref,
) {
  const gen = React.useId();
  const id = idProp ?? gen;
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
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
        {...rest}
        className={cx('zw-textarea', !!error && 'is-invalid')}
      />
    </Field>
  );
});

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends FieldProps, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: Array<SelectOption | string>;
  placeholder?: string;
  size?: Size;
  iconStart?: string;
}

/** Native select styled as a control — best a11y and mobile behaviour for short option lists. */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    id: idProp,
    label,
    hint,
    error,
    required,
    optional,
    labelAside,
    className,
    options,
    placeholder,
    size = 'md',
    iconStart,
    disabled,
    ...rest
  },
  ref,
) {
  const gen = React.useId();
  const id = idProp ?? gen;
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
      disabled={disabled}
    >
      <div
        className={cx(
          'zw-control',
          `zw-control--${size}`,
          'zw-control--select',
          !!error && 'is-invalid',
          disabled && 'is-disabled',
        )}
      >
        {iconStart ? (
          <span className="zw-affix zw-affix--icon">
            <Icon name={iconStart} size={16} />
          </span>
        ) : null}
        <select
          ref={ref}
          id={id}
          className="zw-select"
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          {...rest}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((raw) => {
            const o = typeof raw === 'string' ? { value: raw, label: raw } : raw;
            return (
              <option key={o.value} value={o.value} disabled={o.disabled}>
                {o.label}
              </option>
            );
          })}
        </select>
        <span className="zw-affix zw-affix--icon zw-select-caret">
          <Icon name="chevron-down" size={16} />
        </span>
      </div>
    </Field>
  );
});

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { id: idProp, label, description, indeterminate, className, disabled, ...rest },
  forwarded,
) {
  const gen = React.useId();
  const id = idProp ?? gen;
  const inner = React.useRef<HTMLInputElement | null>(null);
  React.useEffect(() => {
    if (inner.current) inner.current.indeterminate = !!indeterminate;
  }, [indeterminate]);
  const setRef = (el: HTMLInputElement | null) => {
    inner.current = el;
    if (typeof forwarded === 'function') forwarded(el);
    else if (forwarded) forwarded.current = el;
  };
  return (
    <label className={cx('zw-check', disabled && 'is-disabled', className)} htmlFor={id}>
      <input ref={setRef} id={id} type="checkbox" className="zw-check-input" disabled={disabled} {...rest} />
      <span className="zw-check-box" aria-hidden>
        <Icon name={indeterminate ? 'minus' : 'check'} size={12} strokeWidth={3} />
      </span>
      {label || description ? (
        <span className="zw-check-text">
          {label ? <span className="zw-check-label">{label}</span> : null}
          {description ? <span className="zw-check-desc">{description}</span> : null}
        </span>
      ) : null}
    </label>
  );
});

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { id: idProp, label, description, className, disabled, ...rest },
  ref,
) {
  const gen = React.useId();
  const id = idProp ?? gen;
  return (
    <label className={cx('zw-switch', disabled && 'is-disabled', className)} htmlFor={id}>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        role="switch"
        className="zw-switch-input"
        disabled={disabled}
        {...rest}
      />
      <span className="zw-switch-track" aria-hidden>
        <span className="zw-switch-thumb" />
      </span>
      {label || description ? (
        <span className="zw-check-text">
          {label ? <span className="zw-check-label">{label}</span> : null}
          {description ? <span className="zw-check-desc">{description}</span> : null}
        </span>
      ) : null}
    </label>
  );
});

export interface CurrencyInputProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange'> {
  value?: number | null;
  defaultValue?: number;
  onChange?: (value: number | null) => void;
  decimals?: number;
  currencyDisplay?: 'auto' | 'both';
}

/** Raw while typing, formatted on blur. Value is a number for display; persist via decimal strings. */
export function CurrencyInput({
  value,
  defaultValue,
  onChange,
  decimals = 2,
  currencyDisplay,
  placeholder,
  onFocus,
  onBlur,
  ...rest
}: CurrencyInputProps) {
  const t = useZwT();
  const controlled = value !== undefined;
  const [inner, setInner] = React.useState<number | null>(defaultValue ?? null);
  const val = controlled ? value : inner;
  const [focused, setFocused] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const shown = focused ? draft : val == null ? '' : fmtNumber(val, decimals);
  return (
    <Input
      {...rest}
      inputMode="decimal"
      align="end"
      value={shown}
      placeholder={placeholder ?? '0.00'}
      suffix={
        <span className="zw-currency-tag">
          {currencyDisplay === 'both' ? t('currencyBoth') : t('currency')}
        </span>
      }
      inputClassName="zw-tnum"
      dir="ltr"
      onFocus={(e) => {
        setFocused(true);
        setDraft(val == null ? '' : String(val));
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      onChange={(e) => {
        let raw = e.target.value.replace(/[^0-9.]/g, '');
        const parts = raw.split('.');
        if (parts.length > 2) raw = `${parts[0]}.${parts.slice(1).join('')}`;
        setDraft(raw);
        const n = raw === '' ? null : Number.parseFloat(raw);
        if (!controlled) setInner(n);
        onChange?.(n);
      }}
    />
  );
}

export interface VatInputProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (digits: string) => void;
}

/** VAT number: 15 digits, starts and ends with 3. Format check only — not a registry lookup. */
export function VatInput({
  value,
  defaultValue,
  onChange,
  error,
  hint,
  placeholder,
  ...rest
}: VatInputProps) {
  const t = useZwT();
  const controlled = value !== undefined;
  const [inner, setInner] = React.useState(defaultValue ?? '');
  const v = (controlled ? value : inner) ?? '';
  const ok = isVatFormat(v);
  const touched = v.length > 0;
  return (
    <Input
      {...rest}
      value={v}
      mono
      inputMode="numeric"
      maxLength={15}
      placeholder={placeholder ?? '3XXXXXXXXXXXXX3'}
      dir="ltr"
      error={error ?? (touched && v.length === 15 && !ok ? t('vatInvalid') : undefined)}
      hint={hint ?? (ok ? undefined : t('vatInvalid'))}
      trailing={
        ok ? (
          <span className="zw-affix zw-affix--ok" title={t('vatValid')}>
            <Icon name="circle-check" size={16} label={t('vatValid')} />
          </span>
        ) : (
          <span className="zw-affix zw-affix--count zw-tnum">{v.length}/15</span>
        )
      }
      onChange={(e) => {
        const n = e.target.value.replace(/\D/g, '').slice(0, 15);
        if (!controlled) setInner(n);
        onChange?.(n);
      }}
    />
  );
}

export interface PhoneInputProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (digits: string) => void;
}

/** Saudi mobile: +966 5X XXX XXXX. Value is the 9 national digits. */
export function PhoneInput({ value, defaultValue, onChange, hint, error, ...rest }: PhoneInputProps) {
  const t = useZwT();
  const controlled = value !== undefined;
  const [inner, setInner] = React.useState(defaultValue ?? '');
  const v = (controlled ? value : inner) ?? '';
  const digits = v.replace(/\D/g, '');
  const bad = digits.length > 0 && digits[0] !== '5';
  return (
    <Input
      {...rest}
      value={fmtPhone(v)}
      type="tel"
      inputMode="tel"
      autoComplete="tel-national"
      dir="ltr"
      placeholder="5X XXX XXXX"
      inputClassName="zw-tnum"
      prefix={
        <span className="zw-phone-cc" dir="ltr">
          <span className="zw-phone-flag" aria-hidden>
            SA
          </span>
          +966
        </span>
      }
      hint={hint ?? t('phoneHint')}
      error={error ?? (bad ? t('phoneHint') : undefined)}
      onChange={(e) => {
        const n = e.target.value.replace(/\D/g, '').slice(0, 9);
        if (!controlled) setInner(n);
        onChange?.(n);
      }}
    />
  );
}
