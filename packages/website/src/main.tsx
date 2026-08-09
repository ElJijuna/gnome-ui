import '@gnome-ui/core/styles';
import '@gnome-ui/react/styles';
import '@gnome-ui/layout/styles';
import '@gnome-ui/charts/styles';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { App } from '@/App';
import { I18nProvider } from '@/i18n/I18nContext';
import { ThemeProvider } from '@/theme/ThemeContext';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Missing #root element.');
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
);
