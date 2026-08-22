import { expect, test } from '@playwright/test';

// PasswordEntryRow puts its reveal button in the trailing slot of an EntryRow
// whose own row-level onClick focuses the input — so the button's
// `stopPropagation` is the only thing keeping "reveal" from also meaning
// "focus the field". That is a real event-propagation path plus real
// hit-testing, and PasswordEntryRow.test.tsx clicks nodes directly, so it
// never walks it.

test('revealing swaps the input type without stealing focus into the field', async ({ page }) => {
  await page.goto('/iframe.html?id=components-passwordentryrow--pre-filled');

  // The PreFilled story renders two rows — scope to one of them, since a
  // locator keyed on type="password" would slide onto the other row the
  // moment this one is revealed.
  const row = page.getByRole('listitem').filter({ hasText: 'Current Password' });
  const field = row.locator('input');
  await expect(field).toHaveAttribute('type', 'password');

  const reveal = row.getByRole('button', { name: 'Reveal password' });
  await reveal.click();

  await expect(field).toHaveAttribute('type', 'text');
  // `stopPropagation` must have kept the row's focus handler from running.
  await expect(field).not.toBeFocused();
  await expect(row.getByRole('button', { name: 'Conceal password' })).toBeVisible();
});

test('the revealed value is the one that was typed', async ({ page }) => {
  await page.goto('/iframe.html?id=components-passwordentryrow--default');

  const field = page.locator('input').first();
  await field.fill('correct-horse-battery');
  await expect(field).toHaveAttribute('type', 'password');

  await page.getByRole('button', { name: 'Reveal password' }).click();

  await expect(field).toHaveAttribute('type', 'text');
  await expect(field).toHaveValue('correct-horse-battery');

  await page.getByRole('button', { name: 'Conceal password' }).click();
  await expect(field).toHaveValue('correct-horse-battery');
});

test('two password rows reveal independently', async ({ page }) => {
  await page.goto('/iframe.html?id=components-passwordentryrow--in-boxed-list');

  const passwords = page.locator('input[type="password"]');
  await expect(passwords).toHaveCount(2);

  await page.getByRole('button', { name: 'Reveal password' }).first().click();

  await expect(page.locator('input[type="password"]')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Conceal password' })).toHaveCount(1);
});

test('clicking the row itself still focuses the field', async ({ page }) => {
  await page.goto('/iframe.html?id=components-passwordentryrow--pre-filled');

  const field = page.locator('input').first();
  await expect(field).toBeVisible();
  await expect(field).not.toBeFocused();

  const box = (await field.boundingBox())!;
  await page.mouse.click(box.x + box.width / 4, box.y + box.height / 2);

  await expect(field).toBeFocused();
});
