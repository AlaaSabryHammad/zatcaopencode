import type { Tone } from './types';

export type InvoiceStatusKey =
  | 'draft'
  | 'pending'
  | 'issued'
  | 'sent'
  | 'viewed'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'credited';

export type ComplianceStatusKey =
  'not_validated' | 'passed' | 'warning' | 'submission_pending' | 'accepted' | 'rejected' | 'requires_action';

export type QuoteStatusKey = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';

interface StatusDef {
  tone: Tone;
  icon: string;
}

/** Fixed tone + icon per state (design-system/docs/compliance-states.md). Labels come from messages. */
export const INVOICE_STATUS: Record<InvoiceStatusKey, StatusDef> = {
  draft: { tone: 'neutral', icon: 'pencil' },
  pending: { tone: 'info', icon: 'clock' },
  issued: { tone: 'brand', icon: 'file-check' },
  sent: { tone: 'info', icon: 'send' },
  viewed: { tone: 'info', icon: 'eye' },
  partially_paid: { tone: 'warning', icon: 'circle-dot' },
  paid: { tone: 'success', icon: 'circle-check' },
  overdue: { tone: 'danger', icon: 'circle-alert' },
  cancelled: { tone: 'neutral', icon: 'x' },
  credited: { tone: 'accent', icon: 'file-minus' },
};

export const COMPLIANCE_STATUS: Record<ComplianceStatusKey, StatusDef> = {
  not_validated: { tone: 'neutral', icon: 'circle-dot' },
  passed: { tone: 'success', icon: 'circle-check' },
  warning: { tone: 'warning', icon: 'triangle-alert' },
  submission_pending: { tone: 'info', icon: 'clock' },
  accepted: { tone: 'success', icon: 'shield-check' },
  rejected: { tone: 'danger', icon: 'x' },
  requires_action: { tone: 'warning', icon: 'circle-alert' },
};

export const QUOTE_STATUS: Record<QuoteStatusKey, StatusDef> = {
  draft: INVOICE_STATUS.draft,
  sent: INVOICE_STATUS.sent,
  viewed: INVOICE_STATUS.viewed,
  accepted: { tone: 'success', icon: 'circle-check' },
  rejected: { tone: 'danger', icon: 'x' },
  expired: { tone: 'neutral', icon: 'clock' },
};
