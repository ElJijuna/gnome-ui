import { expect, test } from '@playwright/test';

test('default row renders title/subtitle with no button surface', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-action-row--default');

  const row = page.locator('gnome-action-row');
  await expect(row.getByText('Wi-Fi')).toBeVisible();
  await expect(row.getByText('Home Network')).toBeVisible();
  await expect(row.locator('[data-slot="row-surface"]')).toHaveCount(0);
});

test('interactive row composes a real button and supports keyboard activation', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-action-row--interactive');

  const surface = page.locator('gnome-action-row', { hasText: 'About' }).locator(
    '[data-slot="row-surface"]',
  );
  await expect(surface).toHaveJSProperty('tagName', 'BUTTON');

  let dialogMessage = '';
  page.once('dialog', (dialog) => {
    dialogMessage = dialog.message();
    void dialog.dismiss();
  });

  await surface.focus();
  await page.keyboard.press('Enter');

  await expect.poll(() => dialogMessage).toBe('About');
});

test('clicking a row-suffix control does not activate the row', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-action-row--interactive-with-suffix');

  let dialogFired = false;
  page.on('dialog', (dialog) => {
    dialogFired = true;
    void dialog.dismiss();
  });

  const suffixInput = page.locator('gnome-action-row [data-slot="row-suffix"] input');
  await suffixInput.click();

  // Give any (incorrect) dialog a moment to fire before asserting it never did.
  await page.waitForTimeout(200);
  expect(dialogFired).toBe(false);
});
