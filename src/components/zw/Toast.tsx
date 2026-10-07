'use client';

import * as React from 'react';
import { cx } from './lib/cx';
import { useZwT } from './lib/locale';
import { Icon } from './Icon';
import { Spinner } from './Button';

export type ToastTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'loading';

export interface ToastProps {
  id?: string;
  tone?: ToastTone;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: { label: string; onClick?: () => void };
  onClose?: () => void;
  className?: string;
}

const TOAST_ICON: Record<Exclude<ToastTone, 'loading'>, string> = {
  success: 'circle-check',
  danger: 'circle-alert',
  warning: 'triangle-alert',
  info: 'info',
  neutral: 'info',
};

export function Toast({ tone = 'neutral', title, description, action, onClose, className }: ToastProps) {
  const t = useZwT();
  return (
    <div
      className={cx('zw-toast', `zw-toast--${tone}`, className)}
      role={tone === 'danger' ? 'alert' : 'status'}
      aria-live={tone === 'danger' ? 'assertive' : 'polite'}
    >
      <span className="zw-toast-icon">
        {tone === 'loading' ? <Spinner /> : <Icon name={TOAST_ICON[tone]} size={18} />}
      </span>
      <div className="zw-toast-body">
        <div className="zw-toast-title">{title}</div>
        {description ? <div className="zw-toast-desc">{description}</div> : null}
      </div>
      {action ? (
        <button type="button" className="zw-toast-action" onClick={action.onClick}>
          {action.label}
        </button>
      ) : null}
      {onClose ? (
        <button type="button" className="zw-toast-x" aria-label={t('dismiss')} onClick={onClose}>
          <Icon name="x" size={14} />
        </button>
      ) : null}
    </div>
  );
}

export function ToastStack({ toasts, contained }: { toasts: ToastProps[]; contained?: boolean }) {
  return (
    <div className={cx('zw-toasts', contained && 'is-contained')} aria-live="polite">
      {toasts.map((x, i) => (
        <Toast key={x.id ?? i} {...x} />
      ))}
    </div>
  );
}

/* ───────────── App-level toast queue: <ToastProvider> + useToast() ───────────── */

type ToastInput = Omit<ToastProps, 'id' | 'onClose'> & { duration?: number };
interface ToastCtx {
  toast: (t: ToastInput) => string;
  dismiss: (id: string) => void;
}
const Ctx = React.createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);
  const timers = React.useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = React.useCallback((id: string) => {
    setToasts((xs) => xs.filter((x) => x.id !== id));
    const tm = timers.current.get(id);
    if (tm) clearTimeout(tm);
    timers.current.delete(id);
  }, []);

  const toast = React.useCallback(
    ({ duration, ...input }: ToastInput) => {
      const id = Math.random().toString(36).slice(2, 10);
      setToasts((xs) => [...xs.slice(-3), { ...input, id, onClose: () => dismiss(id) }]);
      const ms = duration ?? (input.tone === 'loading' ? 0 : input.tone === 'danger' ? 8000 : 5000);
      if (ms > 0)
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), ms),
        );
      return id;
    },
    [dismiss],
  );

  React.useEffect(() => {
    const map = timers.current;
    return () => map.forEach((tm) => clearTimeout(tm));
  }, []);

  const value = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss]);
  return (
    <Ctx.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} />
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const c = React.useContext(Ctx);
  if (!c) throw new Error('useToast must be used inside <ToastProvider>');
  return c;
}
