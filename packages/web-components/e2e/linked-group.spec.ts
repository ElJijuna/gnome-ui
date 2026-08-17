import { expect, test } from '@playwright/test';

test('merges gnome-button borders: only the first and last control keep outer radius', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-linked-group--interactive');

  const controls = page.locator('gnome-linked-group [data-slot="button-control"]');
  await expect(controls).toHaveCount(3);

  const [first, middle, last] = await Promise.all([
    controls.nth(0).evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
    controls.nth(1).evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
    controls.nth(2).evaluate((el) => getComputedStyle(el).borderTopRightRadius),
  ]);

  expect(first).not.toBe('0px');
  expect(middle).toBe('0px');
  expect(last).not.toBe('0px');
});

test('vertical attribute stacks children in a column', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-linked-group--vertical');

  const group = page.locator('gnome-linked-group');
  await expect(group).toHaveAttribute('vertical', '');
  await expect(group).toHaveCSS('flex-direction', 'column');
});

test('keeps consumer-authored children accessible as native buttons', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-linked-group--interactive');

  await expect(page.getByRole('button', { name: 'Cut' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Paste' })).toBeVisible();
});
