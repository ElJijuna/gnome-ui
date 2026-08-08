import { expect, test } from '@playwright/test';

// TagInput splits a pasted comma/newline-separated list into multiple tags
// by reading `ClipboardEvent.clipboardData`. TagInput.test.tsx only ever
// fires a synthetic paste with a hand-rolled `{ clipboardData: { getData:
// () => '...' } }` stub — never a real OS clipboard round-trip through a
// real `ClipboardEvent`/`DataTransfer` and a real Ctrl/Cmd+V shortcut.

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test('a real OS clipboard paste splits comma-separated text into multiple tags', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-taginput--empty');

  const input = page.getByPlaceholder('Add a tag…');
  await input.click();

  await page.evaluate(() => navigator.clipboard.writeText('react, gnome, vue'));
  await page.keyboard.press('ControlOrMeta+v');

  await expect(page.getByText('react', { exact: true })).toBeVisible();
  await expect(page.getByText('gnome', { exact: true })).toBeVisible();
  await expect(page.getByText('vue', { exact: true })).toBeVisible();
  await expect(input).toHaveValue('');
});

test('skips a tag already present when pasted via the real clipboard', async ({ page }) => {
  await page.goto('/iframe.html?id=components-taginput--default');

  const input = page.getByPlaceholder('Add a tag…');
  await input.click();

  // The Default story starts with ["react", "gnome"] already added.
  await page.evaluate(() => navigator.clipboard.writeText('gnome,vue'));
  await page.keyboard.press('ControlOrMeta+v');

  await expect(page.getByText('vue', { exact: true })).toBeVisible();
  await expect(page.getByText('gnome', { exact: true })).toHaveCount(1);
});
