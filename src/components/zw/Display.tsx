'use client';

import * as React from 'react';
import { cx } from './lib/cx';
import { fmtCompact, fmtInt, fmtNumber } from './lib/format';
import { useZwT } from './lib/locale';
import type { Tone } from './lib/types';
import { Icon } from './Icon';
import { Tooltip } from './Tooltip';

/* ───────────────────────────── Card ───────────────────────────── */

export interface CardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: 'sm' | 'md' | 'none';
  tone?: 'brand' | 'sunken';
  interactive?: boolean;
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({
  title,
  description,
  actions,
  footer,
  padding,
  tone,
  interactive,
  as: As = 'section',
  children,
  className,
  style,
}: CardProps) {
  return (
    <As
      className={cx(
        'zw-card',
        padding === 'none' && 'zw-card--flush',
        padding === 'sm' && 'zw-card--sm',
        interactive && 'zw-card--interactive',
        tone && `zw-card--${tone}`,
        className,
      )}
      style={style}
    >
      {title || actions ? (
        <header className="zw-card-head">
          <div className="zw-card-titles">
            {title ? <h3 className="zw-card-title">{title}</h3> : null}
            {description ? <p className="zw-card-desc">{description}</p> : null}
          </div>
          {actions ? <div className="zw-card-actions">{actions}</div> : null}
        </header>
      ) : null}
      <div className="zw-card-body">{children}</div>
      {footer ? <footer className="zw-card-foot">{footer}</footer> : null}
    </As>
  );
}

/* ──────────────────────────── Amount ──────────────────────────── */

export interface AmountProps {
  /** Already-rounded amount. Pass a decimal string from the server to avoid float drift. */
  value: number | string;
  size?: 'sm' | 'md' | 'lg' | 'kpi' | 'hero';
  tone?: 'success' | 'danger' | 'muted';
  currency?: boolean;
  currencyDisplay?: 'auto' | 'both';
  decimals?: number;
  compact?: boolean;
  showSign?: boolean;
  className?: string;
}

/** The only way to show money: 2 decimals, tabular, LTR, true minus, currency label at 62%. */
export function Amount({
  value,
  size = 'md',
  tone,
  currency = true,
  currencyDisplay,
  decimals,
  compact,
  showSign,
  className,
}: AmountProps) {
  const t = useZwT();
  const v = Number(value);
  const neg = v < 0;
  const abs = Math.abs(v);
  // Negative amounts render in danger-fg unless a tone is given (DESIGN_SPEC §1 › Money).
  const appliedTone = tone ?? (neg ? 'danger' : undefined);
  return (
    <span
      className={cx('zw-amount', `zw-amount--${size}`, appliedTone && `zw-amount--${appliedTone}`, className)}
      dir="ltr"
    >
      {showSign && v > 0 ? '+' : null}
      {neg ? '−' : null}
      <span className="zw-amount-value">{compact ? fmtCompact(abs) : fmtNumber(abs, decimals)}</span>
      {currency ? (
        <span className="zw-amount-cur">
          {currencyDisplay === 'both' ? t('currencyBoth') : t('currency')}
        </span>
      ) : null}
    </span>
  );
}

/* ─────────────────────── Sparkline / Delta ─────────────────────── */

export function Sparkline({
  data,
  width = 96,
  height = 32,
  tone = 'brand',
}: {
  data: number[];
  width?: number;
  height?: number;
  tone?: 'brand' | 'danger' | 'accent';
}) {
  if (!data || data.length < 2) return null;
  const mn = Math.min(...data);
  const mx = Math.max(...data);
  const rg = mx - mn || 1;
  const pts = data.map(
    (v, i) =>
      [(i / (data.length - 1)) * (width - 4) + 2, height - 3 - ((v - mn) / rg) * (height - 6)] as const,
  );
  const line = pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('');
  const last = pts[pts.length - 1]!;
  return (
    <svg
      className={cx('zw-spark', `zw-spark--${tone}`)}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
    >
      <path d={`${line}L${last[0]} ${height}L2 ${height}Z`} className="zw-spark-area" />
      <path d={line} className="zw-spark-line" />
      <circle cx={last[0]} cy={last[1]} r={3} className="zw-spark-dot" />
    </svg>
  );
}

export function Delta({ value, invert }: { value: number; invert?: boolean }) {
  const up = value >= 0;
  const good = invert ? !up : up;
  return (
    <span className={cx('zw-delta', good ? 'zw-delta--good' : 'zw-delta--bad')}>
      <Icon name={up ? 'trending-up' : 'trending-down'} size={14} mirror={false} />
      <span dir="ltr">{`${up ? '+' : '−'}${Math.abs(value).toFixed(1)}%`}</span>
    </span>
  );
}

/* ─────────────────────────── StatCard ─────────────────────────── */

export interface StatCardProps {
  label: React.ReactNode;
  value: number | string;
  currency?: boolean;
  size?: 'kpi' | 'hero';
  icon?: string;
  tone?: 'brand' | 'accent' | 'info' | 'danger' | 'warning' | 'neutral';
  delta?: number;
  invert?: boolean;
  footnote?: React.ReactNode;
  trend?: number[];
  trendTone?: 'brand' | 'danger' | 'accent';
  emphasis?: boolean;
  info?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  currency,
  size,
  icon,
  tone = 'brand',
  delta,
  invert,
  footnote,
  trend,
  trendTone,
  emphasis,
  info,
  loading,
  className,
}: StatCardProps) {
  const t = useZwT();
  const autoTone = delta != null && (invert ? delta > 0 : delta < 0) ? 'danger' : 'brand';
  return (
    <div className={cx('zw-stat', emphasis && 'zw-stat--emphasis', className)}>
      <div className="zw-stat-head">
        {icon ? (
          <span className={cx('zw-stat-icon', `zw-stat-icon--${tone}`)}>
            <Icon name={icon} size={16} />
          </span>
        ) : null}
        <span className="zw-stat-label">{label}</span>
        {info ? (
          <Tooltip content={info}>
            <span className="zw-stat-info" tabIndex={0}>
              <Icon name="info" size={14} />
            </span>
          </Tooltip>
        ) : null}
      </div>
      <div className="zw-stat-row">
        <div className="zw-stat-value">
          {loading ? (
            <Skeleton width={140} height={28} />
          ) : typeof value === 'number' && currency !== false ? (
            <Amount value={value} size={size ?? 'kpi'} />
          ) : (
            <span className="num-kpi zw-tnum">{value}</span>
          )}
        </div>
        {trend ? <Sparkline data={trend} tone={trendTone ?? autoTone} /> : null}
      </div>
      {delta != null || footnote ? (
        <div className="zw-stat-foot">
          {delta != null ? <Delta value={delta} invert={invert} /> : null}
          <span className="zw-stat-foot-text">{footnote ?? t('vsLast')}</span>
        </div>
      ) : null}
    </div>
  );
}

/* ──────────────────────────── Avatar ──────────────────────────── */

const STOP = /^(شركة|مؤسسة|مكتب|مصنع|co\.?|est\.?|llc|ltd\.?|company|the)$/i;

export function initialsFor(name: string): string {
  let parts = name
    .trim()
    .split(/\s+/)
    .filter((w) => !STOP.test(w));
  if (!parts.length) parts = name.trim().split(/\s+/);
  const arabic = /[\u0600-\u06FF]/.test(name);
  const first = parts[0] ?? '';
  const initials = arabic
    ? (first.replace(/^ال/, '')[0] ?? '')
    : (first[0] ?? '') + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '');
  return initials.toUpperCase();
}

function hueFor(name: string): number {
  let hue = 0;
  for (let i = 0; i < name.length; i++) hue = (hue + name.charCodeAt(i) * 7) % 5;
  return hue;
}

export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  square?: boolean;
  status?: 'online' | 'away';
  className?: string;
}

export function Avatar({ name, src, size = 'md', square, status, className }: AvatarProps) {
  return (
    <span
      className={cx(
        'zw-avatar',
        `zw-avatar--${size}`,
        square && 'zw-avatar--square',
        `zw-avatar--c${hueFor(name)}`,
        className,
      )}
      title={name}
      aria-label={name}
      role="img"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt="" /> : <span aria-hidden>{initialsFor(name)}</span>}
      {status ? <span className={`zw-avatar-status zw-avatar-status--${status}`} /> : null}
    </span>
  );
}

export function AvatarGroup({
  names,
  max = 4,
  size = 'sm',
}: {
  names: string[];
  max?: number;
  size?: AvatarProps['size'];
}) {
  return (
    <span className="zw-avatar-group">
      {names.slice(0, max).map((n) => (
        <Avatar key={n} name={n} size={size} />
      ))}
      {names.length > max ? (
        <span className={cx('zw-avatar', `zw-avatar--${size}`, 'zw-avatar--more')}>
          +{names.length - max}
        </span>
      ) : null}
    </span>
  );
}

/* ─────────────────────── Progress / UsageMeter ─────────────────────── */

export function Progress({
  value,
  size,
  tone,
  label,
  className,
}: {
  value: number;
  size?: 'md' | 'lg';
  tone?: 'brand' | 'warning' | 'danger' | 'success';
  label?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value || 0));
  return (
    <div
      className={cx('zw-progress', size === 'lg' && 'zw-progress--lg', className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cx('zw-progress-bar', tone && `zw-progress-bar--${tone}`)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export interface UsageMeterProps {
  label: React.ReactNode;
  icon?: string;
  used: number;
  limit: number | null;
  unit?: string;
  note?: React.ReactNode;
  className?: string;
}

export function UsageMeter({ label, icon, used, limit, unit, note, className }: UsageMeterProps) {
  const t = useZwT();
  const unl = limit == null || limit === Infinity;
  const pct = unl ? 8 : (used / limit) * 100;
  const tone = unl ? 'brand' : pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'brand';
  return (
    <div className={cx('zw-meter', className)}>
      <div className="zw-meter-head">
        <span className="zw-meter-label">
          {icon ? <Icon name={icon} size={16} /> : null}
          {label}
        </span>
        <span className="zw-meter-val zw-tnum" dir="ltr">
          <strong>{fmtInt(used || 0)}</strong> / {unl ? t('unlimited') : fmtInt(limit)}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
      <Progress value={pct} tone={tone} label={typeof label === 'string' ? label : undefined} />
      {tone !== 'brand' ? (
        <div className={`zw-meter-note zw-meter-note--${tone}`}>
          <Icon name={tone === 'danger' ? 'circle-alert' : 'triangle-alert'} size={14} />
          {note ?? `${Math.round(pct)}% ${t('used')}`}
        </div>
      ) : null}
    </div>
  );
}

/* ─────────────────────────── Alert / Insight ─────────────────────────── */

export interface AlertProps {
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'accent';
  title?: React.ReactNode;
  icon?: string;
  action?: React.ReactNode;
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
}

const ALERT_ICON = {
  info: 'info',
  success: 'circle-check',
  warning: 'triangle-alert',
  danger: 'circle-alert',
  accent: 'sparkles',
  neutral: 'info',
} as const;

export function Alert({ tone = 'info', title, icon, action, onClose, children, className }: AlertProps) {
  const t = useZwT();
  return (
    <div
      className={cx('zw-alert', `zw-alert--${tone}`, className)}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      <span className="zw-alert-icon">
        <Icon name={icon ?? ALERT_ICON[tone]} size={18} />
      </span>
      <div className="zw-alert-body">
        {title ? <div className="zw-alert-title">{title}</div> : null}
        {children ? <div className="zw-alert-text">{children}</div> : null}
      </div>
      {action ? <div className="zw-alert-action">{action}</div> : null}
      {onClose ? (
        <button
          type="button"
          className="zw-btn zw-btn--ghost zw-btn--sm zw-btn--icon"
          aria-label={t('dismiss')}
          onClick={onClose}
        >
          <Icon name="x" size={16} />
        </button>
      ) : null}
    </div>
  );
}

export interface InsightProps {
  kicker?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function Insight({ kicker, action, children, className }: InsightProps) {
  const t = useZwT();
  return (
    <div className={cx('zw-insight', className)}>
      <div className="zw-insight-kicker">
        <Icon name="sparkles" size={14} />
        {kicker ?? t('insight')}
      </div>
      <div className="zw-insight-text">{children}</div>
      {action ? <div className="zw-insight-action">{action}</div> : null}
    </div>
  );
}

/* ─────────────────────────── EmptyState ─────────────────────────── */

function EmptyArt({ kind = 'invoice' }: { kind?: 'invoice' | 'customers' | 'search' }) {
  return (
    <svg className="zw-empty-art" width={160} height={112} viewBox="0 0 160 112" aria-hidden>
      <circle cx={80} cy={60} r={48} className="ea-disc" />
      <rect x={52} y={18} width={56} height={74} rx={8} className="ea-sheet" />
      <rect x={61} y={30} width={22} height={5} rx={2.5} className="ea-ink" />
      <rect x={61} y={42} width={38} height={4} rx={2} className="ea-line" />
      <rect x={61} y={51} width={30} height={4} rx={2} className="ea-line" />
      <rect x={61} y={60} width={34} height={4} rx={2} className="ea-line" />
      {kind === 'search' ? (
        <g>
          <circle cx={112} cy={76} r={14} className="ea-ring" />
          <path d="M122 86l10 10" className="ea-ring" />
        </g>
      ) : kind === 'customers' ? (
        <g>
          <circle cx={116} cy={74} r={9} className="ea-brand" />
          <rect x={102} y={86} width={28} height={12} rx={6} className="ea-brand" />
        </g>
      ) : (
        <g>
          <rect x={104} y={70} width={10} height={10} rx={2} className="ea-brand" />
          <rect x={116} y={70} width={10} height={10} rx={2} className="ea-accent" />
          <rect x={104} y={82} width={10} height={10} rx={2} className="ea-brand" />
          <rect x={116} y={82} width={10} height={10} rx={2} className="ea-brand-soft" />
        </g>
      )}
      <rect x={61} y={76} width={18} height={6} rx={3} className="ea-brand" />
    </svg>
  );
}

export interface EmptyStateProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  art?: 'invoice' | 'customers' | 'search';
  icon?: string;
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  secondaryAction,
  art,
  icon,
  compact,
  className,
}: EmptyStateProps) {
  return (
    <div className={cx('zw-empty', compact && 'zw-empty--compact', className)}>
      {icon ? (
        <span className="zw-empty-icon">
          <Icon name={icon} size={24} />
        </span>
      ) : (
        <EmptyArt kind={art} />
      )}
      <h3 className="zw-empty-title">{title}</h3>
      {description ? <p className="zw-empty-desc">{description}</p> : null}
      {action || secondaryAction ? (
        <div className="zw-empty-actions">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}

/* ─────────────────────────── Skeleton ─────────────────────────── */

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  circle?: boolean;
  lines?: number;
  className?: string;
}

export function Skeleton({ width, height, circle, lines, className }: SkeletonProps) {
  if (lines) {
    return (
      <div className="zw-skel-lines" aria-hidden>
        {Array.from({ length: lines }).map((_, i) => (
          <span key={i} className="zw-skel" style={{ width: i === lines - 1 ? '60%' : '100%', height: 12 }} />
        ))}
      </div>
    );
  }
  return (
    <span
      className={cx('zw-skel', circle && 'zw-skel--circle', className)}
      aria-hidden
      style={{ width: width ?? '100%', height: height ?? 14 }}
    />
  );
}

/* ─────────────────────────── Timeline ─────────────────────────── */

export interface TimelineItem {
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  time?: React.ReactNode;
  icon?: string;
  tone?: Tone;
  state?: 'pending';
  meta?: React.ReactNode;
}

export function Timeline({
  items,
  compact,
  className,
}: {
  items: TimelineItem[];
  compact?: boolean;
  className?: string;
}) {
  return (
    <ol className={cx('zw-timeline', compact && 'zw-timeline--compact', className)}>
      {items.map((it, i) => (
        <li
          key={it.id ?? i}
          className={cx('zw-tl-item', `zw-tl--${it.tone ?? 'neutral'}`, it.state && `is-${it.state}`)}
        >
          <span className="zw-tl-marker">
            {it.icon ? <Icon name={it.icon} size={14} strokeWidth={2} /> : <span className="zw-tl-dot" />}
          </span>
          <div className="zw-tl-body">
            <div className="zw-tl-head">
              <span className="zw-tl-title">{it.title}</span>
              {it.time ? <time className="zw-tl-time">{it.time}</time> : null}
            </div>
            {it.description ? <div className="zw-tl-desc">{it.description}</div> : null}
            {it.meta ? <div className="zw-tl-meta">{it.meta}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ─────────────────────────── PageHeader ─────────────────────────── */

export interface PageHeaderProps {
  title: React.ReactNode;
  kicker?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, kicker, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cx('zw-pagehead', className)}>
      <div className="zw-pagehead-text">
        {kicker ? <div className="zw-pagehead-kicker">{kicker}</div> : null}
        <h1 className="zw-pagehead-title">{title}</h1>
        {description ? <p className="zw-pagehead-desc">{description}</p> : null}
      </div>
      {actions ? <div className="zw-pagehead-actions">{actions}</div> : null}
    </div>
  );
}
