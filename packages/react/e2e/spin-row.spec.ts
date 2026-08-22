import { expect, test } from '@playwright/test';

// SpinRow puts the spinbutton role and the only tab stop on an inner div while
// the − / + buttons are `tabIndex={-1}` and `aria-hidden`. SpinRow.test.tsx
// fires `keyDown` at that div regardless of where focus is, so the contract
// that actually matters to a keyboard user — one stop per row, keys handled
// only when that stop holds focus — is untested until a real browser drives it.
//
// The rows are addressed by position here rather than by accessible name: see
// the mislabelling bug documented at the bottom of this file.

const VOLUME = 0;
const BRIGHTNESS = 1;
const IDLE_DELAY = 2;

test('each row exposes exactly one tab stop and responds to the keys once focused', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-spinrow--in-boxed-list');

  const spins = page.getByRole('spinbutton');
  const volume = spins.nth(VOLUME);
  const brightness = spins.nth(BRIGHTNESS);
  await expect(volume).toHaveAttribute('aria-valuenow', '75');

  await page.keyboard.press('Tab');
  await expect(volume).toBeFocused();

  await page.keyboard.press('ArrowUp');
  await expect(volume).toHaveAttribute('aria-valuenow', '76');

  // The steppers are tabIndex=-1, so the next Tab must skip to the next row.
  await page.keyboard.press('Tab');
  await expect(brightness).toBeFocused();
  await expect(volume).toHaveAttribute('aria-valuenow', '76');
});

test('PageDown steps by ten and Home clamps to the minimum', async ({ page }) => {
  await page.goto('/iframe.html?id=components-spinrow--in-boxed-list');

  const idle = page.getByRole('spinbutton').nth(IDLE_DELAY);
  await idle.focus();
  await expect(idle).toHaveAttribute('aria-valuenow', '5');

  // min is 1, so a ten-step decrement has to clamp instead of going negative.
  await page.keyboard.press('PageDown');
  await expect(idle).toHaveAttribute('aria-valuenow', '1');

  await page.keyboard.press('End');
  await expect(idle).toHaveAttribute('aria-valuenow', '60');

  await page.keyboard.press('Home');
  await expect(idle).toHaveAttribute('aria-valuenow', '1');
});

test('clicking a stepper adjusts the row it belongs to and leaves the others alone', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-spinrow--in-boxed-list');

  const spins = page.getByRole('spinbutton');
  const volume = spins.nth(VOLUME);
  const brightness = spins.nth(BRIGHTNESS);

  await brightness.locator('button').last().click();

  await expect(brightness).toHaveAttribute('aria-valuenow', '81');
  await expect(volume).toHaveAttribute('aria-valuenow', '75');
});

// The spinbutton takes its accessible name from the row title via
// `aria-labelledby`. Unit tests query by role alone and never read the computed
// name, so a label pointing somewhere useless would go unnoticed there.
test('the spinbutton is named after its row title', async ({ page }) => {
  await page.goto('/iframe.html?id=components-spinrow--in-boxed-list');

  await expect(page.getByRole('spinbutton', { name: 'Volume' })).toBeVisible();
});
