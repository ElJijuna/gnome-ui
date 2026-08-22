import { expect, test } from '@playwright/test';

// `interactive` swaps ActionRow's wrapper from a <div> to a <button>, which is
// the whole point: the row then gains native activation, native focus, and a
// hit area that spans title, subtitle, and trailing content. ActionRow.test.tsx
// clicks the element it queried, so it never covers keyboard activation (jsdom
// does not turn Space into a click) or a click landing on a nested span.

test('an interactive row activates from the keyboard like a native button', async ({ page }) => {
  await page.goto('/iframe.html?id=components-actionrow--interactive');

  const fired: string[] = [];
  page.on('dialog', async (dialog) => {
    fired.push(dialog.message());
    await dialog.dismiss();
  });

  const about = page.getByRole('button', { name: /About/ });
  await about.focus();
  await page.keyboard.press(' ');
  await expect.poll(() => fired).toEqual(['About']);

  await page.keyboard.press('Enter');
  await expect.poll(() => fired).toEqual(['About', 'About']);
});

test('the whole row is the hit target, subtitle included', async ({ page }) => {
  await page.goto('/iframe.html?id=components-actionrow--interactive');

  const fired: string[] = [];
  page.on('dialog', async (dialog) => {
    fired.push(dialog.message());
    await dialog.dismiss();
  });

  const system = page.getByRole('button', { name: /System/ });
  await system.getByText('Software updates').click();

  await expect.poll(() => fired).toEqual(['System']);
});

test('a non-interactive row is neither a button nor a tab stop', async ({ page }) => {
  await page.goto('/iframe.html?id=components-actionrow--default');

  await expect(page.getByRole('button')).toHaveCount(0);

  await page.keyboard.press('Tab');
  const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
  expect(focusedTag).toBe('BODY');
});

test('interactive rows in a list are consecutive tab stops', async ({ page }) => {
  await page.goto('/iframe.html?id=components-actionrow--interactive');

  const rows = page.getByRole('button');
  await expect(rows).toHaveCount(3);

  await page.keyboard.press('Tab');
  await expect(rows.nth(0)).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(rows.nth(1)).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(rows.nth(2)).toBeFocused();
});
