import { PageContent, SectionHeader } from '@gnome-ui/layout';
import { ActionRow, BoxedList } from '@gnome-ui/react';
import { useNavigate } from 'react-router';

import { hooks } from '@/generated/registry';
import { useTranslation } from '@/i18n/I18nContext';

export const HooksIndexPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <PageContent maxWidth="lg">
      <SectionHeader title={t('hooks.title')} subtitle={t('hooks.subtitle')} />
      <BoxedList>
        {hooks.map((hook) => (
          <ActionRow
            key={hook.slug}
            title={hook.name}
            subtitle={hook.description}
            interactive
            onClick={() => navigate(`/hooks/${hook.slug}`)}
          />
        ))}
      </BoxedList>
    </PageContent>
  );
};
