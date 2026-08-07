import { expect, test } from '@playwright/test';

// InlineViewSwitcher's `overflow="menu"` mode measures real
// `scrollWidth`/`clientWidth` (always 0 in jsdom) via a real `ResizeObserver`
// to decide when to collapse into a single menu-trigger button.
// InlineViewSwitcher.test.tsx mocks the observer and manually triggers it —
// this resizes a real viewport and lets real layout drive the collapse.

test('collapses to a menu trigger when a real resize causes real overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 600 });
  await page.goto(
    '/iframe.html?id=components-inlineviewswitcher--overflow-playground&args=overflow:menu',
  );

  await expect(page.getByRole('radiogroup', { name: 'Library view' })).toBeVisible();

  await page.setViewportSize({ width: 300, height: 600 });

  await expect(page.getByRole('button', { name: 'Library view: List' })).toBeVisible();
});
