import { PageContent, SectionHeader } from '@gnome-ui/layout';
import { ActionRow, BoxedList, Text } from '@gnome-ui/react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { SearchField } from '@/components/SearchField';
import { components } from '@/generated/registry';
import { useTranslation } from '@/i18n/I18nContext';
import type { ComponentEntry } from '@/types/registry';

const PACKAGE_LABELS: Record<string, string> = {
  react: '@gnome-ui/react',
  layout: '@gnome-ui/layout',
  charts: '@gnome-ui/charts',
  'web-components': '@gnome-ui/web-components',
  'react-native': '@gnome-ui/react-native',
};

function groupByPackage(entries: ComponentEntry[]): [string, ComponentEntry[]][] {
  const map = new Map<string, ComponentEntry[]>();

  for (const entry of entries) {
    const list = map.get(entry.package) ?? [];

    list.push(entry);
    map.set(entry.package, list);
  }

  return [...map.entries()];
}

export const ComponentIndexPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return components;
    }

    return components.filter(
      (entry) =>
        entry.name.toLowerCase().includes(q) || entry.description.toLowerCase().includes(q),
    );
  }, [query]);

  const grouped = useMemo(() => groupByPackage(filtered), [filtered]);

  return (
    <PageContent maxWidth="lg">
      <SectionHeader title={t('nav.components')} />
      <SearchField
        open
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => setQuery('')}
        placeholder={t('search.placeholder')}
        aria-label={t('search.placeholder')}
        wrapperStyle={{ marginBottom: 'var(--gnome-space-4)' }}
      />

      {filtered.length === 0 && (
        <Text variant="body" color="dim">
          {t('search.noResults', { query })}
        </Text>
      )}

      {grouped.map(([pkg, entries]) => (
        <div key={pkg} style={{ marginBottom: 'var(--gnome-space-5)' }}>
          <Text
            variant="title-4"
            as="h2"
            style={{ marginBottom: 'var(--gnome-space-2)', display: 'block' }}
          >
            {PACKAGE_LABELS[pkg] ?? pkg}
          </Text>
          <BoxedList>
            {entries.map((entry) => (
              <ActionRow
                key={entry.slug}
                title={entry.name}
                subtitle={entry.description}
                interactive
                onClick={() => navigate(`/components/${entry.package}/${entry.slug}`)}
              />
            ))}
          </BoxedList>
        </div>
      ))}
    </PageContent>
  );
};
