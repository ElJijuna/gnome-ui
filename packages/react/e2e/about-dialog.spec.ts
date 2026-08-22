import { expect, test } from '@playwright/test';

// AboutDialog portals itself to document.body and layers three browser-level
// behaviours on top: `trapFocus` (which reads `document.activeElement` and
// cancels the real Tab), focus restoration to whatever was focused before it
// opened, and `useBodyScrollLock`. AboutDialog.test.tsx runs in jsdom, which
// implements none of sequential focus navigation, scrolling, or a portal that
// participates in the real tab order — so all three are only observable here.

test('focus lands on the first control and Tab cycles inside the dialog', async ({ page }) => {
  await page.goto('/iframe.html?id=components-aboutdialog--default');

  await page.getByRole('button', { name: 'About Files' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  const detailsTab = dialog.getByRole('tab', { name: 'Details' });
  const closeButton = dialog.getByRole('button', { name: 'Close' });

  // The open effect focuses the first match of FOCUSABLE inside the dialog.
  await expect(detailsTab).toBeFocused();

  // Forward from the last focusable must wrap to the first rather than
  // escaping to the trigger button behind the backdrop.
  await closeButton.focus();
  await page.keyboard.press('Tab');
  await expect(detailsTab).toBeFocused();

  // And backwards from the first focusable must wrap to the last.
  await page.keyboard.press('Shift+Tab');
  await expect(closeButton).toBeFocused();
});

test('Escape closes the dialog and returns focus to the element that opened it', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-aboutdialog--default');

  const trigger = page.getByRole('button', { name: 'About Files' });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.keyboard.press('Escape');

  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('the page behind the dialog cannot actually be scrolled while it is open', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-aboutdialog--default');

  // Give the story enough height for the document to be scrollable at all.
  await page.evaluate(() => {
    const filler = document.createElement('div');
    filler.style.height = '3000px';
    document.body.append(filler);
  });

  await page.getByRole('button', { name: 'About Files' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.mouse.wheel(0, 1200);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);

  // Closing must hand scrolling back — the hook restores the previous inline
  // overflow rather than blanking it.
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();

  await page.mouse.wheel(0, 1200);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});
