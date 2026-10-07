import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cx } from './lib/cx';
import type { Size } from './lib/types';
import { Icon } from './Icon';

export function Spinner({ className }: { className?: string }) {
  return <span className={cx('zw-spinner', className)} aria-hidden />;
}

export function Kbd({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <kbd className={cx('zw-kbd', className)}>{children}</kbd>;
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost' | 'accent' | 'link';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: Size;
  iconStart?: string;
  iconEnd?: string;
  loading?: boolean;
  kbd?: string;
  fullWidth?: boolean;
  /** Render as the single child element (e.g. a Link) while keeping button styles. */
  asChild?: boolean;
}

/** One primary button per view region; everything else secondary or ghost (brand-book.md). */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    iconStart,
    iconEnd,
    loading,
    kbd,
    fullWidth,
    asChild,
    className,
    children,
    disabled,
    type,
    ...rest
  },
  ref,
) {
  const isz = size === 'sm' ? 16 : 18;
  const cls = cx(
    'zw-btn',
    `zw-btn--${variant}`,
    `zw-btn--${size}`,
    fullWidth && 'zw-btn--full',
    loading && 'is-loading',
    className,
  );
  const content = (
    <>
      {loading ? <Spinner /> : iconStart ? <Icon name={iconStart} size={isz} /> : null}
      {children != null ? <span className="zw-btn-label">{children}</span> : null}
      {iconEnd ? <Icon name={iconEnd} size={isz} /> : null}
      {kbd ? <kbd className="zw-kbd zw-btn-kbd">{kbd}</kbd> : null}
    </>
  );
  if (asChild) {
    return (
      <Slot ref={ref} className={cls} {...rest}>
        {iconStart ? <Icon name={iconStart} size={isz} /> : null}
        <Slottable>{children}</Slottable>
        {iconEnd ? <Icon name={iconEnd} size={isz} /> : null}
      </Slot>
    );
  }
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={cls}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
});

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  /** Required accessible name (also the native tooltip). */
  label: string;
  variant?: ButtonVariant;
  size?: Size;
  badge?: React.ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, variant = 'ghost', size = 'md', badge, className, type, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      aria-label={label}
      title={label}
      className={cx('zw-btn', `zw-btn--${variant}`, `zw-btn--${size}`, 'zw-btn--icon', className)}
      {...rest}
    >
      <Icon name={icon} size={size === 'sm' ? 16 : 18} />
      {badge ? <span className="zw-icon-badge">{badge}</span> : null}
    </button>
  );
});
