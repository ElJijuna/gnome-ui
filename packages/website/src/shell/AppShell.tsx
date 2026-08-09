import {
  ApplicationsEngineering,
  EmojiObjects,
  GoHome,
  PackageXGeneric,
  ViewAppGrid,
} from '@gnome-ui/icons';
import { AppHeader, Layout } from '@gnome-ui/layout';
import { Icon, Sidebar, SidebarItem, Text } from '@gnome-ui/react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useTranslation } from '@/i18n/I18nContext';
import { LocaleToggle } from '@/i18n/LocaleToggle';
import { ThemeToggle } from '@/theme/ThemeToggle';

const NAV_ITEMS = [
  { path: '/', labelKey: 'nav.home', icon: GoHome },
  { path: '/components', labelKey: 'nav.components', icon: ViewAppGrid },
  { path: '/hooks', labelKey: 'nav.hooks', icon: ApplicationsEngineering },
  { path: '/icons', labelKey: 'nav.icons', icon: EmojiObjects },
  { path: '/packages', labelKey: 'nav.packages', icon: PackageXGeneric },
] as const;

function isActive(pathname: string, itemPath: string): boolean {
  return itemPath === '/' ? pathname === '/' : pathname.startsWith(itemPath);
}

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const sidebar = (
    <Sidebar aria-label={t('nav.home')}>
      {NAV_ITEMS.map((item) => (
        <SidebarItem
          key={item.path}
          icon={item.icon}
          label={t(item.labelKey)}
          active={isActive(location.pathname, item.path)}
          onClick={() => navigate(item.path)}
        />
      ))}
    </Sidebar>
  );

  const header = (
    <AppHeader
      leading={
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <Icon icon={GoHome} size="md" aria-hidden />
          <Text variant="title-4">GNOME UI</Text>
        </button>
      }
      actions={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <LocaleToggle />
          <ThemeToggle />
        </div>
      }
    />
  );

  return (
    <Layout
      header={header}
      sidebar={sidebar}
      sidebarCollapseMode="overlay"
      sidebarLabel={t('nav.home')}
    >
      {children}
    </Layout>
  );
};
