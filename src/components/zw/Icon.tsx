import * as React from 'react';
import { cx } from './lib/cx';
import { ICON_NODES as BASE_NODES } from './lib/icon-nodes';
import { ICON_EXTRAS } from './lib/icon-extras';

const ICON_NODES = { ...BASE_NODES, ...ICON_EXTRAS };
export const ICON_NAMES = Object.keys(ICON_NODES);

/** Directional icons flip in RTL (design-system/docs/bilingual-rtl.md). */
const MIRROR = new Set([
  'chevron-right',
  'chevron-left',
  'arrow-right',
  'arrow-left',
  'arrow-up-right',
  'arrow-down-right',
  'log-out',
  'send',
  'panel-left',
  'list-filter',
]);

export interface IconProps {
  name: string;
  size?: number;
  strokeWidth?: number;
  /** Accessible label; when omitted the icon is decorative (aria-hidden). */
  label?: string;
  /** Set false to opt a directional icon out of RTL mirroring. */
  mirror?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Lucide line icons, 24px grid, 1.75px stroke — the curated set from the design system. */
export function Icon({ name, size = 18, strokeWidth = 1.75, label, mirror, className, style }: IconProps) {
  const nodes = ICON_NODES[name];
  if (!nodes) {
    if (process.env.NODE_ENV !== 'production') console.warn(`[zw] Unknown icon "${name}"`);
    return null;
  }
  return (
    <svg
      className={cx('zw-icon', MIRROR.has(name) && mirror !== false && 'zw-icon--dir', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      style={style}
    >
      {nodes.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}
