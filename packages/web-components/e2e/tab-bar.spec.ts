import { expect, test } from '@playwright/test';

test('tab bar moves focus with arrow keys, skipping the disabled tab', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-tab-bar--interactive');

  const general = page.getByRole('tab', { name: 'General' });
  const notifications = page.getByRole('tab', { name: 'Notifications' });
  const advanced = page.getByRole('tab', { name: 'Advanced' });

  await general.focus();
  await page.keyboard.press('ArrowRight');
  await expect(notifications).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await expect(advanced).toBeFocused();

  await page.keyboard.press('End');
  await expect(advanced).toBeFocused();

  await page.keyboard.press('Home');
  await expect(general).toBeFocused();
});

test('clicking a tab updates aria-selected and the roving tabindex', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-tab-bar--interactive');

  const general = page.getByRole('tab', { name: 'General' });
  const notifications = page.getByRole('tab', { name: 'Notifications' });

  await expect(general).toHaveAttribute('aria-selected', 'true');
  await expect(general).toHaveAttribute('tabindex', '0');

  await notifications.click();

  await expect(notifications).toHaveAttribute('aria-selected', 'true');
  await expect(general).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByText('Selected: Notifications')).toBeVisible();
});

// Same bug and fix `@gnome-ui/react`'s own `Tabs.test.tsx`/`e2e/tabs.spec.ts`
// found and fixed on the sibling package: `[role="tab"]` had `min-width`/
// `max-width` but no `flex-shrink`, so it defaulted to `flex-shrink: 1` and
// actively shrank tabs instead of letting the (already-hidden-scrollbar)
// `overflow-x: auto` scroll them — confirmed here via a real overflowing
// layout jsdom cannot produce at all.
test('tabs keep their natural width in an overflowing bar instead of shrinking', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-tab-bar--scrollable');

  const home = page.getByRole('tab', { name: 'Home' });

  await expect(home).toHaveCSS('flex-shrink', '0');

  const box = await home.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThan(20);
});

test('the "end" scroll button reveals overflowing tabs and hands off to "start"', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-tab-bar--scrollable');

  const tabBar = page.getByRole('tablist');
  const end = page.locator('[data-slot="tab-bar-scroll-end"]');
  const start = page.locator('[data-slot="tab-bar-scroll-start"]');

  await expect(start).toBeHidden();
  await expect(end).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Pictures' })).not.toBeInViewport();

  // Click through to the far end — one page-scroll (80% of the bar's width)
  // isn't guaranteed to reach the last tab in a single press, and each press
  // scrolls smoothly, so give the animation time to settle before checking
  // whether another press is still needed.
  for (let guard = 0; guard < 10 && (await end.isVisible()); guard++) {
    await end.click();
    await page.waitForTimeout(400);
  }

  await expect(end).toBeHidden();
  await expect(start).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Pictures' })).toBeInViewport();

  const scrollLeftAtEnd = await tabBar.evaluate((el) => el.scrollLeft);
  expect(scrollLeftAtEnd).toBeGreaterThan(0);

  for (let guard = 0; guard < 10 && (await start.isVisible()); guard++) {
    await start.click();
    await page.waitForTimeout(400);
  }

  await expect(start).toBeHidden();
  const scrollLeftAtStart = await tabBar.evaluate((el) => el.scrollLeft);
  expect(scrollLeftAtStart).toBe(0);
});
