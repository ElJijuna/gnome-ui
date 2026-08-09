import { PageContent } from '@gnome-ui/layout';
import { Card, CodeBlock, CopyField, Link, StatusPage, Text } from '@gnome-ui/react';
import { useParams } from 'react-router';

import { InlineMarkdown } from '@/components/InlineMarkdown';
import { components, packages } from '@/generated/registry';
import { useTranslation } from '@/i18n/I18nContext';
import { LiveExample } from '@/live/LiveExample';

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
      <Text variant="title-1" as="h1" style={{ display: 'block', marginBottom: 16 }}>
        {entry.name}
      </Text>

      <InlineMarkdown text={entry.description} />

      <div style={{ marginTop: 24 }}>
        <Text variant="title-4" as="h2" style={{ display: 'block', marginBottom: 8 }}>
          {t('component.example')}
        </Text>

        {entry.example ? (
          <>
            <Card style={{ padding: 24, marginBottom: 16 }}>
              <LiveExample code={entry.example} />
            </Card>
            <CodeBlock code={entry.example} language="tsx" />
          </>
        ) : (
          <Text variant="body" color="dim">
            {t('component.noExample')}
          </Text>
        )}
      </div>

      {entry.props && entry.props.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <Text variant="title-4" as="h2" style={{ display: 'block', marginBottom: 8 }}>
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
                      padding: 8,
                      borderBottom: '1px solid var(--gnome-light-3, #deddda)',
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
                        padding: 8,
                        borderBottom: '1px solid var(--gnome-light-3, #deddda)',
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

      <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {installCommand && (
          <CopyField
            value={installCommand}
            label={t('component.install')}
            copyLabel={t('component.copy')}
            copiedLabel={t('component.copied')}
          />
        )}

        <Link href={entry.storybookUrl} external>
          {t('component.viewStorybook')}
        </Link>
      </div>
    </PageContent>
  );
};
