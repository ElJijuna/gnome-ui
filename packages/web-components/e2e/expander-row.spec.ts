import { expect, test } from '@playwright/test';

test('expander row reveals nested rows on click and reports the new state', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-expander-row--interactive');

  const header = page.getByRole('button', { name: /Advanced settings/ });
  const panel = page.locator('[data-slot="row-panel"]');

  await expect(header).toHaveAttribute('aria-expanded', 'false');
  // Collapsed via a CSS grid `0fr`/`1fr` height animation, not `hidden` — the
  // panel's own row track is what collapses to zero, not its clipped
  // descendants (whose getBoundingClientRect ignores ancestor clipping).
  await expect(panel).toHaveCSS('grid-template-rows', '0px');

  await header.click();

  await expect(header).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).not.toHaveCSS('grid-template-rows', '0px');
  await expect(page.getByText('Enable telemetry')).toBeVisible();
  await expect(page.getByText('Expanded: true')).toBeVisible();

  await header.click();
  await expect(header).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toHaveCSS('grid-template-rows', '0px');
});

test('expander row activates with the keyboard (native button semantics)', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-expander-row--interactive');

  const header = page.getByRole('button', { name: /Advanced settings/ });
  await header.focus();
  await page.keyboard.press('Enter');

  await expect(header).toHaveAttribute('aria-expanded', 'true');
});

test('starts expanded when the expanded arg is set', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-expander-row--expanded');

  const header = page.getByRole('button', { name: /Advanced settings/ });
  await expect(header).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('Developer tools')).toBeVisible();
});
