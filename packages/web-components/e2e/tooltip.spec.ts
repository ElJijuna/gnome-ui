import { expect, test } from '@playwright/test';

test('tooltip shows on hover after the delay and wires aria-describedby', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-tooltip--no-delay');

  const trigger = page.getByRole('button', { name: 'Hover me (delay=0)' });
  const content = page.locator('gnome-tooltip').first().locator('[data-slot="tooltip-content"]');

  await expect(content).toHaveCSS('opacity', '0');

  await trigger.hover();

  await expect(content).toHaveCSS('opacity', '1');
  await expect(content).toHaveAttribute('role', 'tooltip');

  const describedBy = await trigger.getAttribute('aria-describedby');
  const contentId = await content.getAttribute('id');
  expect(describedBy).toBe(contentId);
});

test('tooltip hides when the pointer leaves the trigger', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-tooltip--no-delay');

  const trigger = page.getByRole('button', { name: 'Hover me (delay=0)' });
  const content = page.locator('gnome-tooltip').first().locator('[data-slot="tooltip-content"]');

  await trigger.hover();
  await expect(content).toHaveCSS('opacity', '1');

  await page.mouse.move(0, 0);
  await expect(content).toHaveCSS('opacity', '0');
});

test('tooltip shows on keyboard focus and hides on blur', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-tooltip--keyboard-focus');

  const firstTooltip = page.locator('gnome-tooltip').first();
  const trigger = firstTooltip.locator('[data-slot="tooltip-trigger"]');
  const content = firstTooltip.locator('[data-slot="tooltip-content"]');

  await trigger.focus();
  await expect(content).toHaveCSS('opacity', '1');

  await trigger.blur();
  await expect(content).toHaveCSS('opacity', '0');
});

test('Escape dismisses a visible tooltip', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-tooltip--no-delay');

  const trigger = page.getByRole('button', { name: 'Hover me (delay=0)' });
  const content = page.locator('gnome-tooltip').first().locator('[data-slot="tooltip-content"]');

  await trigger.hover();
  await expect(content).toHaveCSS('opacity', '1');

  await page.keyboard.press('Escape');
  await expect(content).toHaveCSS('opacity', '0');
});
