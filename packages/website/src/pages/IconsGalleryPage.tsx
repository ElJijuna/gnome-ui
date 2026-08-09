import type { IconDefinition } from '@gnome-ui/icons';
import * as Icons from '@gnome-ui/icons';
import { PageContent, SectionHeader } from '@gnome-ui/layout';
import { CopyField, Icon, SearchBar, Text } from '@gnome-ui/react';
import { useMemo, useState } from 'react';

import { packages } from '@/generated/registry';
import { useTranslation } from '@/i18n/I18nContext';

function isIconDefinition(value: unknown): value is IconDefinition {
  return typeof value === 'object' && value !== null && 'viewBox' in value;
}

const ALL_ICONS: [string, IconDefinition][] = Object.entries(Icons).filter(
  (entry): entry is [string, IconDefinition] => isIconDefinition(entry[1]),
);

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
          style={{ maxWidth: 360, marginBottom: 16 }}
        />
      )}

      <SearchBar
        open
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => setQuery('')}
        placeholder={t('icons.searchPlaceholder')}
        aria-label={t('icons.searchPlaceholder')}
        style={{ marginBottom: 8 }}
      />
      <Text variant="caption" color="dim" style={{ display: 'block', marginBottom: 16 }}>
        {t('icons.count', { count: filtered.length })}
      </Text>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
          gap: 4,
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
              gap: 4,
              padding: 12,
              borderRadius: 8,
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
