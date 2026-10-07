'use client';

import * as React from 'react';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { cx } from './lib/cx';
import { useLang } from './lib/locale';
import { Icon } from './Icon';

export interface MenuItem {
  label?: React.ReactNode;
  icon?: string;
  shortcut?: string;
  description?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  divider?: boolean;
  heading?: React.ReactNode;
}

export interface DropdownMenuProps {
  trigger: React.ReactElement;
  items: MenuItem[];
  align?: 'start' | 'end';
  width?: number;
  header?: React.ReactNode;
  defaultOpen?: boolean;
  /** Render inline instead of in a portal (gallery previews). */
  inline?: boolean;
}

/** Action menu (Radix): typeahead, arrow keys, Escape, focus return, collision handling. */
export function DropdownMenu({
  trigger,
  items,
  align = 'start',
  width,
  header,
  defaultOpen,
  inline,
}: DropdownMenuProps) {
  const lang = useLang();
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const content = (
    <Menu.Content
      align={align}
      sideOffset={6}
      collisionPadding={8}
      className={cx('zw-menu', 'zw-pop', 'zw-pop--radix', width && 'zw-menu--w', lang === 'ar' && 'zw-ar')}
      style={width ? { width } : undefined}
    >
      {header ? <div className="zw-menu-header">{header}</div> : null}
      {items.map((it, i) => {
        if (it.divider) return <Menu.Separator key={i} className="zw-menu-sep" />;
        if (it.heading)
          return (
            <Menu.Label key={i} className="zw-menu-heading">
              {it.heading}
            </Menu.Label>
          );
        return (
          <Menu.Item
            key={i}
            disabled={it.disabled}
            onSelect={() => it.onSelect?.()}
            className={cx('zw-menu-item', it.danger && 'is-danger')}
          >
            {it.icon ? <Icon name={it.icon} size={16} /> : null}
            <span className="zw-menu-label">
              {it.label}
              {it.description ? <span className="zw-menu-desc">{it.description}</span> : null}
            </span>
            {it.shortcut ? <kbd className="zw-kbd">{it.shortcut}</kbd> : null}
          </Menu.Item>
        );
      })}
    </Menu.Content>
  );
  return (
    <Menu.Root dir={dir} defaultOpen={defaultOpen} modal={!inline}>
      <Menu.Trigger asChild>{trigger}</Menu.Trigger>
      {inline ? content : <Menu.Portal>{content}</Menu.Portal>}
    </Menu.Root>
  );
}
