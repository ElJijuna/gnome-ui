import { expect, test } from '@playwright/test';

// SwitchRow is a native <button role="switch"> covering the whole row. Same
// browser-owned gaps as CheckRow: SwitchRow.test.tsx clicks the button node
// directly, so neither Space-key activation (which jsdom does not turn into a
// click on a button) nor a click landing on one of the row's nested spans is
// actually exercised.

test('the Space key flips the switch the way a native button does', async ({ page }) => {
  await page.goto('/iframe.html?id=components-switchrow--in-boxed-list');

  const bluetooth = page.getByRole('switch', { name: 'Bluetooth' });
  await expect(bluetooth).toHaveAttribute('aria-checked', 'false');

  await bluetooth.press(' ');
  await expect(bluetooth).toHaveAttribute('aria-checked', 'true');
});

test('clicking the switch track toggles the row it belongs to', async ({ page }) => {
  await page.goto('/iframe.html?id=components-switchrow--in-boxed-list');

  const wifi = page.getByRole('switch', { name: 'Wi-Fi' });
  const bluetooth = page.getByRole('switch', { name: 'Bluetooth' });
  await expect(wifi).toHaveAttribute('aria-checked', 'true');

  // The track sits at the trailing edge of the row and is aria-hidden — a
  // real click there still has to reach the row's own handler.
  const box = await wifi.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box!.x + box!.width - 24, box!.y + box!.height / 2);

  await expect(wifi).toHaveAttribute('aria-checked', 'false');
  // Rows are siblings inside one BoxedList; toggling one must not touch another.
  await expect(bluetooth).toHaveAttribute('aria-checked', 'false');
});

test('each row in a BoxedList is its own tab stop', async ({ page }) => {
  await page.goto('/iframe.html?id=components-switchrow--in-boxed-list');

  const wifi = page.getByRole('switch', { name: 'Wi-Fi' });
  await expect(wifi).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(wifi).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('switch', { name: 'Bluetooth' })).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('switch', { name: 'Airplane Mode' })).toBeFocused();
});
