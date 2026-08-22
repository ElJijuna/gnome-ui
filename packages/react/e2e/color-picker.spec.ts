import { expect, test } from '@playwright/test';

// ColorPicker is a roving-tabindex radiogroup of swatches, each of which paints
// itself from a `--swatch-color` custom property set inline. jsdom resolves no
// custom properties and computes no background, so ColorPicker.test.tsx can
// only confirm that the style attribute exists — and it drives the arrow keys
// through synthesised events that never depend on real focus.

test('every swatch actually paints the colour it stands for', async ({ page }) => {
  await page.goto('/iframe.html?id=components-colorpicker--default');

  const swatches = page.getByRole('radio');
  await expect(swatches.first()).toBeVisible();

  const painted = await swatches.evaluateAll((els) =>
    els.map((el) => ({
      declared: el.style.getPropertyValue('--swatch-color'),
      resolved: getComputedStyle(el).backgroundColor,
    })),
  );

  // Each declared colour has to resolve to a distinct painted background.
  const resolved = painted.map((p) => p.resolved);
  expect(new Set(resolved).size).toBe(resolved.length);
  for (const { declared, resolved: colour } of painted) {
    expect(declared).not.toBe('');
    expect(colour).not.toBe('rgba(0, 0, 0, 0)');
  }
});

test('the palette is a single tab stop that follows the selection', async ({ page }) => {
  await page.goto('/iframe.html?id=components-colorpicker--default');

  // Swatches are named after the palette colour ("Blue"), not the hex value.
  const selected = page.getByRole('radio').and(page.locator('[aria-checked="true"]'));
  await expect(selected).toHaveCount(1);

  await page.keyboard.press('Tab');
  await expect(selected).toBeFocused();

  await page.keyboard.press('ArrowRight');
  const next = page.getByRole('radio').nth(1);
  await expect(next).toBeFocused();
});

test('choosing a swatch updates the selection and moves the checkmark', async ({ page }) => {
  await page.goto('/iframe.html?id=components-colorpicker--default');

  const swatches = page.getByRole('radio');
  const first = swatches.nth(0);
  const third = swatches.nth(2);

  await expect(first.locator('svg')).toBeVisible();
  await expect(third.locator('svg')).toHaveCount(0);

  await third.click();

  await expect(third).toHaveAttribute('aria-checked', 'true');
  await expect(third.locator('svg')).toBeVisible();
  await expect(first.locator('svg')).toHaveCount(0);
  // The story echoes the hex value, which lives on the swatch as a custom
  // property rather than in its accessible name.
  const hex = await third.evaluate((el) => el.style.getPropertyValue('--swatch-color'));
  await expect(page.getByText(/^Selected: /)).toContainText(hex);
});
