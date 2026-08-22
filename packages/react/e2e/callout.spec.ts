import { expect, test } from '@playwright/test';

// Callout is a `role="note"` block whose variant is expressed purely through
// CSS (background, border, icon colour) and whose dismiss button removes it
// from the flow. jsdom paints nothing and lays nothing out, so Callout.test.tsx
// can only confirm that a class name and a button exist.

test('the variants are visually distinct, not just differently classed', async ({ page }) => {
  await page.goto('/iframe.html?id=components-callout--variants');

  const callouts = page.getByRole('note');
  await expect(callouts.first()).toBeVisible();

  const paint = await callouts.evaluateAll((els) =>
    els.map((el) => {
      const style = getComputedStyle(el);
      return `${style.backgroundColor}|${style.borderColor}`;
    }),
  );

  expect(paint.length).toBeGreaterThan(1);
  expect(new Set(paint).size).toBe(paint.length);
});

test('dismissing removes the callout and reclaims its space', async ({ page }) => {
  await page.goto('/iframe.html?id=components-callout--dismissible');

  const callout = page.getByRole('note');
  await expect(callout).toBeVisible();
  expect((await callout.boundingBox())!.height).toBeGreaterThan(0);

  await callout.getByRole('button', { name: 'Dismiss' }).click();

  await expect(callout).toBeHidden();
  await expect(page.getByText('Dismissed — refresh the story to show it again.')).toBeVisible();
});

test('the dismiss button is reachable by keyboard and activates with Enter', async ({ page }) => {
  await page.goto('/iframe.html?id=components-callout--dismissible');

  const callout = page.getByRole('note');
  const dismiss = callout.getByRole('button', { name: 'Dismiss' });
  await expect(dismiss).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(dismiss).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(callout).toBeHidden();
});

test('the icon is decorative and never becomes part of the readable text', async ({ page }) => {
  await page.goto('/iframe.html?id=components-callout--basic');

  const callout = page.getByRole('note');
  await expect(callout).toBeVisible();

  // The variant icon must not be announced alongside the message.
  const svgs = callout.locator('svg');
  const count = await svgs.count();
  for (let i = 0; i < count; i += 1) {
    await expect(svgs.nth(i)).toHaveAttribute('aria-hidden', 'true');
  }
});
