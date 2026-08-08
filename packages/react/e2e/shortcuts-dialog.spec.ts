import { expect, test } from '@playwright/test';

// ShortcutsDialog focuses its search field with a real `requestAnimationFrame`
// callback after opening. ShortcutsDialog.test.tsx never asserts on focus at
// all — there is zero coverage, faked or otherwise, of this behavior. A real
// paint-aligned rAF tick is exactly the kind of timing jsdom's polyfill can't
// be trusted to reproduce.

test('focuses the search field on a real animation frame after opening', async ({ page }) => {
  await page.goto('/iframe.html?id=components-shortcutsdialog--default');

  await page.getByRole('button', { name: 'Show Shortcuts' }).click();
  const search = page.getByRole('searchbox', { name: 'Search shortcuts' });

  await expect(search).toBeFocused();
});

test('typing immediately after opening filters the list, with no extra click needed', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-shortcutsdialog--default');

  await page.getByRole('button', { name: 'Show Shortcuts' }).click();
  // No click on the search field — relies entirely on the real rAF autofocus.
  await page.keyboard.type('Save as');

  await expect(page.getByText('Save as…')).toBeVisible();
  await expect(page.getByText('New document')).toBeHidden();
});
