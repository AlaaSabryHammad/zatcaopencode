'use client';

import * as React from 'react';
import { cx } from './lib/cx';
import { useZwT } from './lib/locale';
import {
  COMPLIANCE_STATUS,
  INVOICE_STATUS,
  QUOTE_STATUS,
  type ComplianceStatusKey,
  type InvoiceStatusKey,
  type QuoteStatusKey,
} from './lib/status';
import type { Tone } from './lib/types';
import { Icon } from './Icon';

export interface BadgeProps {
  tone?: Tone;
  icon?: string;
  dot?: boolean;
  size?: 'sm' | 'md';
  children?: React.ReactNode;
  className?: string;
}

/** Every status carries an icon and a word — never colour alone. */
export function Badge({ tone = 'neutral', icon, dot, size, children, className }: BadgeProps) {
  return (
    <span className={cx('zw-badge', `zw-badge--${tone}`, size === 'sm' && 'zw-badge--sm', className)}>
      {icon ? (
        <Icon name={icon} size={13} strokeWidth={2} />
      ) : dot ? (
        <span className="zw-badge-dot" aria-hidden />
      ) : null}
      {children}
    </span>
  );
}

export interface InvoiceStatusProps {
  status: InvoiceStatusKey;
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
}

/** Invoice lifecycle. Separate from ComplianceStatus — never merge the two. */
export function InvoiceStatus({ status, size, label, className }: InvoiceStatusProps) {
  const t = useZwT();
  const s = INVOICE_STATUS[status] ?? INVOICE_STATUS.draft;
  return (
    <Badge tone={s.tone} icon={s.icon} size={size} className={className}>
      {label ?? t(`invoiceStatus.${status in INVOICE_STATUS ? status : 'draft'}`)}
    </Badge>
  );
}

export interface QuoteStatusProps {
  status: QuoteStatusKey;
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
}

export function QuoteStatus({ status, size, label, className }: QuoteStatusProps) {
  const t = useZwT();
  const s = QUOTE_STATUS[status] ?? QUOTE_STATUS.draft;
  return (
    <Badge tone={s.tone} icon={s.icon} size={size} className={className}>
      {label ?? t(`quoteStatus.${status in QUOTE_STATUS ? status : 'draft'}`)}
    </Badge>
  );
}

export interface ComplianceStatusProps {
  status: ComplianceStatusKey;
  variant?: 'badge' | 'detailed';
  detail?: React.ReactNode;
  meta?: React.ReactNode;
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
}

/**
 * E-invoicing result. Render ONLY what validation / the platform returned — never "accepted"
 * by default (design-system/docs/compliance-states.md).
 */
export function ComplianceStatus({
  status,
  variant = 'badge',
  detail,
  meta,
  size,
  label,
  className,
}: ComplianceStatusProps) {
  const t = useZwT();
  const key: ComplianceStatusKey = status in COMPLIANCE_STATUS ? status : 'not_validated';
  const s = COMPLIANCE_STATUS[key];
  const text = label ?? t(`complianceStatus.${key}`);
  if (variant !== 'detailed') {
    return (
      <Badge tone={s.tone} icon={s.icon} size={size} className={className}>
        {text}
      </Badge>
    );
  }
  return (
    <div
      className={cx('zw-compliance', `zw-compliance--${s.tone}`, className)}
      role="status"
      aria-live="polite"
    >
      <span className="zw-compliance-icon">
        <Icon name={s.icon} size={18} />
      </span>
      <div className="zw-compliance-body">
        <div className="zw-compliance-title">{text}</div>
        {detail ? <div className="zw-compliance-detail">{detail}</div> : null}
      </div>
      {meta ? <div className="zw-compliance-meta">{meta}</div> : null}
    </div>
  );
}
