import { expect, test } from '@playwright/test';

test('renders its mixed children in DOM order', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-toolbar--interactive');

  const toolbar = page.locator('gnome-toolbar');
  const children = toolbar.locator('> *');

  await expect(children).toHaveCount(7);
  await expect(children.nth(2)).toHaveJSProperty('tagName', 'GNOME-LINKED-GROUP');
  await expect(children.nth(3)).toHaveJSProperty('tagName', 'GNOME-SEPARATOR');
  await expect(children.nth(4)).toHaveJSProperty('tagName', 'GNOME-DROPDOWN');
});

test('applies the standard 6px padding/gap flex row', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-toolbar--interactive');

  const toolbar = page.locator('gnome-toolbar');
  await expect(toolbar).toHaveCSS('display', 'flex');
  await expect(toolbar).toHaveCSS('padding', '6px');
  await expect(toolbar).toHaveCSS('gap', '6px');
});

test('the trailing Save button stays clickable through a flex spacer', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-toolbar--interactive');

  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
});
