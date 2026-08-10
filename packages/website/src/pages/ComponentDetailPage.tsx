import { PageContent } from '@gnome-ui/layout';
import { Card, CodeBlock, CopyField, Link, StatusPage, Text } from '@gnome-ui/react';
import { useParams } from 'react-router';

import { FrameworkAvailability } from '@/components/FrameworkAvailability';
import { InlineMarkdown } from '@/components/InlineMarkdown';
import { components, packages } from '@/generated/registry';
import { useTranslation } from '@/i18n/I18nContext';
import { LiveExample } from '@/live/LiveExample';
import { StorybookEmbed } from '@/live/StorybookEmbed';

export const ComponentDetailPage = () => {
  const { t } = useTranslation();
  const { pkg, slug } = useParams<{ pkg: string; slug: string }>();
  const entry = components.find(
    (candidate) => candidate.package === pkg && candidate.slug === slug,
  );

  if (!entry) {
    return (
      <PageContent maxWidth="lg">
        <StatusPage title="404" description="This component doesn't exist." />
      </PageContent>
    );
  }

  const packageEntry = packages.find((candidate) => candidate.id === entry.package);
  const installCommand = packageEntry?.installCommand;

  return (
    <PageContent maxWidth="lg">
      <Text variant="caption" color="dim">
        {packageEntry?.packageName}
      </Text>
      <Text
        variant="title-1"
        as="h1"
        style={{ display: 'block', marginBottom: 'var(--gnome-space-2)' }}
      >
        {entry.name}
      </Text>

      <FrameworkAvailability name={entry.name} />

      <div style={{ marginTop: 'var(--gnome-space-3)' }}>
        <InlineMarkdown text={entry.description} />
      </div>

      <div style={{ marginTop: 'var(--gnome-space-4)' }}>
        <Text
          variant="title-4"
          as="h2"
          style={{ display: 'block', marginBottom: 'var(--gnome-space-2)' }}
        >
          {t('component.example')}
        </Text>

        {entry.example ? (
          <>
            <Card padding="lg" style={{ marginBottom: 'var(--gnome-space-3)' }}>
              <LiveExample code={entry.example} />
            </Card>
            <CodeBlock code={entry.example} language="tsx" />
          </>
        ) : entry.storybookEmbedUrl ? (
          <Card padding="none" style={{ overflow: 'hidden' }}>
            <StorybookEmbed url={entry.storybookEmbedUrl} title={entry.name} />
          </Card>
        ) : (
          <Text variant="body" color="dim">
            {entry.storybookUrl ? t('component.noExample') : t('component.noPreview')}
          </Text>
        )}
      </div>

      {entry.props && entry.props.length > 0 && (
        <div style={{ marginTop: 'var(--gnome-space-5)' }}>
          <Text
            variant="title-4"
            as="h2"
            style={{ display: 'block', marginBottom: 'var(--gnome-space-2)' }}
          >
            {t('component.props')}
          </Text>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {Object.keys(entry.props[0]).map((column) => (
                  <th
                    key={column}
                    style={{
                      textAlign: 'left',
                      padding: 'var(--gnome-space-2)',
                      borderBottom: '1px solid var(--gnome-card-shade-color)',
                    }}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entry.props.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((cell, j) => (
                    <td
                      key={j}
                      style={{
                        padding: 'var(--gnome-space-2)',
                        borderBottom: '1px solid var(--gnome-card-shade-color)',
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div
        style={{
          marginTop: 'var(--gnome-space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--gnome-space-2)',
        }}
      >
        {installCommand && (
          <CopyField
            value={installCommand}
            label={t('component.install')}
            copyLabel={t('component.copy')}
            copiedLabel={t('component.copied')}
          />
        )}

        {entry.storybookUrl && (
          <Link href={entry.storybookUrl} external>
            {t('component.viewStorybook')}
          </Link>
        )}
      </div>
    </PageContent>
  );
};
