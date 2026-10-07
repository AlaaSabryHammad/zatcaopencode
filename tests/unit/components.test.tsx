import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import {
  Amount,
  Button,
  ComplianceStatus,
  EmptyState,
  Icon,
  InvoiceStatus,
  QrPanel,
  Stepper,
  Tabs,
  UsageMeter,
  VatInput,
  initialsFor,
} from '@/components/zw';
import { renderWithIntl } from './render';

describe('Amount', () => {
  it('renders LTR with currency label per locale', () => {
    const { container } = renderWithIntl(<Amount value={13200} />);
    const el = container.querySelector('.zw-amount')!;
    expect(el).toHaveAttribute('dir', 'ltr');
    expect(el.textContent).toBe('13,200.00SAR');
  });
  it('uses ر.س in Arabic and a true minus + danger tone for negatives', () => {
    const { container } = renderWithIntl(<Amount value={-3200} />, 'ar');
    const el = container.querySelector('.zw-amount')!;
    expect(el.textContent).toBe('−3,200.00ر.س');
    expect(el).toHaveClass('zw-amount--danger');
  });
});

describe('statuses', () => {
  it('InvoiceStatus shows icon + word (never colour alone)', () => {
    const { container } = renderWithIntl(<InvoiceStatus status="overdue" />);
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(container.querySelector('.zw-badge--danger svg')).not.toBeNull();
  });
  it('ComplianceStatus uses the fixed Arabic wording', () => {
    renderWithIntl(<ComplianceStatus status="submission_pending" />, 'ar');
    expect(screen.getByText('بانتظار الإرسال')).toBeInTheDocument();
  });
  it('detailed ComplianceStatus is a live status region', () => {
    renderWithIntl(<ComplianceStatus status="rejected" variant="detailed" detail="BR-KSA-37" />);
    expect(screen.getByRole('status')).toHaveTextContent('Rejected');
  });
});

describe('QrPanel', () => {
  it('shows the placeholder and not_validated steps when there is no payload', () => {
    renderWithIntl(<QrPanel />);
    expect(screen.getByText('Generated on issue')).toBeInTheDocument();
    expect(screen.getAllByText('Not validated')).toHaveLength(4);
    expect(screen.queryByText('Accepted')).toBeNull();
  });
});

describe('Button', () => {
  it('is disabled and busy while loading', () => {
    const onClick = vi.fn();
    renderWithIntl(
      <Button loading onClick={onClick}>
        Issue
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Issue' });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });
});

describe('Icon', () => {
  it('marks directional icons for RTL mirroring', () => {
    const { container } = renderWithIntl(<Icon name="chevron-right" />);
    expect(container.querySelector('svg')).toHaveClass('zw-icon--dir');
  });
  it('does not mirror non-directional icons', () => {
    const { container } = renderWithIntl(<Icon name="qr-code" />);
    expect(container.querySelector('svg')).not.toHaveClass('zw-icon--dir');
  });
});

describe('icon coverage', () => {
  it('every status icon exists in the icon set', async () => {
    const { INVOICE_STATUS, COMPLIANCE_STATUS, QUOTE_STATUS, ICON_NAMES } = await import('@/components/zw');
    const used = [
      ...Object.values(INVOICE_STATUS),
      ...Object.values(COMPLIANCE_STATUS),
      ...Object.values(QUOTE_STATUS),
    ].map((s) => s.icon);
    for (const name of used) expect(ICON_NAMES).toContain(name);
  });
});

describe('VatInput', () => {
  it('strips non-digits, caps at 15 and validates format', () => {
    const onChange = vi.fn();
    renderWithIntl(<VatInput label="VAT" onChange={onChange} />);
    const input = screen.getByLabelText('VAT');
    fireEvent.change(input, { target: { value: '31a0123456700003999' } });
    expect(onChange).toHaveBeenLastCalledWith('310123456700003');
    expect(screen.getByLabelText('Valid VAT number format')).toBeInTheDocument();
  });
});

describe('Tabs', () => {
  it('moves with arrow keys, reversed in RTL', () => {
    const tabs = [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
      { id: 'c', label: 'C' },
    ];
    renderWithIntl(<Tabs tabs={tabs} />, 'ar');
    const first = screen.getByRole('tab', { name: 'A' });
    fireEvent.keyDown(first, { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Stepper', () => {
  it('labels progress and marks the current step', () => {
    renderWithIntl(<Stepper steps={[{ label: 'One' }, { label: 'Two' }, { label: 'Three' }]} current={1} />);
    expect(screen.getByRole('list', { name: 'Step 2 of 3' })).toBeInTheDocument();
    expect(screen.getByText('Two').closest('li')).toHaveAttribute('aria-current', 'step');
  });
});

describe('UsageMeter', () => {
  it('warns at ≥80% and shows unlimited without a limit', () => {
    const { container } = renderWithIntl(<UsageMeter label="Users" used={9} limit={10} />);
    expect(container.querySelector('.zw-meter-note--warning')).not.toBeNull();
    renderWithIntl(<UsageMeter label="Branches" used={4} limit={null} />);
    expect(screen.getByText(/Unlimited/)).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders title, description and action', () => {
    renderWithIntl(
      <EmptyState
        title="No invoices yet"
        description="Create your first invoice."
        action={<Button>Create invoice</Button>}
      />,
    );
    expect(screen.getByRole('heading', { name: 'No invoices yet' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create invoice' })).toBeInTheDocument();
  });
});

describe('initialsFor', () => {
  it('skips company stop-words and the Arabic article', () => {
    expect(initialsFor('Faisal Al-Otaibi')).toBe('FA');
    expect(initialsFor('شركة البناء الحديث')).toBe('ب');
    expect(initialsFor('Al Waha Hospitality Co.')).toBe('AH');
  });
});

describe('messages parity', () => {
  it('ar and en define the same keys', async () => {
    const en = (await import('../../messages/en.json')).default;
    const ar = (await import('../../messages/ar.json')).default;
    const keys = (o: unknown, p = ''): string[] =>
      o && typeof o === 'object' && !Array.isArray(o)
        ? Object.entries(o).flatMap(([k, v]) => keys(v, p ? `${p}.${k}` : k))
        : [p];
    expect(keys(ar).sort()).toEqual(keys(en).sort());
  });
});
