import { expect, test } from '@playwright/test';

// PathBar renders ancestors as buttons and the last segment as a plain
// `aria-current="page"` span, with decorative chevrons between them. What only
// a browser can show is that the trail is laid out left to right in one row,
// that the current segment is genuinely not clickable or focusable, and that
// navigating truncates the trail.

test('only the ancestors are buttons and the current folder is inert', async ({ page }) => {
  await page.goto('/iframe.html?id=components-pathbar--default');

  const nav = page.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(nav.getByRole('button')).toHaveCount(3);

  const current = nav.locator('[aria-current="page"]');
  await expect(current).toHaveText('gnome-ui');

  // The current segment is a <span>: no focus, no activation.
  await page.keyboard.press('Tab');
  await expect(nav.getByRole('button').nth(0)).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(nav.getByRole('button').nth(2)).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(current).not.toBeFocused();
});

test('the trail is laid out as a single horizontal row in order', async ({ page }) => {
  await page.goto('/iframe.html?id=components-pathbar--default');

  const items = page.getByRole('navigation', { name: 'Breadcrumb' }).locator('li');
  await expect(items).toHaveCount(4);

  const boxes = await items.evaluateAll((els) =>
    els.map((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y };
    }),
  );

  for (let i = 1; i < boxes.length; i += 1) {
    expect(boxes[i].x).toBeGreaterThan(boxes[i - 1].x);
    expect(boxes[i].y).toBe(boxes[0].y);
  }
});

test('clicking an ancestor truncates the trail to that folder', async ({ page }) => {
  await page.goto('/iframe.html?id=components-pathbar--interactive');

  const nav = page.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(nav.locator('li')).toHaveCount(4);

  await nav.getByRole('button', { name: 'Documents' }).click();

  await expect(nav.locator('li')).toHaveCount(2);
  await expect(nav.locator('[aria-current="page"]')).toHaveText('Documents');
  await expect(nav.getByRole('button')).toHaveCount(1);
});

test('the separators are decorative and never read as path segments', async ({ page }) => {
  await page.goto('/iframe.html?id=components-pathbar--default');

  const nav = page.getByRole('navigation', { name: 'Breadcrumb' });
  const svgs = nav.locator('svg');

  // Three chevrons for four segments — one fewer than the segment count.
  await expect(svgs).toHaveCount(3);
  const hidden = await nav.locator('span[aria-hidden="true"]').evaluateAll((els) => els.length);
  expect(hidden).toBeGreaterThanOrEqual(3);
});
