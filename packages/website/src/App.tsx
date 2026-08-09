import { Route, Routes } from 'react-router';

import { ComponentDetailPage } from '@/pages/ComponentDetailPage';
import { ComponentIndexPage } from '@/pages/ComponentIndexPage';
import { HomePage } from '@/pages/HomePage';
import { HookDetailPage } from '@/pages/HookDetailPage';
import { HooksIndexPage } from '@/pages/HooksIndexPage';
import { IconsGalleryPage } from '@/pages/IconsGalleryPage';
import { PackagesOverviewPage } from '@/pages/PackagesOverviewPage';
import { AppShell } from '@/shell/AppShell';

export const App = () => (
  <AppShell>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/components" element={<ComponentIndexPage />} />
      <Route path="/components/:pkg/:slug" element={<ComponentDetailPage />} />
      <Route path="/hooks" element={<HooksIndexPage />} />
      <Route path="/hooks/:slug" element={<HookDetailPage />} />
      <Route path="/icons" element={<IconsGalleryPage />} />
      <Route path="/packages" element={<PackagesOverviewPage />} />
    </Routes>
  </AppShell>
);
