import { Text } from '@gnome-ui/react';

import { useTranslation } from '@/i18n/I18nContext';
import { availabilityFor, FRAMEWORKS } from '@/lib/frameworks';
import type { FrameworkId } from '@/types/registry';

import styles from './FrameworkAvailability.module.css';

const FRAMEWORK_LABEL_KEY: Record<FrameworkId, string> = {
  react: 'frameworks.react',
  'web-components': 'frameworks.webComponents',
  'react-native': 'frameworks.reactNative',
  angular: 'frameworks.angular',
};

export interface FrameworkAvailabilityProps {
  /** Canonical component name, e.g. `"Button"` — matched across packages by exact name. */
  name: string;
}

/** Shows which of react / web-components / react-native / angular ship a component of this name. */
export const FrameworkAvailability = ({ name }: FrameworkAvailabilityProps) => {
  const { t } = useTranslation();
  const available = availabilityFor(name);

  return (
    <div className={styles.row}>
      <Text variant="caption" color="dim">
        {t('component.availableIn')}
      </Text>
      {FRAMEWORKS.map((framework) => {
        const isAvailable = available.has(framework);

        return (
          <span
            key={framework}
            className={[styles.chip, isAvailable ? null : styles.unavailable]
              .filter(Boolean)
              .join(' ')}
          >
            <span
              className={[styles.dot, isAvailable ? null : styles.dotUnavailable]
                .filter(Boolean)
                .join(' ')}
              aria-hidden
            />
            {t(FRAMEWORK_LABEL_KEY[framework])}
            {framework === 'angular' && ` · ${t('component.comingSoon')}`}
          </span>
        );
      })}
    </div>
  );
};
