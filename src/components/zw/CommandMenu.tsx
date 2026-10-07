'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cx } from './lib/cx';
import { useZwT } from './lib/locale';
import { Icon } from './Icon';
import { EmptyState } from './Display';
import { OverlayFrame, focusFirstField } from './Dialog';

export interface CommandItem {
  id?: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  badge?: React.ReactNode;
  keywords?: string;
  onSelect?: () => void;
}

export interface CommandMenuProps {
  open: boolean;
  onClose?: () => void;
  groups: Array<{ heading: string; items: CommandItem[] }>;
  placeholder?: string;
  defaultQuery?: string;
  aiHint?: React.ReactNode;
  contained?: boolean;
}

/** ⌘K / Ctrl K palette. Pair with `useHotkey('mod+k')` in the app shell. */
export function CommandMenu({
  open,
  onClose,
  groups,
  placeholder,
  defaultQuery,
  aiHint,
  contained,
}: CommandMenuProps) {
  const t = useZwT();
  const [q, setQ] = React.useState(defaultQuery ?? '');
  const [active, setActive] = React.useState(0);
  const listId = React.useId();

  React.useEffect(() => {
    if (open) {
      setQ(defaultQuery ?? '');
      setActive(0);
    }
  }, [open, defaultQuery]);

  if (!open) return null;

  const needle = q.toLowerCase();
  const filtered = groups
    .map((g) => ({
      heading: g.heading,
      items: g.items.filter(
        (it) =>
          !needle ||
          `${it.label} ${it.description ?? ''} ${it.keywords ?? ''}`.toLowerCase().includes(needle),
      ),
    }))
    .filter((g) => g.items.length);
  const flat = filtered.flatMap((g) => g.items);

  const run = (it: CommandItem | undefined) => {
    if (!it) return;
    it.onSelect?.();
    onClose?.();
  };
  const onKey = (e: React.KeyboardEvent) => {
    const n = Math.max(flat.length, 1);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % n);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a - 1 + n) % n);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      run(flat[active]);
    }
  };

  let idx = -1;
  return (
    <OverlayFrame open={open} onClose={onClose} contained={contained} overlayClassName="zw-overlay--top">
      <DialogPrimitive.Content
        className="zw-cmd"
        onKeyDown={onKey}
        onOpenAutoFocus={focusFirstField}
        aria-describedby={undefined}
      >
        <DialogPrimitive.Title className="zw-sr">{t('commandMenu')}</DialogPrimitive.Title>
        <div className="zw-cmd-search">
          <Icon name="search" size={18} />
          <input
            data-autofocus
            className="zw-cmd-input"
            placeholder={placeholder ?? t('searchAll')}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            role="combobox"
            aria-expanded
            aria-controls={listId}
            aria-activedescendant={flat[active] ? `${listId}-${active}` : undefined}
          />
          <kbd className="zw-kbd">Esc</kbd>
        </div>
        <div className="zw-cmd-list" role="listbox" id={listId}>
          {filtered.length === 0 ? (
            <EmptyState compact icon="search" title={t('noResults')} description={q} />
          ) : null}
          {filtered.map((g, gi) => (
            <div key={gi} className="zw-cmd-group" role="group" aria-label={g.heading}>
              <div className="zw-cmd-heading">{g.heading}</div>
              {g.items.map((it) => {
                idx += 1;
                const my = idx;
                return (
                  <div
                    key={it.id ?? it.label}
                    id={`${listId}-${my}`}
                    role="option"
                    aria-selected={my === active}
                    className={cx('zw-cmd-item', my === active && 'is-active')}
                    onMouseEnter={() => setActive(my)}
                    onClick={() => run(it)}
                  >
                    <span className="zw-cmd-icon">
                      <Icon name={it.icon ?? 'arrow-right'} size={16} />
                    </span>
                    <span className="zw-cmd-label">
                      {it.label}
                      {it.description ? <span className="zw-cmd-desc">{it.description}</span> : null}
                    </span>
                    {it.badge ?? null}
                    {it.shortcut ? <kbd className="zw-kbd">{it.shortcut}</kbd> : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="zw-cmd-foot">
          <span>
            <kbd className="zw-kbd">↑</kbd>
            <kbd className="zw-kbd">↓</kbd> {t('navigate')}
          </span>
          <span>
            <kbd className="zw-kbd">↵</kbd> {t('open')}
          </span>
          <span className="zw-cmd-foot-end">
            <Icon name="sparkles" size={14} />
            {aiHint ?? t('askAiHint')}
          </span>
        </div>
      </DialogPrimitive.Content>
    </OverlayFrame>
  );
}
