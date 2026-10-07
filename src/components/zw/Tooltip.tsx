'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cx } from './lib/cx';
import { useLang } from './lib/locale';

export interface TooltipProps {
  content: React.ReactNode;
  shortcut?: string;
  side?: 'top' | 'bottom';
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/** Hover/focus tooltip (Radix). Never put essential information only in a tooltip. */
export function Tooltip({ content, shortcut, side = 'top', defaultOpen, children }: TooltipProps) {
  const lang = useLang();
  return (
    <TooltipPrimitive.Provider delayDuration={250} skipDelayDuration={150}>
      <TooltipPrimitive.Root defaultOpen={defaultOpen} open={defaultOpen ? true : undefined}>
        <TooltipPrimitive.Trigger asChild>
          <span className="zw-tip-wrap">{children}</span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={8}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            className={cx('zw-tip', 'zw-tip--radix', lang === 'ar' && 'zw-ar')}
          >
            {content}
            {shortcut ? <kbd className="zw-kbd zw-kbd--inverse">{shortcut}</kbd> : null}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
