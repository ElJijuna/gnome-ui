import { expect, test } from '@playwright/test';

// IconButton is icon-only, so its whole accessible identity is `aria-label`,
// and its optional tooltip is a hover-plus-timer affordance rendered outside
// the button. jsdom has no hover state and no layout, so IconButton.test.tsx
// cannot show that the tooltip waits out its delay, that it is placed where
// `tooltipPlacement` asked, or that it goes away again.

test('the tooltip appears only after the hover delay and disappears on leave', async ({ page }) => {
  await page.goto('/iframe.html?id=components-iconbutton--with-tooltip');

  const button = page.getByRole('button', { name: 'Search' });
  await expect(button).toBeVisible();
  await expect(page.getByRole('tooltip')).toBeHidden();

  await button.hover();

  // Tooltip's default delay is 500ms — it must not flash up immediately.
  await expect(page.getByRole('tooltip')).toBeHidden({ timeout: 200 });
  await expect(page.getByRole('tooltip')).toBeVisible({ timeout: 2000 });
  await expect(page.getByRole('tooltip')).toHaveText('Search files');

  await page.mouse.move(0, 0);
  await expect(page.getByRole('tooltip')).toBeHidden();
});

test('the tooltip flips off the requested side rather than leaving the viewport', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-iconbutton--with-tooltip');

  const button = page.getByRole('button', { name: 'Search' });
  await button.hover();

  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toBeVisible({ timeout: 2000 });

  const buttonBox = (await button.boundingBox())!;
  const tooltipBox = (await tooltip.boundingBox())!;
  const viewport = page.viewportSize()!;

  // `tooltipPlacement: 'bottom'` centres the tooltip on the trigger, and this
  // trigger sits near the left edge — so the collision pass has to give up on
  // "bottom" and pick a side that fits. That decision is made from live
  // `getBoundingClientRect()` values and cannot happen in jsdom at all.
  await expect(tooltip).not.toHaveClass(/bottom/);

  // Whatever it picks, the two invariants have to hold: fully on screen…
  expect(tooltipBox.x).toBeGreaterThanOrEqual(0);
  expect(tooltipBox.y).toBeGreaterThanOrEqual(0);
  expect(tooltipBox.x + tooltipBox.width).toBeLessThanOrEqual(viewport.width);
  expect(tooltipBox.y + tooltipBox.height).toBeLessThanOrEqual(viewport.height);

  // …and never covering the control it describes.
  const overlaps =
    tooltipBox.x < buttonBox.x + buttonBox.width &&
    tooltipBox.x + tooltipBox.width > buttonBox.x &&
    tooltipBox.y < buttonBox.y + buttonBox.height &&
    tooltipBox.y + tooltipBox.height > buttonBox.y;
  expect(overlaps).toBe(false);
});

test('the icon-only button still carries a usable accessible name and is round', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-iconbutton--default');

  const button = page.getByRole('button').first();
  await expect(button).toHaveAttribute('aria-label', /.+/);

  // `shape="circular"` is applied through CSS; a square button here means the
  // shape prop never made it to the rendered class.
  const box = (await button.boundingBox())!;
  expect(Math.abs(box.width - box.height)).toBeLessThan(2);

  const radius = await button.evaluate((el) => getComputedStyle(el).borderRadius);
  expect(radius).not.toBe('0px');
});
