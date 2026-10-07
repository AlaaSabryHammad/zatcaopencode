'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter, Link } from '@/i18n/navigation';
import { AppShell, Sidebar, Topbar, CommandMenu, type Org } from '@/components/zw';
import { useToggleLocale, useThemeToggle } from '@/components/app/locale-theme-controls';
import { logout } from '@/server/actions/auth.actions';
import { switchOrg, startNewOrg } from '@/server/actions/org.actions';

export interface ShellNav {
  active: string;
  title: string;
}

function useActiveNav(): ShellNav {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const seg = pathname.split('/').filter(Boolean).pop() ?? '';
  const map: Record<string, { active: string; key: string }> = {
    dashboard: { active: 'dashboard', key: 'dashboard' },
    users: { active: 'users', key: 'users' },
    roles: { active: 'roles', key: 'users' },
    security: { active: 'security', key: 'security' },
  };
  const m = map[seg] ?? { active: 'dashboard', key: 'dashboard' };
  return { active: m.active, title: t(m.key as 'dashboard') };
}

export function AppShellClient({
  userName,
  orgs,
  currentOrgId,
  notifCount,
  children,
}: {
  userName: string;
  orgs: Org[];
  currentOrgId: string;
  notifCount: number;
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const toggleLocale = useToggleLocale();
  const { theme, toggle: toggleTheme } = useThemeToggle();
  const nav = useActiveNav();
  const [collapsed, setCollapsed] = React.useState(false);
  const [cmdOpen, setCmdOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  async function doLogout() {
    await logout();
    router.push('/auth/login');
    router.refresh();
  }

  async function doSwitch(id: string) {
    const res = await switchOrg(id);
    if (res.ok) {
      router.push('/dashboard');
      router.refresh();
    }
  }

  async function doCreateOrg() {
    const res = await startNewOrg();
    if (res.ok) router.push('/onboarding');
  }

  const soon = t('onboarding.soon');
  const sections = [
    {
      items: [{ id: 'dashboard', label: t('nav.dashboard'), icon: 'layout-dashboard', href: '/dashboard' }],
    },
    {
      heading: t('nav.sales'),
      items: [
        { id: 'sales', label: t('nav.sales'), icon: 'shopping-cart', badge: soon },
        { id: 'customers', label: t('nav.customers'), icon: 'users', badge: soon },
        { id: 'payments', label: t('nav.payments'), icon: 'wallet', badge: soon },
      ],
    },
    {
      heading: t('nav.purchases'),
      items: [
        { id: 'purchases', label: t('nav.purchases'), icon: 'receipt', badge: soon },
        { id: 'expenses', label: t('nav.expenses'), icon: 'banknote', badge: soon },
        { id: 'suppliers', label: t('nav.suppliers'), icon: 'truck', badge: soon },
      ],
    },
    {
      items: [
        { id: 'products', label: t('nav.products'), icon: 'package', badge: soon },
        { id: 'inventory', label: t('nav.inventory'), icon: 'boxes', badge: soon },
      ],
    },
    {
      heading: t('nav.finance'),
      items: [
        { id: 'reports', label: t('nav.reports'), icon: 'chart-column', badge: soon },
        { id: 'accounting', label: t('nav.accounting'), icon: 'calculator', badge: soon },
        { id: 'banking', label: t('nav.banking'), icon: 'landmark', badge: soon },
        { id: 'vat', label: t('nav.vat'), icon: 'percent', badge: soon },
        { id: 'einvoicing', label: t('nav.einvoicing'), icon: 'shield-check', badge: soon },
      ],
    },
    {
      heading: t('nav.workspace'),
      items: [
        { id: 'branches', label: t('nav.branches'), icon: 'building-2', badge: soon },
        {
          id: 'users',
          label: t('nav.users'),
          icon: 'user-cog',
          href: '/settings/users',
          children: [
            { id: 'users', label: t('users.title'), href: '/settings/users' },
            { id: 'roles', label: t('roles.title'), href: '/settings/roles' },
            { id: 'security', label: t('nav.security'), href: '/settings/security' },
          ],
        },
        { id: 'notifications', label: t('nav.notifications'), icon: 'bell', badge: soon },
        { id: 'settings', label: t('nav.settings'), icon: 'settings', badge: soon },
        { id: 'help', label: t('nav.help'), icon: 'life-buoy', badge: soon },
      ],
    },
  ];

  return (
    <>
      <AppShell
        collapsed={collapsed}
        assistant={false}
        sidebar={
          <Sidebar
            sections={sections}
            active={nav.active}
            collapsed={collapsed}
            onToggle={() => setCollapsed((v) => !v)}
            onNavigate={() => {}}
            orgs={orgs}
            currentOrg={currentOrgId}
            onSwitchOrg={doSwitch}
            onCreateOrg={doCreateOrg}
            LinkComponent={Link as unknown as React.ComponentType<React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>}
          />
        }
        topbar={
          <Topbar
            title={nav.title}
            onSearch={() => setCmdOpen(true)}
            onMenu={() => setCollapsed((v) => !v)}
            quickCreate={[
              { label: `${t('nav.sales')} · ${soon}`, icon: 'receipt', disabled: true },
              { label: `${t('nav.customers')} · ${soon}`, icon: 'user-plus', disabled: true },
              { label: `${t('nav.products')} · ${soon}`, icon: 'package', disabled: true },
            ]}
            notifications={notifCount}
            onNotifications={() => router.push('/dashboard')}
            onToggleLang={toggleLocale}
            theme={theme}
            onToggleTheme={toggleTheme}
            user={{ name: userName }}
          />
        }
      >
        {children}
      </AppShell>
      <CommandMenu
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        groups={[
          {
            heading: t('nav.goTo'),
            items: [
              { label: t('nav.dashboard'), icon: 'layout-dashboard', keywords: locale === 'ar' ? 'dashboard لوحة' : 'dashboard', onSelect: () => router.push('/dashboard') },
              { label: t('users.title'), icon: 'users', onSelect: () => router.push('/settings/users') },
              { label: t('roles.title'), icon: 'user-cog', onSelect: () => router.push('/settings/roles') },
              { label: t('nav.security'), icon: 'lock', onSelect: () => router.push('/settings/security') },
            ],
          },
          {
            heading: t('zw.quickCreate'),
            items: [
              { label: t('common.switchLanguage'), icon: 'languages', onSelect: () => { toggleLocale(); setCmdOpen(false); } },
              { label: t('common.theme'), icon: theme === 'dark' ? 'sun' : 'moon', onSelect: () => toggleTheme() },
              { label: t('nav.logout'), icon: 'log-out', onSelect: () => { setCmdOpen(false); doLogout(); } },
            ],
          },
        ]}
      />
    </>
  );
}
