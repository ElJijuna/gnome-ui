import { expect, test } from '@playwright/test';

// CheckRow is a native <button role="checkbox"> whose entire surface — the
// title, the subtitle, and the aria-hidden indicator span — is the hit target.
// CheckRow.test.tsx fires `click` straight at the button and `keyDown` for
// keys, so it never covers the two things the browser owns here: activating a
// button with the Space key (jsdom never synthesises the resulting click) and
// a click on a nested aria-hidden child bubbling out to the row.

test('the Space key toggles the row the way a native button does', async ({ page }) => {
  await page.goto('/iframe.html?id=components-checkrow--in-boxed-list');

  const crashReports = page.getByRole('checkbox', { name: 'Enable crash reports' });
  await expect(crashReports).toHaveAttribute('aria-checked', 'false');

  await crashReports.press(' ');
  await expect(crashReports).toHaveAttribute('aria-checked', 'true');

  await crashReports.press(' ');
  await expect(crashReports).toHaveAttribute('aria-checked', 'false');
});

test('clicking the subtitle or the indicator toggles the row, not just the button box', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-checkrow--in-boxed-list');

  const usage = page.getByRole('checkbox', { name: 'Send usage statistics' });
  await expect(usage).toHaveAttribute('aria-checked', 'true');

  // The subtitle is a plain span inside the button — a real click on it has to
  // bubble to the row's handler.
  await usage.getByText('Help improve the app anonymously').click();
  await expect(usage).toHaveAttribute('aria-checked', 'false');

  // The indicator is aria-hidden but still painted and still clickable; it
  // must not swallow the click either.
  const box = await usage.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box!.x + box!.width - 12, box!.y + box!.height / 2);
  await expect(usage).toHaveAttribute('aria-checked', 'true');
});

test('a disabled row ignores both pointer and keyboard activation', async ({ page }) => {
  await page.goto('/iframe.html?id=components-checkrow--disabled');

  const row = page.getByRole('checkbox').first();
  const before = await row.getAttribute('aria-checked');

  await expect(row).toBeDisabled();

  // A disabled button takes neither focus nor a click in the browser, so the
  // keypress has nowhere to land.
  await row.click({ force: true });
  await page.keyboard.press(' ');

  await expect(row).toHaveAttribute('aria-checked', before!);
});
