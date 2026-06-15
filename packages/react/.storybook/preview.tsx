/* eslint-disable react-refresh/only-export-components */
import { parameters as docsParameters } from '@storybook/addon-docs/preview';
import type { Preview } from '@storybook/react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import '@gnome-ui/core/styles';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';

import { GnomeProvider } from '../src/components/GnomeProvider/GnomeProvider';

const CenteredDecorator = ({ children }: { children: ReactNode }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        minHeight: '100vh',
        backgroundColor: 'var(--gnome-window-bg-color)',
      }}
    >
      {/*
       * This inner wrapper gives children a definite width so that
       * width:100% inside story decorators (e.g. maxWidth:400) resolves
       * correctly. Without it, flex items have no definite inline size and
       * width:100% components (ProgressBar, Banner, Separator…) render at 0px.
       */}
      <div style={{ flex: '1 1 0%', minWidth: 0 }}>{children}</div>
    </div>
  );
};

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

      // high-contrast variants are outside GnomeColorScheme — set data-theme
      // manually after GnomeProvider's own effect removes it for "system"
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
    (Story) => (
      <CenteredDecorator>
        <Story />
      </CenteredDecorator>
    ),
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
