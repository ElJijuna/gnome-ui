import { expect, test } from '@playwright/test';

test('default card renders content directly with no button surface', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-card--default');

  const card = page.locator('gnome-card');
  await expect(card.getByText('Card title')).toBeVisible();
  await expect(card.locator('[data-slot="card-surface"]')).toHaveCount(0);
});

test('interactive card composes a real button and supports keyboard activation', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-card--interactive');

  const surface = page.locator('gnome-card [data-slot="card-surface"]');
  await expect(surface).toHaveJSProperty('tagName', 'BUTTON');

  let dialogMessage = '';
  page.once('dialog', (dialog) => {
    dialogMessage = dialog.message();
    void dialog.dismiss();
  });

  await surface.focus();
  await page.keyboard.press('Enter');

  await expect.poll(() => dialogMessage).toBe('Card clicked');
});

test('grid of interactive cards each expose a focusable button surface', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-card--interactive-grid');

  const surfaces = page.locator('gnome-card [data-slot="card-surface"]');
  await expect(surfaces).toHaveCount(4);
  await expect(surfaces.first()).toHaveJSProperty('tagName', 'BUTTON');
});
