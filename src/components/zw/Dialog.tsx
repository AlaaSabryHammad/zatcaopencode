'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cx } from './lib/cx';
import { useLang, useZwT } from './lib/locale';
import { Icon } from './Icon';
import { IconButton } from './Button';

/** Focus [data-autofocus] or the first field instead of the close button (matches the reference). */
function focusFirstField(e: Event) {
  const el = e.currentTarget as HTMLElement | null;
  if (!el) return;
  const target =
    el.querySelector<HTMLElement>('[data-autofocus]') ??
    el.querySelector<HTMLElement>('input:not([type=hidden]),select,textarea');
  e.preventDefault();
  (target ?? el).focus({ preventScroll: true });
}

interface OverlayFrameProps {
  open: boolean;
  onClose?: () => void;
  contained?: boolean;
  dismissable?: boolean;
  overlayClassName: string;
  children: React.ReactNode;
}

function OverlayFrame({
  open,
  onClose,
  contained,
  dismissable = true,
  overlayClassName,
  children,
}: OverlayFrameProps) {
  const lang = useLang();
  const frame = (
    <div
      className={cx('zw-overlay', overlayClassName, contained && 'is-contained', lang === 'ar' && 'zw-ar')}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="zw-scrim" aria-hidden />
      {children}
    </div>
  );
  return (
    <DialogPrimitive.Root
      open={open}
      modal={!contained}
      onOpenChange={(o) => {
        if (!o && dismissable) onClose?.();
      }}
    >
      {contained ? frame : <DialogPrimitive.Portal>{frame}</DialogPrimitive.Portal>}
    </DialogPrimitive.Root>
  );
}

export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  tone?: 'danger' | 'info' | 'warning' | 'success';
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
  dismissable?: boolean;
  /** Render inside the nearest positioned ancestor instead of the viewport (previews). */
  contained?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/** Confirmations for irreversible actions (issue, cancel, delete) — brand-book.md › Interaction. */
export function Dialog({
  open,
  onClose,
  title,
  description,
  footer,
  tone,
  icon,
  size = 'md',
  dismissable = true,
  contained,
  children,
  className,
}: DialogProps) {
  const t = useZwT();
  if (!open) return null;
  return (
    <OverlayFrame
      open={open}
      onClose={onClose}
      contained={contained}
      dismissable={dismissable}
      overlayClassName=""
    >
      <DialogPrimitive.Content
        role={tone === 'danger' ? 'alertdialog' : 'dialog'}
        className={cx('zw-dialog', `zw-dialog--${size}`, className)}
        onOpenAutoFocus={focusFirstField}
        onInteractOutside={dismissable ? undefined : (e) => e.preventDefault()}
        onEscapeKeyDown={dismissable ? undefined : (e) => e.preventDefault()}
        {...(description ? {} : { 'aria-describedby': undefined })}
      >
        <div className="zw-dialog-head">
          {tone ? (
            <span className={`zw-dialog-icon zw-dialog-icon--${tone}`}>
              <Icon name={icon ?? (tone === 'danger' ? 'triangle-alert' : 'info')} size={20} />
            </span>
          ) : null}
          <div className="zw-dialog-titles">
            <DialogPrimitive.Title className="zw-dialog-title">{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="zw-dialog-desc">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          <DialogPrimitive.Close asChild>
            <IconButton icon="x" label={t('close')} size="sm" className="zw-dialog-x" />
          </DialogPrimitive.Close>
        </div>
        {children ? <div className="zw-dialog-body">{children}</div> : null}
        {footer ? <div className="zw-dialog-foot">{footer}</div> : null}
      </DialogPrimitive.Content>
    </OverlayFrame>
  );
}

export interface DrawerProps {
  open: boolean;
  onClose?: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  side?: 'end';
  contained?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/** Side panel from the inline-end edge (right in LTR, left in RTL). */
export function Drawer({
  open,
  onClose,
  title,
  description,
  footer,
  width = 480,
  side = 'end',
  contained,
  children,
  className,
}: DrawerProps) {
  const t = useZwT();
  if (!open) return null;
  return (
    <OverlayFrame open={open} onClose={onClose} contained={contained} overlayClassName="zw-overlay--drawer">
      <DialogPrimitive.Content
        className={cx('zw-drawer', `zw-drawer--${side}`, className)}
        style={{ width }}
        onOpenAutoFocus={focusFirstField}
        {...(description ? {} : { 'aria-describedby': undefined })}
      >
        <div className="zw-drawer-head">
          <div className="zw-dialog-titles">
            <DialogPrimitive.Title className="zw-dialog-title">{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="zw-dialog-desc">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          <DialogPrimitive.Close asChild>
            <IconButton icon="x" label={t('close')} size="sm" />
          </DialogPrimitive.Close>
        </div>
        <div className="zw-drawer-body">{children}</div>
        {footer ? <div className="zw-drawer-foot">{footer}</div> : null}
      </DialogPrimitive.Content>
    </OverlayFrame>
  );
}

/** Internal building blocks shared with CommandMenu. */
export { OverlayFrame, focusFirstField };
