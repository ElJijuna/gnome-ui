import { DashboardGrid, PageContent, SectionHeader, StatCard } from '@gnome-ui/layout';
import { Button, Card, Text } from '@gnome-ui/react';
import { useNavigate } from 'react-router';

import { InlineMarkdown } from '@/components/InlineMarkdown';
import { components, hooks, packages } from '@/generated/registry';
import { useTranslation } from '@/i18n/I18nContext';

const ICON_COUNT = 672;

export const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <PageContent maxWidth="xl">
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--gnome-space-6) 0 var(--gnome-space-4)',
        }}
      >
        <Text variant="title-1" as="h1">
          {t('home.title')}
        </Text>
        <Text
          variant="body"
          color="dim"
          style={{ maxWidth: 560, margin: 'var(--gnome-space-2) auto 0', display: 'block' }}
        >
          {t('home.subtitle')}
        </Text>
        <div
          style={{
            display: 'flex',
            gap: 'var(--gnome-space-2)',
            justifyContent: 'center',
            marginTop: 'var(--gnome-space-4)',
          }}
        >
          <Button variant="suggested" onClick={() => navigate('/components')}>
            {t('home.browseComponents')}
          </Button>
          <Button onClick={() => navigate('/icons')}>{t('home.browseIcons')}</Button>
        </div>
      </div>

      <DashboardGrid columns={4} gap="md" style={{ marginBottom: 'var(--gnome-space-6)' }}>
        <StatCard value={components.length} label={t('home.statsComponents')} />
        <StatCard value={hooks.length} label={t('home.statsHooks')} />
        <StatCard value={ICON_COUNT} label={t('home.statsIcons')} />
        <StatCard value={packages.length} label={t('home.statsPackages')} />
      </DashboardGrid>

      <SectionHeader title={t('nav.packages')} />
      <DashboardGrid columns="auto" gap="md">
        {packages.map((pkg) => (
          <Card key={pkg.id} interactive onClick={() => navigate('/packages')} padding="sm">
            <Text variant="title-4">{pkg.packageName}</Text>
            <Text variant="caption" color="dim">
              v{pkg.version}
            </Text>
            <div style={{ marginTop: 'var(--gnome-space-1)', textAlign: 'left' }}>
              <InlineMarkdown text={pkg.description} />
            </div>
          </Card>
        ))}
      </DashboardGrid>
    </PageContent>
  );
};
