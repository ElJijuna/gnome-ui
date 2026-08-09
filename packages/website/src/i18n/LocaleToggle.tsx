import { ToggleGroup, ToggleGroupItem } from '@gnome-ui/react';

import { type Locale, useTranslation } from './I18nContext';

export const LocaleToggle = () => {
  const { locale, setLocale, t } = useTranslation();

  return (
    <ToggleGroup
      value={locale}
      onValueChange={(value) => setLocale(value as Locale)}
      aria-label={t('locale.toggle')}
    >
      <ToggleGroupItem name="en" label="EN" />
      <ToggleGroupItem name="es" label="ES" />
    </ToggleGroup>
  );
};
