import { expect, test } from '@playwright/test';

// EntryRow's floating label is `position: absolute` with `pointer-events:
// none`, and the row div — not the label — is what focuses the input on click.
// jsdom implements neither CSS pointer-events nor layout, so EntryRow.test.tsx
// can only assert class names; whether the label actually moves out of the
// way, and whether a click on it really reaches the row, are browser facts.

test('the label is transparent to pointer events so clicking it reaches the field', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-entryrow--in-boxed-list');

  const email = page.getByLabel('Email Address');
  const label = page.getByText('Email Address');
  await expect(email).not.toBeFocused();

  const box = await label.boundingBox();
  expect(box).not.toBeNull();
  const point = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };

  // `pointer-events: none` means the browser never hit-tests the label at all:
  // whatever is painted underneath is what a click at those coordinates finds.
  const hit = await page.evaluate(
    (p) => (document.elementFromPoint(p.x, p.y) as HTMLElement | null)?.tagName,
    point,
  );
  expect(hit).not.toBe('LABEL');

  await page.mouse.click(point.x, point.y);
  await expect(email).toBeFocused();
});

test('the label physically floats up when the field takes focus and drops back when emptied', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-entryrow--in-boxed-list');

  const email = page.getByLabel('Email Address');
  const label = page.getByText('Email Address');

  const resting = await label.boundingBox();
  expect(resting).not.toBeNull();

  await email.focus();
  await expect.poll(async () => (await label.boundingBox())!.y).toBeLessThan(resting!.y);

  const floatedFontSize = await label.evaluate((el) => getComputedStyle(el).fontSize);
  expect(parseFloat(floatedFontSize)).toBeLessThan(16);

  // Blurring an empty field has to send the label back down; blurring a filled
  // one must not.
  await email.blur();
  await expect.poll(async () => (await label.boundingBox())!.y).toBe(resting!.y);

  await email.fill('jane@example.com');
  await email.blur();
  await expect.poll(async () => (await label.boundingBox())!.y).toBeLessThan(resting!.y);
});

test('a pre-filled row starts with its label already floated', async ({ page }) => {
  await page.goto('/iframe.html?id=components-entryrow--in-boxed-list');

  const filledLabel = page.getByText('Full Name');
  const emptyLabel = page.getByText('Website');

  const filled = await filledLabel.boundingBox();
  const empty = await emptyLabel.boundingBox();
  expect(filled).not.toBeNull();
  expect(empty).not.toBeNull();

  // Both rows are the same height, so the floated label must sit higher within
  // its own row than the resting one does within hers.
  const filledRow = await page.getByRole('textbox').first().boundingBox();
  const emptyRow = await page.getByRole('textbox').nth(2).boundingBox();
  expect(filled!.y - filledRow!.y).toBeLessThan(empty!.y - emptyRow!.y);
});
