import { DashboardGrid, PageContent, SectionHeader } from '@gnome-ui/layout';
import { Card, CopyField, Link, Text } from '@gnome-ui/react';

import { InlineMarkdown } from '@/components/InlineMarkdown';
import { packages } from '@/generated/registry';
import { useTranslation } from '@/i18n/I18nContext';

export const PackagesOverviewPage = () => {
  const { t } = useTranslation();

  return (
    <PageContent maxWidth="xl">
      <SectionHeader title={t('packages.title')} subtitle={t('packages.subtitle')} />

      <DashboardGrid columns="auto" gap="lg">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <div>
              <Text variant="title-4">{pkg.packageName}</Text>
              <Text variant="caption" color="dim">
                v{pkg.version}
                {typeof pkg.componentCount === 'number'
                  ? ` · ${t('packages.componentCount', { count: pkg.componentCount })}`
                  : ''}
              </Text>
            </div>

            <InlineMarkdown text={pkg.description} />

            {pkg.installCommand && (
              <CopyField
                value={pkg.installCommand}
                label={t('component.install')}
                aria-label={`${t('component.install')}: ${pkg.packageName}`}
                copyLabel={t('component.copy')}
                copiedLabel={t('component.copied')}
              />
            )}

            {pkg.storybookUrl && (
              <Link href={pkg.storybookUrl} external>
                {t('packages.viewStorybook')}
              </Link>
            )}
          </Card>
        ))}
      </DashboardGrid>
    </PageContent>
  );
};
