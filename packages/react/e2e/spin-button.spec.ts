import { expect, test } from '@playwright/test';

// SpinButton puts `role="spinbutton"` and `tabIndex={0}` on the wrapper while
// the − / + buttons are `tabIndex={-1}` and `aria-hidden`, so the whole control
// is a single tab stop that only responds to keys once it genuinely has focus.
// SpinButton.test.tsx fires `keyDown` at the wrapper directly and clicks the
// buttons by role, which is exactly the part real focus and real `disabled`
// hit-testing would otherwise verify.

test('the control is one tab stop and the arrow keys only work once it holds focus', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-spinbutton--in-form');

  const quantity = page.getByRole('spinbutton', { name: 'Quantity' });
  const opacity = page.getByRole('spinbutton', { name: 'Opacity (%)' });
  await expect(quantity).toHaveAttribute('aria-valuenow', '1');

  await page.keyboard.press('Tab');
  await expect(quantity).toBeFocused();

  await page.keyboard.press('ArrowUp');
  await expect(quantity).toHaveAttribute('aria-valuenow', '2');

  // The inner buttons are tabIndex=-1, so one more Tab has to reach the next
  // SpinButton rather than stepping into this one's + button.
  await page.keyboard.press('Tab');
  await expect(opacity).toBeFocused();

  // Opacity starts at its max, so it must step down rather than past 100.
  await page.keyboard.press('ArrowDown');
  await expect(opacity).toHaveAttribute('aria-valuenow', '95');
  await expect(quantity).toHaveAttribute('aria-valuenow', '2');
});

test('PageUp and End move by the step multiple and to the bound', async ({ page }) => {
  await page.goto('/iframe.html?id=components-spinbutton--in-form');

  const fontSize = page.getByRole('spinbutton', { name: 'Font size' });
  await fontSize.focus();
  await expect(fontSize).toHaveAttribute('aria-valuenow', '14');

  await page.keyboard.press('PageUp');
  await expect(fontSize).toHaveAttribute('aria-valuenow', '24');

  await page.keyboard.press('End');
  await expect(fontSize).toHaveAttribute('aria-valuenow', '72');

  // Already at max — the browser must not deliver a click to the disabled +.
  await page.keyboard.press('ArrowUp');
  await expect(fontSize).toHaveAttribute('aria-valuenow', '72');
});

test('a stepper button disabled at a bound does not respond to a real click', async ({ page }) => {
  await page.goto('/iframe.html?id=components-spinbutton--at-boundaries');

  const atMin = page.getByRole('spinbutton').first();
  await expect(atMin).toHaveAttribute('aria-valuenow', '0');

  const minus = atMin.locator('button').first();
  await expect(minus).toBeDisabled();

  // A disabled button swallows the click in the browser rather than bubbling
  // it anywhere useful.
  await minus.click({ force: true });
  await expect(atMin).toHaveAttribute('aria-valuenow', '0');

  const plus = atMin.locator('button').last();
  await expect(plus).toBeEnabled();
});
