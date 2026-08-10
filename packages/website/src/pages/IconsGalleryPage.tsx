import type { IconDefinition } from '@gnome-ui/icons';
import * as Icons from '@gnome-ui/icons';
import { Connecting, Downloading, Recording, Syncing } from '@gnome-ui/icons';
import { DashboardGrid, PageContent, SectionHeader } from '@gnome-ui/layout';
import { AnimatedIcon, Card, CopyField, Icon, Text } from '@gnome-ui/react';
import { useMemo, useState } from 'react';

import { SearchField } from '@/components/SearchField';
import { packages } from '@/generated/registry';
import { useTranslation } from '@/i18n/I18nContext';

function isIconDefinition(value: unknown): value is IconDefinition {
  return typeof value === 'object' && value !== null && 'viewBox' in value;
}

const ALL_ICONS: [string, IconDefinition][] = Object.entries(Icons).filter(
  (entry): entry is [string, IconDefinition] => isIconDefinition(entry[1]),
);

const ANIMATED_ICONS: [string, IconDefinition][] = [
  ['Syncing', Syncing],
  ['Recording', Recording],
  ['Downloading', Downloading],
  ['Connecting', Connecting],
];

export const IconsGalleryPage = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return q ? ALL_ICONS.filter(([name]) => name.toLowerCase().includes(q)) : ALL_ICONS;
  }, [query]);

  const installCommand = packages.find((candidate) => candidate.id === 'icons')?.installCommand;

  return (
    <PageContent maxWidth="xl">
      <SectionHeader title={t('icons.title')} subtitle={t('icons.subtitle')} />

      {installCommand && (
        <CopyField
          value={installCommand}
          label={t('icons.install')}
          copyLabel={t('component.copy')}
          copiedLabel={t('component.copied')}
          style={{ maxWidth: 360, marginBottom: 'var(--gnome-space-4)' }}
        />
      )}

      <SectionHeader
        title={t('icons.animatedTitle')}
        subtitle={t('icons.animatedSubtitle')}
        style={{ marginBottom: 'var(--gnome-space-2)' }}
      />
      <DashboardGrid columns={4} gap="sm" style={{ marginBottom: 'var(--gnome-space-5)' }}>
        {ANIMATED_ICONS.map(([name, icon]) => (
          <Card key={name} padding="md" style={{ textAlign: 'center' }}>
            <AnimatedIcon icon={icon} label={name} size="lg" />
            <Text
              variant="caption"
              color="dim"
              style={{ display: 'block', marginTop: 'var(--gnome-space-2)' }}
            >
              {name}
            </Text>
          </Card>
        ))}
      </DashboardGrid>

      <SearchField
        open
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => setQuery('')}
        placeholder={t('icons.searchPlaceholder')}
        aria-label={t('icons.searchPlaceholder')}
        wrapperStyle={{ marginBottom: 'var(--gnome-space-2)' }}
      />
      <Text
        variant="caption"
        color="dim"
        style={{ display: 'block', marginBottom: 'var(--gnome-space-4)' }}
      >
        {t('icons.count', { count: filtered.length })}
      </Text>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
          gap: 'var(--gnome-space-1)',
        }}
      >
        {filtered.map(([name, icon]) => (
          <div
            key={name}
            title={name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--gnome-space-1)',
              padding: 'var(--gnome-space-2)',
              borderRadius: 'var(--gnome-radius-md)',
            }}
          >
            <Icon icon={icon} size="lg" label={name} />
            <Text
              variant="caption"
              color="dim"
              style={{
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
              }}
            >
              {name}
            </Text>
          </div>
        ))}
      </div>
    </PageContent>
  );
};
