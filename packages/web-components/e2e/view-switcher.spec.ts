import { expect, test } from '@playwright/test';

test('view switcher moves focus and activates the target item with arrow keys', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-view-switcher--interactive');

  const list = page.getByRole('radio', { name: 'List' });
  const grid = page.getByRole('radio', { name: 'Grid' });
  const timeline = page.getByRole('radio', { name: 'Timeline' });

  await list.focus();
  await page.keyboard.press('ArrowRight');
  await expect(grid).toBeFocused();
  await expect(grid).toHaveAttribute('aria-checked', 'true');
  await expect(list).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByText('Active view: Grid')).toBeVisible();

  await page.keyboard.press('End');
  await expect(timeline).toBeFocused();
  await expect(timeline).toHaveAttribute('aria-checked', 'true');
});

test('view switcher wraps backward with ArrowLeft and forward-wraps with ArrowRight', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-view-switcher--interactive');

  const list = page.getByRole('radio', { name: 'List' });
  const timeline = page.getByRole('radio', { name: 'Timeline' });

  await list.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(timeline).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await expect(list).toBeFocused();
});
