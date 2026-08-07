import { expect, test } from '@playwright/test';

// Tooltip has no unit test file at all — its hover-delay timer and its
// `getBoundingClientRect()`-based positioning (same category of gap as
// Popover) have never been exercised by any test until now.

test('shows the tooltip on real hover after the delay and hides on Escape', async ({ page }) => {
  await page.goto('/iframe.html?id=components-tooltip--default');

  await page.getByRole('button', { name: 'Save' }).hover();

  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText('Save file (Ctrl+S)');

  await page.keyboard.press('Escape');
  await expect(tooltip).toBeHidden();
});

test('positions the tooltip above the trigger using real layout', async ({ page }) => {
  await page.goto('/iframe.html?id=components-tooltip--default');

  const trigger = page.getByRole('button', { name: 'Save' });
  await trigger.hover();

  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toBeVisible();

  const triggerBox = await trigger.boundingBox();
  const tooltipBox = await tooltip.boundingBox();
  expect(triggerBox).not.toBeNull();
  expect(tooltipBox).not.toBeNull();

  expect(tooltipBox!.y + tooltipBox!.height).toBeLessThanOrEqual(triggerBox!.y);
});
