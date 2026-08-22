import { expect, test } from '@playwright/test';

// Dialog decides "did the user click outside?" purely by where the click
// landed: the backdrop owns the onClick and the dialog box stops propagation.
// Dialog.test.tsx can only fire a click straight at the backdrop node, which
// sidesteps the part that can actually break — real hit-testing against the
// dialog's real box — and jsdom cannot express "click at these coordinates".

test('clicking the backdrop closes the dialog but clicking inside it does not', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-dialog--with-body');

  await page.getByRole('button', { name: 'Discard changes' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // A click well inside the dialog box must be swallowed by its own handler.
  await dialog.getByText('All unsaved changes will be permanently lost.').click();
  await expect(dialog).toBeVisible();

  // Now click the backdrop itself, above the dialog box.
  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box!.x + box!.width / 2, Math.max(box!.y / 2, 4));

  await expect(dialog).toBeHidden();
});

test('closeOnBackdrop={false} survives an outside click', async ({ page }) => {
  await page.goto('/iframe.html?id=components-dialog--no-backdrop-close');

  await page.getByRole('button', { name: 'Open strict dialog' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box!.x + box!.width / 2, Math.max(box!.y / 2, 4));

  await expect(dialog).toBeVisible();
});

// Escape is handled by a `document`-level listener rather than by the dialog
// element, so it keeps working after focus has left the dialog — which is what
// a backdrop click does. Unit tests fire keyDown straight at the dialog node,
// where focus location never matters, so only a real browser separates the two.
test('Escape still closes the dialog after the backdrop has taken focus', async ({ page }) => {
  await page.goto('/iframe.html?id=components-dialog--no-backdrop-close');

  await page.getByRole('button', { name: 'Open strict dialog' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box!.x + box!.width / 2, Math.max(box!.y / 2, 4));

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('Escape on an alertdialog fires the non-destructive response', async ({ page }) => {
  await page.goto('/iframe.html?id=components-dialog--alert-destructive');

  await page.getByRole('button', { name: 'Delete file…' }).click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();

  await page.keyboard.press('Escape');

  await expect(dialog).toBeHidden();
  // `dismissAlert` picks the first non-destructive, non-disabled response —
  // pressing Escape must never resolve as "delete".
  await expect(page.getByText('Response:')).toContainText('cancel');
});
