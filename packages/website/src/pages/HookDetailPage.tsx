import { PageContent } from '@gnome-ui/layout';
import { CodeBlock, CopyField, StatusPage, Text } from '@gnome-ui/react';
import { useParams } from 'react-router';

import { InlineMarkdown } from '@/components/InlineMarkdown';
import { hooks, packages } from '@/generated/registry';
import { useTranslation } from '@/i18n/I18nContext';

export const HookDetailPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const entry = hooks.find((candidate) => candidate.slug === slug);

  if (!entry) {
    return (
      <PageContent maxWidth="lg">
        <StatusPage title="404" description="This hook doesn't exist." />
      </PageContent>
    );
  }

  const installCommand = packages.find((candidate) => candidate.id === 'hooks')?.installCommand;

  return (
    <PageContent maxWidth="lg">
      <Text variant="caption" color="dim">
        @gnome-ui/hooks
      </Text>
      <Text
        variant="title-1"
        as="h1"
        style={{ display: 'block', marginBottom: 'var(--gnome-space-2)' }}
      >
        {entry.name}
      </Text>

      <InlineMarkdown text={entry.description} />

      {entry.example && (
        <div style={{ marginTop: 'var(--gnome-space-4)' }}>
          <Text
            variant="title-4"
            as="h2"
            style={{ display: 'block', marginBottom: 'var(--gnome-space-2)' }}
          >
            {t('component.example')}
          </Text>
          <CodeBlock code={entry.example} language="tsx" />
        </div>
      )}

      {installCommand && (
        <div style={{ marginTop: 'var(--gnome-space-5)' }}>
          <CopyField
            value={installCommand}
            label={t('hooks.install')}
            copyLabel={t('component.copy')}
            copiedLabel={t('component.copied')}
          />
        </div>
      )}
    </PageContent>
  );
};
