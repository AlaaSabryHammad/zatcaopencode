import type { IconNode } from './icon-nodes';

/**
 * Lucide icons (ISC) referenced by the reference bundle's status maps / nav fallback but missing
 * from its curated ICON_NODES (the reference renders nothing for them). Same geometry as lucide.
 */
export const ICON_EXTRAS: Record<string, IconNode> = {
  'circle-dot': [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['circle', { cx: '12', cy: '12', r: '1' }],
  ],
};
