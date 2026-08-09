import { type GnomeColorScheme, ToggleGroup, ToggleGroupItem } from '@gnome-ui/react';

import { useTranslation } from '@/i18n/I18nContext';

import { useThemePreference } from './ThemeContext';

export const ThemeToggle = () => {
  const { colorScheme, setColorScheme } = useThemePreference();
  const { t } = useTranslation();

  return (
    <ToggleGroup
      value={colorScheme}
      onValueChange={(value) => setColorScheme(value as GnomeColorScheme)}
      aria-label={t('theme.toggle')}
    >
      <ToggleGroupItem name="light" label={t('theme.light')} />
      <ToggleGroupItem name="dark" label={t('theme.dark')} />
      <ToggleGroupItem name="system" label={t('theme.system')} />
    </ToggleGroup>
  );
};
