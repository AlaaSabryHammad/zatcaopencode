import * as React from 'react';
import { cx } from './lib/cx';
import { LOGO } from './lib/logo-paths';

function MarkShapes() {
  return (
    <>
      <rect width={40} height={40} rx={10} className="zw-logo-tile" />
      <rect x={9} y={9} width={14.5} height={6} rx={1.25} className="zw-logo-glyph" />
      <rect x={25} y={9} width={6} height={6} rx={1.25} className="zw-logo-pixel" />
      <path d="M24.4 15H31L15.6 25V26H9V25Z" className="zw-logo-glyph" />
      <rect x={9} y={25} width={22} height={6} rx={1.25} className="zw-logo-glyph" />
    </>
  );
}

export function Mark({ size = 32 }: { size?: number }) {
  return (
    <svg className="zw-logo-mark" width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <MarkShapes />
    </svg>
  );
}

export interface LogoProps {
  variant?: 'full' | 'arabic' | 'mark';
  size?: number;
  className?: string;
}

/** Theme-aware logo. Never recolour or stretch (brand-book.md › Logo). */
export function Logo({ variant = 'full', size = 32, className }: LogoProps) {
  if (variant === 'mark') {
    return (
      <span className={cx('zw-logo', className)} role="img" aria-label="ZatcaWeb">
        <Mark size={size} />
      </span>
    );
  }
  const arabic = variant === 'arabic';
  const L = arabic ? LOGO.arabic : LOGO.latin;
  const hgt = arabic ? 44 : 40;
  const markX = arabic ? LOGO.arabic.markX : 0;
  return (
    <span className={cx('zw-logo', className)} role="img" aria-label={arabic ? 'زاتكا ويب' : 'ZatcaWeb'}>
      <svg
        width={(L.width * size) / 40}
        height={(hgt * size) / 40}
        viewBox={`0 0 ${L.width} ${hgt}`}
        aria-hidden
      >
        <g transform={arabic ? 'translate(0 2)' : undefined}>
          <g transform={`translate(${markX} 0)`}>
            <svg width={40} height={40} viewBox="0 0 40 40" overflow="visible">
              <MarkShapes />
            </svg>
          </g>
          <path d={L.zatca} className="zw-logo-ink" />
          <path d={L.web} className="zw-logo-web" />
        </g>
      </svg>
    </span>
  );
}
