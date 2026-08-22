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

// KNOWN BUG — `.panelInner` keeps its `padding-top: 8px` when the grid row is
// `0fr`, because padding is not part of the clipped content box. A closed
// expander therefore still reserves ~12px of vertical space, which shows up as
// an unexplained gap between stacked expanders. Only real layout reveals it.
test.fail('a closed panel reserves no vertical space', async ({ page }) => {
  await page.goto('/iframe.html?id=components-expander--in-a-form');

  const panel = page.getByRole('region', { name: 'Show advanced options' });
  expect((await panel.boundingBox())!.height).toBe(0);
});

// KNOWN BUG — the collapsed panel is clipped with `overflow: hidden`, not
// removed with `hidden`/`display: none`, so every control inside it stays in
// the tab order. A keyboard user tabbing past a closed expander silently lands
// on invisible, zero-height fields. Only sequential focus navigation in a real
// browser exposes this; the fix is `hidden` (or `inert`) on the panel while
// collapsed.
test.fail('controls inside a collapsed panel are out of the tab order', async ({ page }) => {
  await page.goto('/iframe.html?id=components-expander--in-a-form');

  const header = page.getByRole('button', { name: 'Show advanced options' });
  await expect(header).toHaveAttribute('aria-expanded', 'false');

  await header.focus();
  await page.keyboard.press('Tab');

  await expect(page.getByLabel('Custom port')).not.toBeFocused();
});
