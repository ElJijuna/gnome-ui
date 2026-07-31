import { expect, test } from '@playwright/test';

test('default list exposes role=list with role=listitem children and a shared border', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-boxed-list--default');

  const list = page.locator('gnome-boxed-list');
  await expect(list).toHaveAttribute('role', 'list');

  const items = list.locator('> *');
  await expect(items).toHaveCount(3);

  for (let i = 0; i < 3; i += 1) {
    await expect(items.nth(i)).toHaveAttribute('role', 'listitem');
  }
});

test('separate variant gives each row its own rounded card', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-boxed-list--separate');

  const list = page.locator('gnome-boxed-list');
  await expect(list).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

  const firstRow = list.locator('> *').first();
  const borderRadius = await firstRow.evaluate((el) => getComputedStyle(el).borderRadius);
  expect(borderRadius).not.toBe('0px');
});

test('a row appended after connection (htmx-style) gets role=listitem too', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-boxed-list--simple-rows');

  const list = page.locator('gnome-boxed-list');

  await list.evaluate((el) => {
    const row = document.createElement('div');
    row.textContent = 'Appended row';
    el.append(row);
  });

  await expect(list.getByText('Appended row')).toHaveAttribute('role', 'listitem');
});
