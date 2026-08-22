import { expect, test } from '@playwright/test';

// Expander animates open with a CSS grid trick — `grid-template-rows: 0fr →
// 1fr` plus `overflow: hidden` on the inner wrapper. Collapsed content is
// therefore clipped rather than removed: it stays in the layout, in the
// accessibility tree, and in the tab order. jsdom computes no layout at all,
// so Expander.test.tsx cannot tell the two states apart beyond a class name.

test('the panel clips its content when closed and grows to fit when opened', async ({ page }) => {
  await page.goto('/iframe.html?id=components-expander--in-a-form');

  const header = page.getByRole('button', { name: 'Show advanced options' });
  const panel = page.getByRole('region', { name: 'Show advanced options' });

  await expect(header).toHaveAttribute('aria-expanded', 'false');
  const collapsed = (await panel.boundingBox())!.height;
  expect(collapsed).toBeLessThan(16);

  await header.click();

  await expect(header).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(async () => (await panel.boundingBox())!.height).toBeGreaterThan(50);
});

test('collapsing again clips the panel back down', async ({ page }) => {
  await page.goto('/iframe.html?id=components-expander--default-expanded');

  const header = page.getByRole('button').first();
  const panel = page.getByRole('region');

  const expanded = (await panel.boundingBox())!.height;
  expect(expanded).toBeGreaterThan(16);

  await header.click();
  await expect.poll(async () => (await panel.boundingBox())!.height).toBeLessThan(16);
});

// The panel's padding rides the same transition as the grid row rather than
// sitting on the clipped item, so a closed expander gives its space back.
test('a closed panel reserves no vertical space', async ({ page }) => {
  await page.goto('/iframe.html?id=components-expander--in-a-form');

  const panel = page.getByRole('region', { name: 'Show advanced options' });
  expect((await panel.boundingBox())!.height).toBe(0);
});

// The collapsed panel carries `inert`, which is the only thing keeping its
// controls out of the tab order — it is still painted and still in the layout.
// Sequential focus navigation exists nowhere but a real browser.
test('controls inside a collapsed panel are out of the tab order', async ({ page }) => {
  await page.goto('/iframe.html?id=components-expander--in-a-form');

  const header = page.getByRole('button', { name: 'Show advanced options' });
  await expect(header).toHaveAttribute('aria-expanded', 'false');

  await header.focus();
  await page.keyboard.press('Tab');

  await expect(page.getByLabel('Custom port')).not.toBeFocused();
});
