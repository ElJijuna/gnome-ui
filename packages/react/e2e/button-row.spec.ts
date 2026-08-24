import { expect, test } from '@playwright/test';

// ButtonRow is a full-width `<button>` whose whole point is layout and paint:
// the title is centred by `flex: 1` + `text-align: center`, the variants differ
// only in a computed colour, the disabled state relies on `pointer-events: none`,
// and the focus ring is an inset `box-shadow` behind `:focus-visible`. jsdom
// has none of that, so ButtonRow.test.tsx can only check class names.

test('each variant paints its own title colour', async ({ page }) => {
  await page.goto('/iframe.html?id=components-buttonrow--variants');

  const titles = page.locator('button span[class*="title"]');
  await expect(titles.first()).toBeVisible();

  const colours = await titles.evaluateAll((els) => els.map((el) => getComputedStyle(el).color));

  expect(colours).toHaveLength(3);
  expect(new Set(colours).size).toBe(3);
});

test('the row fills the list row and centres its title inside it', async ({ page }) => {
  await page.goto('/iframe.html?id=components-buttonrow--variants');

  const row = page.getByRole('button', { name: 'Save Changes' });
  await expect(row).toBeVisible();

  const { rowWidth, itemWidth } = await row.evaluate((el) => ({
    rowWidth: el.getBoundingClientRect().width,
    itemWidth: (el.parentElement as HTMLElement).clientWidth,
  }));
  expect(Math.abs(rowWidth - itemWidth)).toBeLessThanOrEqual(1);

  const rowBox = (await row.boundingBox())!;
  const titleBox = (await row.locator('span[class*="title"]').boundingBox())!;
  const rowCentre = rowBox.x + rowBox.width / 2;
  const titleCentre = titleBox.x + titleBox.width / 2;
  expect(Math.abs(rowCentre - titleCentre)).toBeLessThanOrEqual(1);
});

test('a leading icon sits at the leading edge and takes the variant colour', async ({ page }) => {
  await page.goto('/iframe.html?id=components-buttonrow--with-icons');

  const row = page.getByRole('button', { name: /Remove Device/ });
  const leading = row.locator('span[class*="leading"]');
  const title = row.locator('span[class*="title"]');

  const leadingBox = (await leading.boundingBox())!;
  const titleBox = (await title.boundingBox())!;
  const rowBox = (await row.boundingBox())!;

  expect(leadingBox.x).toBeLessThan(titleBox.x);
  expect(leadingBox.x).toBeLessThan(rowBox.x + rowBox.width / 2);

  const [leadingColour, titleColour] = await Promise.all([
    leading.evaluate((el) => getComputedStyle(el).color),
    title.evaluate((el) => getComputedStyle(el).color),
  ]);
  expect(leadingColour).toBe(titleColour);
});

test('hovering one row tints only that row', async ({ page }) => {
  await page.goto('/iframe.html?id=components-buttonrow--mixed-in-list');

  const target = page.getByRole('button', { name: 'Reset to Defaults' });
  const neighbour = page.getByRole('button', { name: 'Export Data' });

  const background = (locator: typeof target) =>
    locator.evaluate((el) => getComputedStyle(el).backgroundColor);

  const restingTarget = await background(target);
  const restingNeighbour = await background(neighbour);

  await target.hover();

  expect(await background(target)).not.toBe(restingTarget);
  expect(await background(neighbour)).toBe(restingNeighbour);
});

test('keyboard focus draws the inset ring and Enter fires the row', async ({ page }) => {
  await page.goto('/iframe.html?id=components-buttonrow--variants');

  const row = page.getByRole('button', { name: 'Confirm' });
  const messages: string[] = [];
  page.on('dialog', (dialog) => {
    messages.push(dialog.message());
    void dialog.dismiss();
  });

  expect(await row.evaluate((el) => getComputedStyle(el).boxShadow)).toBe('none');

  await page.keyboard.press('Tab');
  await expect(row).toBeFocused();
  expect(await row.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');

  await page.keyboard.press('Enter');
  await expect.poll(() => messages).toEqual(['default']);
});

test('a disabled row is dimmed and invisible to the pointer', async ({ page }) => {
  await page.goto('/iframe.html?id=components-buttonrow--disabled');

  const row = page.getByRole('button', { name: 'Delete Account' });
  await expect(row).toBeDisabled();

  const opacity = await row.evaluate((el) => parseFloat(getComputedStyle(el).opacity));
  expect(opacity).toBeLessThan(1);

  // `pointer-events: none` means the browser never hit-tests the row: a click
  // at its centre lands on whatever is painted underneath.
  const box = (await row.boundingBox())!;
  const hit = await page.evaluate(
    (p) => {
      const el = document.elementFromPoint(p.x, p.y) as HTMLElement | null;
      return Boolean(el && el.closest('button'));
    },
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
  );
  expect(hit).toBe(false);
});
