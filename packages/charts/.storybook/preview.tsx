import { parameters as docsParameters } from '@storybook/addon-docs/preview';
import type { Preview } from '@storybook/react';
import { useEffect } from 'react';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import '@gnome-ui/react/styles';
import '@gnome-ui/core/styles';
import { GnomeProvider } from '@gnome-ui/react';

const preview: Preview = {
  globalTypes: {
    locale: {
      description: 'Locale for number and date formatting',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: [
          { value: '', title: 'Browser default' },
          { value: 'en-US', title: 'English (US)' },
          { value: 'es-ES', title: 'Spanish (ES)' },
          { value: 'de-DE', title: 'German (DE)' },
          { value: 'fr-FR', title: 'French (FR)' },
          { value: 'ar-SA', title: 'Arabic (SA)' },
        ],
        dynamicTitle: true,
      },
    },
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: '', title: 'System (OS preference)' },
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'high-contrast', title: 'High Contrast' },
          { value: 'high-contrast-dark', title: 'High Contrast Dark' },
        ],
        dynamicTitle: true,
      },
    },
    accentColor: {
      description: 'Accent color',
      toolbar: {
        title: 'Accent',
        icon: 'circle',
        items: [
          { value: '', title: 'Default (Blue)' },
          { value: 'blue', title: 'Blue' },
          { value: 'green', title: 'Green' },
          { value: 'yellow', title: 'Yellow' },
          { value: 'orange', title: 'Orange' },
          { value: 'red', title: 'Red' },
          { value: 'purple', title: 'Purple' },
          { value: 'brown', title: 'Brown' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    locale: '',
    theme: '',
    accentColor: '',
  },
  decorators: [
    (Story, context) => {
      const { locale, theme, accentColor } = context.globals;

      useEffect(() => {
        if (theme === 'high-contrast' || theme === 'high-contrast-dark') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      }, [theme]);

      const colorScheme = theme === 'light' || theme === 'dark' ? theme : 'system';

      return (
        <GnomeProvider
          locale={locale || undefined}
          colorScheme={colorScheme}
          accentColor={accentColor || 'blue'}
        >
          <Story />
        </GnomeProvider>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'gnome-light',
      values: [
        { name: 'gnome-light', value: '#fafafa' },
        { name: 'gnome-dark', value: '#242424' },
      ],
    },
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      ...docsParameters.docs,
      toc: true,
    },
  },
};

export default preview;
