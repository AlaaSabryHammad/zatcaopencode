'use client';

import * as React from 'react';
import { cx } from './lib/cx';
import { useLang, useZwT } from './lib/locale';
import { useOutside } from './lib/use-outside';
import type { Tone } from './lib/types';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { Button, IconButton } from './Button';
import { Avatar, Progress } from './Display';
import { Badge } from './Badge';
import { Breadcrumb, type BreadcrumbItem } from './Navigation';
import { DropdownMenu, type MenuItem } from './DropdownMenu';
import { Tooltip } from './Tooltip';

/* ─────────────────────────── OrgSwitcher ─────────────────────────── */

export interface Org {
  id: string;
  name: string;
  vat?: string;
  role?: string;
  plan?: string;
}

export interface OrgSwitcherProps {
  orgs: Org[];
  current?: string;
  onSwitch?: (id: string) => void;
  onCreate?: () => void;
  collapsed?: boolean;
  placement?: 'up' | 'start' | 'end';
  defaultOpen?: boolean;
  className?: string;
}

export function OrgSwitcher({
  orgs,
  current,
  onSwitch,
  onCreate,
  collapsed,
  placement = 'up',
  defaultOpen,
  className,
}: OrgSwitcherProps) {
  const t = useZwT();
  const cur = orgs.find((o) => o.id === current) ?? orgs[0];
  const [open, setOpen] = React.useState(!!defaultOpen);
  const ref = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setOpen(false), []);
  useOutside(ref, open && !defaultOpen, close);
  if (!cur) return null;
  return (
    <div ref={ref} className={cx('zw-pop-wrap', 'zw-org', collapsed && 'is-collapsed', className)}>
      <button
        type="button"
        className="zw-org-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={collapsed ? `${t('switchOrg')}: ${cur.name}` : undefined}
        onClick={() => setOpen(!open)}
      >
        <Avatar name={cur.name} size="md" square />
        {collapsed ? null : (
          <span className="zw-org-text">
            <span className="zw-org-name">{cur.name}</span>
            <span className="zw-org-meta">
              {cur.role}
              {cur.plan ? ` · ${cur.plan}` : ''}
            </span>
          </span>
        )}
        {collapsed ? null : <Icon name="chevrons-up-down" size={16} className="zw-org-caret" />}
      </button>
      {open ? (
        <div
          className={cx('zw-pop', 'zw-org-pop', `zw-pop--${placement}`)}
          role="listbox"
          aria-label={t('switchOrg')}
        >
          <div className="zw-menu-heading">{t('yourOrgs')}</div>
          {orgs.map((o) => {
            const on = o.id === cur.id;
            return (
              <button
                key={o.id}
                type="button"
                role="option"
                aria-selected={on}
                className={cx('zw-org-item', on && 'is-current')}
                onClick={() => {
                  setOpen(false);
                  onSwitch?.(o.id);
                }}
              >
                <Avatar name={o.name} size="sm" square />
                <span className="zw-org-text">
                  <span className="zw-org-name">{o.name}</span>
                  <span className="zw-org-meta zw-mono" dir="ltr">
                    {o.vat ?? o.role}
                  </span>
                </span>
                {on ? <Icon name="check" size={16} className="zw-option-check" /> : null}
              </button>
            );
          })}
          <div className="zw-menu-sep" />
          <button type="button" className="zw-menu-item" onClick={onCreate}>
            <Icon name="plus" size={16} />
            <span className="zw-menu-label">{t('addOrg')}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ──────────────────────────── Sidebar ──────────────────────────── */

export interface NavItem {
  id: string;
  label: React.ReactNode;
  icon?: string;
  href?: string;
  badge?: React.ReactNode;
  badgeTone?: 'danger' | 'accent';
  defaultOpen?: boolean;
  children?: Array<{ id: string; label: React.ReactNode; href?: string; badge?: React.ReactNode }>;
}

/** Link renderer so the app can inject next-intl's <Link> without coupling the design system to routing. */
export type NavLinkComponent = React.ComponentType<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>;
const DefaultLink: NavLinkComponent = (props) => <a {...props} />;

function NavItemRow({
  item,
  active,
  collapsed,
  onNavigate,
  LinkComponent,
}: {
  item: NavItem;
  active?: string;
  collapsed?: boolean;
  onNavigate?: (id: string) => void;
  LinkComponent: NavLinkComponent;
}) {
  const on = active === item.id;
  const hasKids = !!item.children?.length;
  const childOn = hasKids && item.children!.some((c) => c.id === active);
  const [open, setOpen] = React.useState(!!(childOn || item.defaultOpen));
  const label = typeof item.label === 'string' ? item.label : undefined;
  const inner = (
    <>
      <Icon name={item.icon ?? 'circle-dot'} size={18} />
      {collapsed ? null : <span className="zw-nav-label">{item.label}</span>}
      {!collapsed && item.badge != null ? (
        <span className={cx('zw-nav-badge', item.badgeTone && `zw-nav-badge--${item.badgeTone}`)}>
          {item.badge}
        </span>
      ) : null}
      {!collapsed && hasKids ? (
        <Icon name="chevron-down" size={16} className={cx('zw-nav-caret', open && 'is-open')} />
      ) : null}
    </>
  );
  const cls = cx('zw-nav-item', (on || (childOn && collapsed)) && 'is-active', childOn && 'has-active');
  return (
    <li className="zw-nav-li">
      {hasKids ? (
        <button
          type="button"
          className={cls}
          aria-expanded={open}
          title={collapsed ? label : undefined}
          onClick={() => setOpen(!open)}
        >
          {inner}
        </button>
      ) : (
        <LinkComponent
          href={item.href ?? '#'}
          className={cls}
          aria-current={on ? 'page' : undefined}
          title={collapsed ? label : undefined}
          onClick={
            onNavigate
              ? (e) => {
                  if (!item.href) e.preventDefault();
                  onNavigate(item.id);
                }
              : undefined
          }
        >
          {inner}
        </LinkComponent>
      )}
      {hasKids && open && !collapsed ? (
        <ul className="zw-nav-sub">
          {item.children!.map((c) => (
            <li key={c.id}>
              <LinkComponent
                href={c.href ?? '#'}
                className={cx('zw-nav-subitem', active === c.id && 'is-active')}
                aria-current={active === c.id ? 'page' : undefined}
                onClick={
                  onNavigate
                    ? (e) => {
                        if (!c.href) e.preventDefault();
                        onNavigate(c.id);
                      }
                    : undefined
                }
              >
                {c.label}
                {c.badge != null ? <span className="zw-nav-badge">{c.badge}</span> : null}
              </LinkComponent>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export interface SidebarProps {
  sections: Array<{ heading?: React.ReactNode; items: NavItem[] }>;
  active?: string;
  onNavigate?: (id: string) => void;
  collapsed?: boolean;
  onToggle?: () => void;
  favorites?: Array<{ id: string; label: React.ReactNode; href?: string }>;
  plan?: { name: string; badge?: string; tone?: Tone; used?: number; limit?: number; meter?: string };
  orgs?: Org[];
  currentOrg?: string;
  onSwitchOrg?: (id: string) => void;
  onCreateOrg?: () => void;
  LinkComponent?: NavLinkComponent;
  className?: string;
}

export function Sidebar({
  sections,
  active,
  onNavigate,
  collapsed,
  onToggle,
  favorites,
  plan,
  orgs,
  currentOrg,
  onSwitchOrg,
  onCreateOrg,
  LinkComponent = DefaultLink,
  className,
}: SidebarProps) {
  const t = useZwT();
  const lang = useLang();
  return (
    <aside className={cx('zw-sidebar', collapsed && 'is-collapsed', className)} aria-label={t('mainNav')}>
      <div className="zw-sidebar-brand">
        <Logo variant={collapsed ? 'mark' : lang === 'ar' ? 'arabic' : 'full'} size={28} />
        {onToggle ? (
          <IconButton
            icon="panel-left"
            label={t('collapseSidebar')}
            size="sm"
            onClick={onToggle}
            className="zw-sidebar-toggle"
          />
        ) : null}
      </div>
      <nav className="zw-sidebar-nav">
        {favorites?.length && !collapsed ? (
          <div className="zw-nav-section">
            <div className="zw-nav-heading">
              <Icon name="star" size={12} />
              {t('favorites')}
            </div>
            <ul className="zw-nav-favs">
              {favorites.map((f) => (
                <li key={f.id}>
                  <LinkComponent href={f.href ?? '#'} className="zw-nav-fav">
                    <span className="zw-nav-fav-dot" />
                    {f.label}
                  </LinkComponent>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {sections.map((s, i) => (
          <div key={i} className="zw-nav-section">
            {s.heading && !collapsed ? (
              <div className="zw-nav-heading">{s.heading}</div>
            ) : s.heading ? (
              <div className="zw-nav-rule" />
            ) : null}
            <ul>
              {s.items.map((it) => (
                <NavItemRow
                  key={it.id}
                  item={it}
                  active={active}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                  LinkComponent={LinkComponent}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="zw-sidebar-foot">
        {plan && !collapsed ? (
          <div className="zw-plan">
            <div className="zw-plan-row">
              <span className="zw-plan-name">{plan.name}</span>
              {plan.badge ? (
                <Badge tone={plan.tone ?? 'accent'} size="sm">
                  {plan.badge}
                </Badge>
              ) : null}
            </div>
            {plan.used != null && plan.limit ? (
              <Progress
                value={(plan.used / plan.limit) * 100}
                tone={plan.used / plan.limit >= 0.8 ? 'warning' : undefined}
                label={plan.meter}
              />
            ) : null}
            {plan.meter ? <div className="zw-plan-meta zw-tnum">{plan.meter}</div> : null}
          </div>
        ) : null}
        {orgs ? (
          <OrgSwitcher
            orgs={orgs}
            current={currentOrg}
            collapsed={collapsed}
            onSwitch={onSwitchOrg}
            onCreate={onCreateOrg}
          />
        ) : null}
      </div>
    </aside>
  );
}

/* ──────────────────────────── Topbar ──────────────────────────── */

export interface TopbarProps {
  breadcrumbs?: BreadcrumbItem[];
  title?: React.ReactNode;
  onSearch?: () => void;
  quickCreate?: MenuItem[];
  notifications?: number;
  onNotifications?: () => void;
  onToggleLang?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onHelp?: () => void;
  user?: { name: string; src?: string };
  onMenu?: () => void;
  className?: string;
}

export function Topbar({
  breadcrumbs,
  title,
  onSearch,
  quickCreate,
  notifications,
  onNotifications,
  onToggleLang,
  theme,
  onToggleTheme,
  onHelp,
  user,
  onMenu,
  className,
}: TopbarProps) {
  const t = useZwT();
  const lang = useLang();
  return (
    <header className={cx('zw-topbar', className)}>
      {onMenu ? (
        <IconButton icon="panel-left" label={t('menu')} className="zw-topbar-menu" onClick={onMenu} />
      ) : null}
      <div className="zw-topbar-start">
        {breadcrumbs ? (
          <Breadcrumb items={breadcrumbs} />
        ) : title ? (
          <div className="zw-topbar-title">{title}</div>
        ) : null}
      </div>
      <button
        type="button"
        className="zw-search-trigger"
        onClick={onSearch}
        aria-label={t('searchAll')}
        aria-keyshortcuts="Control+K Meta+K"
      >
        <Icon name="search" size={16} />
        <span className="zw-search-trigger-text">{t('searchAll')}</span>
        <span className="zw-search-kbd">
          <kbd className="zw-kbd">⌘</kbd>
          <kbd className="zw-kbd">K</kbd>
        </span>
      </button>
      <div className="zw-topbar-end">
        {quickCreate ? (
          <DropdownMenu
            align="end"
            width={240}
            trigger={
              <Button size="sm" iconStart="plus" kbd="N" aria-keyshortcuts="N">
                {t('create')}
              </Button>
            }
            items={quickCreate}
          />
        ) : null}
        <Tooltip content={t('notifications')} side="bottom">
          <IconButton
            icon="bell"
            label={t('notifications')}
            badge={notifications || null}
            onClick={onNotifications}
          />
        </Tooltip>
        <button
          type="button"
          className="zw-lang-toggle"
          onClick={onToggleLang}
          aria-label={t('language')}
          lang={lang === 'ar' ? 'en' : 'ar'}
        >
          <Icon name="languages" size={16} />
          <span>{lang === 'ar' ? 'EN' : 'ع'}</span>
        </button>
        <Tooltip content={t('theme')} side="bottom">
          <IconButton icon={theme === 'dark' ? 'sun' : 'moon'} label={t('theme')} onClick={onToggleTheme} />
        </Tooltip>
        <Tooltip content={t('help')} side="bottom">
          <IconButton icon="circle-help" label={t('help')} onClick={onHelp} />
        </Tooltip>
        {user ? (
          <span className="zw-topbar-user">
            <Avatar name={user.name} src={user.src} size="sm" status="online" />
          </span>
        ) : null}
      </div>
    </header>
  );
}

/* ──────────────────────────── AppShell ──────────────────────────── */

export interface AppShellProps {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children?: React.ReactNode;
  height?: number | string;
  assistant?: boolean;
  onAssistant?: () => void;
  collapsed?: boolean;
  className?: string;
}

export function AppShell({
  sidebar,
  topbar,
  children,
  height,
  assistant = true,
  onAssistant,
  collapsed,
  className,
}: AppShellProps) {
  const t = useZwT();
  return (
    <div
      className={cx('zw-shell', collapsed && 'is-collapsed', className)}
      style={height ? { height } : undefined}
    >
      {sidebar}
      <div className="zw-shell-main">
        {topbar}
        <main className="zw-shell-content" id="main">
          {children}
        </main>
      </div>
      {assistant ? (
        <button type="button" className="zw-ai-fab" onClick={onAssistant}>
          <Icon name="sparkles" size={18} />
          <span>{t('askAi')}</span>
        </button>
      ) : null}
    </div>
  );
}
