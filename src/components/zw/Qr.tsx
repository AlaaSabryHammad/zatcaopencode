'use client';

import * as React from 'react';
import qrcode from 'qrcode-generator';
import { cx } from './lib/cx';
import { useZwT } from './lib/locale';
import { COMPLIANCE_STATUS, type ComplianceStatusKey } from './lib/status';
import { Icon } from './Icon';

export interface QrCodeProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  label?: string;
  className?: string;
}

/** Renders a QR as crisp SVG modules. Never mirrored in RTL. */
export function QrCode({ value, size = 128, level = 'M', label, className }: QrCodeProps) {
  const t = useZwT();
  const cells = React.useMemo(() => {
    try {
      const q = qrcode(0, level);
      q.addData(value || '');
      q.make();
      const n = q.getModuleCount();
      const m: Array<[number, number]> = [];
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) m.push([c, r]);
      return { n, m };
    } catch {
      return null;
    }
  }, [value, level]);

  if (!cells) {
    return (
      <div className={cx('zw-qr', 'zw-qr--empty', className)} style={{ width: size, height: size }}>
        <Icon name="qr-code" size={24} />
      </div>
    );
  }
  const quiet = 2;
  const n = cells.n + quiet * 2;
  return (
    <svg
      className={cx('zw-qr', className)}
      width={size}
      height={size}
      viewBox={`0 0 ${n} ${n}`}
      role="img"
      aria-label={label ?? t('qrLabel')}
      shapeRendering="crispEdges"
    >
      <rect width={n} height={n} className="zw-qr-bg" />
      <path className="zw-qr-fg" d={cells.m.map(([x, y]) => `M${x + quiet} ${y + quiet}h1v1h-1z`).join('')} />
    </svg>
  );
}

const QR_STEPS = ['generated', 'validated', 'compliance', 'reporting'] as const;
type QrStep = (typeof QR_STEPS)[number];

export interface QrPanelProps {
  /** Signed payload from the backend. Without it the panel shows the "Generated on issue" placeholder. */
  payload?: string;
  steps?: Partial<Record<QrStep, ComplianceStatusKey>>;
  size?: number;
  footnote?: React.ReactNode;
  className?: string;
}

/** QR + e-invoice step states. Steps default to `not_validated` — never assume success. */
export function QrPanel({ payload, steps, size = 120, footnote, className }: QrPanelProps) {
  const t = useZwT();
  return (
    <div className={cx('zw-qrpanel', className)}>
      <div className="zw-qrpanel-code">
        {payload ? (
          <QrCode value={payload} size={size} />
        ) : (
          <div className="zw-qr zw-qr--empty" style={{ width: size, height: size }}>
            <Icon name="qr-code" size={24} />
            <span>{t('qrPending')}</span>
          </div>
        )}
      </div>
      <ul className="zw-qrpanel-steps">
        {QR_STEPS.map((key) => {
          const v = steps?.[key] ?? 'not_validated';
          const c = COMPLIANCE_STATUS[v] ?? COMPLIANCE_STATUS.not_validated;
          return (
            <li key={key} className={`zw-qrpanel-step zw-qrpanel-step--${c.tone}`}>
              <span className="zw-qrpanel-ico">
                <Icon name={c.icon} size={14} strokeWidth={2} />
              </span>
              <span className="zw-qrpanel-name">{t(`qrSteps.${key}`)}</span>
              <span className="zw-qrpanel-val">{t(`complianceStatus.${v}`)}</span>
            </li>
          );
        })}
      </ul>
      {footnote ? <div className="zw-qrpanel-foot">{footnote}</div> : null}
    </div>
  );
}
