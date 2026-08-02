import { expect, test } from '@playwright/test';

test('step indicator marks completed/current steps and reports clicks on completed circles', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-step-indicator--interactive');

  const stepIndicator = page.locator('gnome-step-indicator');
  const items = stepIndicator.locator('[data-slot="step-item"]');

  await expect(items.nth(0)).toHaveAttribute('data-completed', '');
  await expect(items.nth(1)).toHaveAttribute('data-current', '');
  await expect(page.getByText('Current step: 2')).toBeVisible();

  const firstCircle = items.nth(0).locator('[data-slot="step-circle"]');
  await expect(firstCircle).toHaveJSProperty('tagName', 'BUTTON');
  await firstCircle.click();

  await expect(page.getByText('Current step: 1')).toBeVisible();
  await expect(items.nth(0)).toHaveAttribute('data-current', '');
});

test('current and upcoming step circles are not buttons, even when clickable', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-step-indicator--interactive');

  const items = page.locator('gnome-step-indicator [data-slot="step-item"]');
  const currentCircle = items.nth(1).locator('[data-slot="step-circle"]');
  const upcomingCircle = items.nth(2).locator('[data-slot="step-circle"]');

  await expect(currentCircle).toHaveJSProperty('tagName', 'SPAN');
  await expect(upcomingCircle).toHaveJSProperty('tagName', 'SPAN');
});

test('unlabelled variant shows a caption instead of per-step labels', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-step-indicator--unlabelled');

  await expect(page.getByText('Step 3 of 5')).toBeVisible();
  await expect(page.locator('[data-slot="step-label"]')).toHaveCount(0);
});
