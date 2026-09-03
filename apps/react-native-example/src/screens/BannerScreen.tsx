import { Banner, type BannerVariant } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const VARIANTS: BannerVariant[] = ['info', 'warning', 'error', 'success'];

const MESSAGES: Record<BannerVariant, string> = {
  info: 'A new version is available.',
  warning: 'Your session will expire soon.',
  error: 'Failed to sync — check your connection.',
  success: 'Changes saved successfully.',
};

export const BannerScreen = () => {
  const [dismissed, setDismissed] = useState<Record<BannerVariant, boolean>>({
    info: false,
    warning: false,
    error: false,
    success: false,
  });

  return (
    <>
      <Section title="Variants" description="info, warning, error, success">
        <View style={{ gap: 8 }}>
          {VARIANTS.map((variant) =>
            dismissed[variant] ? null : (
              <Banner
                key={variant}
                variant={variant}
                dismissible
                onDismiss={() => setDismissed((prev) => ({ ...prev, [variant]: true }))}
              >
                {MESSAGES[variant]}
              </Banner>
            ),
          )}
        </View>
      </Section>

      <Section title="With action" description="A single clear action the user can take">
        <Banner variant="error" actionLabel="Retry" onAction={() => {}}>
          Sync failed
        </Banner>
      </Section>

      <Section title="Plain" description="No action, not dismissible">
        <Banner variant="info">Updates are checked automatically once a day.</Banner>
      </Section>
    </>
  );
};
