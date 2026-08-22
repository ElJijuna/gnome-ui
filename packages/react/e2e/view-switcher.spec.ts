import { expect, test } from '@playwright/test';

// ViewSwitcher carries the same roving-tabindex radiogroup contract as
// ToggleGroup, but its selection is driven by the parent through `active` +
// `onClick` rather than by group context. That makes the keyboard handler's
// `items[next].click()` the only thing connecting an arrow key to a state
// change — a synthesised `keyDown` in jsdom proves the handler ran, not that
// the click it dispatches actually reaches the item's own React onClick.

test('an arrow key dispatches a real click that updates the active view', async ({ page }) => {
  await page.goto('/iframe.html?id=components-viewswitcher--with-disabled-item');

  const overview = page.getByRole('radio', { name: 'Overview' });
  const analytics = page.getByRole('radio', { name: 'Analytics' });

  await expect(overview).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('Tab');
  await expect(overview).toBeFocused();

  await overview.press('ArrowRight');
  await expect(analytics).toBeFocused();
  await expect(analytics).toHaveAttribute('aria-checked', 'true');
  await expect(overview).toHaveAttribute('aria-checked', 'false');
});

test('a disabled item is skipped and never becomes the tab stop', async ({ page }) => {
  await page.goto('/iframe.html?id=components-viewswitcher--with-disabled-item');

  const overview = page.getByRole('radio', { name: 'Overview' });
  const analytics = page.getByRole('radio', { name: 'Analytics' });
  const reports = page.getByRole('radio', { name: 'Reports' });

  await expect(reports).toBeDisabled();

  await overview.press('ArrowRight'); // -> Analytics
  await analytics.press('ArrowRight'); // Reports is filtered out, so this wraps

  await expect(reports).not.toBeFocused();
  await expect(overview).toBeFocused();
  await expect(overview).toHaveAttribute('aria-checked', 'true');
});
