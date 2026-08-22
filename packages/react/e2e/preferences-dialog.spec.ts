import { expect, test } from '@playwright/test';

// PreferencesDialog portals a modal to the body, defers its opening focus to a
// real `requestAnimationFrame`, traps Tab inside itself, and closes on a
// backdrop click resolved with `e.target === e.currentTarget`. jsdom short-
// circuits rAF, implements no sequential focus navigation, and cannot
// hit-test a click against a real box, so PreferencesDialog.test.tsx covers
// none of the four.

test('opening focuses the search field once the frame it was deferred to runs', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-preferencesdialog--multiple-pages');

  await page.getByRole('button', { name: 'Open Preferences' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  const search = dialog.getByRole('searchbox').or(dialog.locator('input[type="search"]')).first();
  await expect(search).toBeFocused();
});

test('Tab cycles within the dialog instead of escaping to the page behind it', async ({ page }) => {
  await page.goto('/iframe.html?id=components-preferencesdialog--multiple-pages');

  const trigger = page.getByRole('button', { name: 'Open Preferences' });
  await trigger.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Walk far enough that an untrapped dialog would certainly have leaked.
  for (let i = 0; i < 25; i += 1) {
    await page.keyboard.press('Tab');
    const inside = await page.evaluate(() => {
      const el = document.querySelector('[role=dialog]');
      return !!el && el.contains(document.activeElement);
    });
    expect(inside).toBe(true);
  }

  await expect(trigger).not.toBeFocused();
});

// KNOWN BUG — the search box collects a query and forwards it to the active
// page as a `data-search-query` attribute, and there the trail ends: no
// component reads that attribute, and no CSS selects on it. Typing filters
// nothing. PreferencesDialog.test.tsx asserts the attribute is forwarded and
// passes, which is why the gap survived — it tests the wiring rather than the
// feature. Either implement filtering in PreferencesPage/PreferencesGroup or
// stop rendering a search field that does nothing.
test.fail('typing in the search box filters the settings that stay visible', async ({ page }) => {
  await page.goto('/iframe.html?id=components-preferencesdialog--multiple-pages');

  await page.getByRole('button', { name: 'Open Preferences' }).click();
  const dialog = page.getByRole('dialog');

  await expect(dialog.getByText('Dark mode')).toBeVisible();
  await expect(dialog.getByText('Text size')).toBeVisible();

  await page.keyboard.type('dark');

  await expect(dialog.getByText('Dark mode')).toBeVisible();
  await expect(dialog.getByText('Text size')).toBeHidden();
});

test('the search box does at least receive the typed query', async ({ page }) => {
  await page.goto('/iframe.html?id=components-preferencesdialog--multiple-pages');

  await page.getByRole('button', { name: 'Open Preferences' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await page.keyboard.type('dark');

  const search = dialog.locator('input').first();
  await expect(search).toHaveValue('dark');
});

test('clicking the backdrop closes it but clicking the dialog body does not', async ({ page }) => {
  await page.goto('/iframe.html?id=components-preferencesdialog--multiple-pages');

  await page.getByRole('button', { name: 'Open Preferences' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  const box = (await dialog.boundingBox())!;

  // Inside the dialog: the handler's `target === currentTarget` guard has to
  // reject this, which only means anything with real event targets.
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(dialog).toBeVisible();

  await page.mouse.click(box.x + box.width / 2, Math.max(box.y / 2, 4));
  await expect(dialog).toBeHidden();
});
