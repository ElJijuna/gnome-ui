import { expect, test } from '@playwright/test';

// Card swaps its host element between `<div>` and `<button>`, paints its
// activatable states with `color-mix()`, and gates the focus ring on
// `:focus-visible`. jsdom resolves no colour functions, honours no
// `:focus-visible`, and lays out no padding, so Card.test.tsx can only assert
// that the right class names arrive.

test('an interactive card is a real button: keyboard-reachable and activated by Enter and Space', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-card--interactive');

  const card = page.getByRole('button', { name: /Clickable card/ });
  await expect(card).toBeVisible();

  const activations: string[] = [];
  page.on('dialog', (dialog) => {
    activations.push(dialog.message());
    void dialog.dismiss();
  });

  await page.keyboard.press('Tab');
  await expect(card).toBeFocused();

  await page.keyboard.press('Enter');
  await expect.poll(() => activations.length).toBe(1);

  await page.keyboard.press('Space');
  await expect.poll(() => activations.length).toBe(2);
  expect(new Set(activations)).toEqual(new Set(['Card clicked']));
});

test('the focus ring is drawn for keyboard focus and withheld from a mouse click', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-card--interactive');

  const card = page.getByRole('button', { name: /Clickable card/ });
  page.on('dialog', (dialog) => void dialog.dismiss());

  const ringOf = () => card.evaluate((el) => getComputedStyle(el).boxShadow);

  expect(await ringOf()).toBe('none');

  // A pointer press focuses the button but must not match :focus-visible.
  await card.click();
  await expect(card).toBeFocused();
  expect(await ringOf()).toBe('none');

  await card.blur();
  await page.keyboard.press('Tab');
  await expect(card).toBeFocused();
  expect(await ringOf()).not.toBe('none');
});

test('hover and press repaint the card surface', async ({ page }) => {
  await page.goto('/iframe.html?id=components-card--interactive');

  const card = page.getByRole('button', { name: /Clickable card/ });
  page.on('dialog', (dialog) => void dialog.dismiss());

  const backgroundOf = () => card.evaluate((el) => getComputedStyle(el).backgroundColor);

  const resting = await backgroundOf();

  await card.hover();
  const hovered = await backgroundOf();
  expect(hovered).not.toBe(resting);

  const box = (await card.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const pressed = await backgroundOf();
  await page.mouse.up();

  expect(pressed).not.toBe(hovered);
  expect(pressed).not.toBe(resting);
});

test('the padding scale produces measurably different content insets', async ({ page }) => {
  await page.goto('/iframe.html?id=components-card--padding-sizes');

  const cards = page.locator('div[class*="card"]');
  await expect(cards.first()).toBeVisible();

  const paddings = await cards.evaluateAll((els) =>
    els.map((el) => parseFloat(getComputedStyle(el).paddingTop)),
  );

  expect(paddings).toHaveLength(4);
  expect(paddings[0]).toBe(0);
  for (let i = 1; i < paddings.length; i += 1) {
    expect(paddings[i]).toBeGreaterThan(paddings[i - 1]);
  }
});

test('a static card is a plain div that stays out of the tab order', async ({ page }) => {
  await page.goto('/iframe.html?id=components-card--default');

  const card = page.locator('div[class*="card"]').first();
  await expect(card).toBeVisible();
  expect(await card.evaluate((el) => el.tagName)).toBe('DIV');

  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.tagName ?? null);
  expect(focused).not.toBe('DIV');
});
