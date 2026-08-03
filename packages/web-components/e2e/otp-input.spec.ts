import { expect, test } from '@playwright/test';

test('typing a digit auto-advances focus to the next cell', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-otp-input--default');

  const cells = page.locator('gnome-otp-input [data-slot="otp-input-cell"]');
  await expect(cells).toHaveCount(6);

  await cells.nth(0).click();
  await page.keyboard.type('5');

  await expect(cells.nth(1)).toBeFocused();
  await expect(page.locator('.wc-story__event')).toHaveText('Value: "5".');
});

test('backspace on an empty cell clears and focuses the previous cell', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-otp-input--default');

  const cells = page.locator('gnome-otp-input [data-slot="otp-input-cell"]');
  await cells.nth(0).click();
  await page.keyboard.type('12');
  await expect(cells.nth(2)).toBeFocused();

  await page.keyboard.press('Backspace');
  await expect(cells.nth(1)).toBeFocused();
  await expect(page.locator('.wc-story__event')).toHaveText('Value: "1".');
});

test('pasting a full code fills every cell', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-otp-input--default');

  const cells = page.locator('gnome-otp-input [data-slot="otp-input-cell"]');
  await cells.nth(0).click();

  await page.evaluate(() => {
    const cell = document.querySelector('gnome-otp-input [data-slot="otp-input-cell"]');
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text', '123456');
    const event = new ClipboardEvent('paste', { clipboardData: dataTransfer, bubbles: true });
    cell?.dispatchEvent(event);
  });

  await expect(page.locator('.wc-story__event')).toHaveText('Value: "123456".');
});

test('masked story renders password-type cells', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-otp-input--masked');

  const cells = page.locator('gnome-otp-input [data-slot="otp-input-cell"]');
  await expect(cells).toHaveCount(4);
  await expect(cells.first()).toHaveAttribute('type', 'password');
});

test('disabled disables descendant cells via native fieldset cascade', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-otp-input--disabled');

  const cells = page.locator('gnome-otp-input [data-slot="otp-input-cell"]');
  await expect(cells.first()).toBeDisabled();
});

test('error state shows the error message with role="alert" and marks cells invalid', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-otp-input--error-state');

  const alert = page.locator('gnome-otp-input [role="alert"]');
  await expect(alert).toHaveText('That code is incorrect. Try again.');

  const cells = page.locator('gnome-otp-input [data-slot="otp-input-cell"]');
  await expect(cells.first()).toHaveAttribute('aria-invalid', 'true');
});
