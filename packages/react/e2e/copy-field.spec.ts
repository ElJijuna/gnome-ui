import { expect, test } from '@playwright/test';

// CopyField pairs a read-only input with a CopyButton that writes to the real
// clipboard. jsdom has no clipboard, no `readOnly` selection semantics, and no
// layout, so CopyField.test.tsx cannot verify that the value actually reaches
// the OS clipboard, that the field resists editing while still being
// selectable, or that the button is positioned inside the field's own box.

test.beforeEach(async ({ context, baseURL }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseURL });
});

test('the button copies the field value to the real clipboard', async ({ page }) => {
  await page.goto('/iframe.html?id=components-copyfield--default');

  const field = page.getByLabel('API key');
  await expect(field).toHaveValue('sk-live-4242424242424242');

  await page.getByRole('button', { name: 'Copy' }).click();
  await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible();

  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'sk-live-4242424242424242',
  );
});

test('the field is read-only to typing but still focusable and selectable', async ({ page }) => {
  await page.goto('/iframe.html?id=components-copyfield--default');

  const field = page.getByLabel('API key');

  await field.click();
  await expect(field).toBeFocused();

  await page.keyboard.type('tampered');
  await expect(field).toHaveValue('sk-live-4242424242424242');

  // read-only still allows selection, which is what makes manual copying work.
  await page.keyboard.press('ControlOrMeta+a');
  const selected = await field.evaluate(
    (el: HTMLInputElement) => el.value.slice(el.selectionStart ?? 0, el.selectionEnd ?? 0).length,
  );
  expect(selected).toBe('sk-live-4242424242424242'.length);
});

test('the copy button sits inside the field and does not overlap its text', async ({ page }) => {
  await page.goto('/iframe.html?id=components-copyfield--default');

  const field = page.getByLabel('API key');
  const button = page.getByRole('button', { name: 'Copy' });

  const fieldBox = (await field.boundingBox())!;
  const buttonBox = (await button.boundingBox())!;

  // The button is absolutely positioned over the input, so the input has to
  // reserve padding wide enough for it.
  expect(buttonBox.x).toBeGreaterThan(fieldBox.x);
  expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(fieldBox.x + fieldBox.width + 1);

  const paddingRight = await field.evaluate((el) => parseFloat(getComputedStyle(el).paddingRight));
  expect(paddingRight).toBeGreaterThanOrEqual(buttonBox.width);
});

test('copying one field in a list does not copy another', async ({ page }) => {
  await page.goto('/iframe.html?id=components-copyfield--multiple-fields');

  const buttons = page.getByRole('button', { name: 'Copy' });
  const fields = page.getByRole('textbox');

  const secondValue = await fields.nth(1).inputValue();
  await buttons.nth(1).click();

  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(secondValue);
});
