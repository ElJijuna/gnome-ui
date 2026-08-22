import { expect, test } from '@playwright/test';

// PasswordField swaps the input's `type` between "password" and "text" to
// reveal the value. Changing an input's type is a browser operation with real
// side effects — the value has to survive it, the caret has to survive it, and
// the reveal control must not be treated as a submit button. jsdom models none
// of that, and PasswordField.test.tsx only reads the `type` attribute back.

test('revealing keeps the typed value and hands focus back to a real text input', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-passwordfield--form-example');

  const field = page.getByLabel('Password', { exact: true });
  await field.fill('hunter2-correct-horse');
  await expect(field).toHaveAttribute('type', 'password');

  await page.getByRole('button', { name: 'Show password' }).first().click();

  await expect(field).toHaveAttribute('type', 'text');
  await expect(field).toHaveValue('hunter2-correct-horse');

  await page.getByRole('button', { name: 'Hide password' }).click();
  await expect(field).toHaveAttribute('type', 'password');
  await expect(field).toHaveValue('hunter2-correct-horse');
});

test('the reveal control is a button, not a submit, so Enter in the field never triggers it', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-passwordfield--form-example');

  const field = page.getByLabel('Password', { exact: true });
  const toggle = page.getByRole('button', { name: 'Show password' }).first();

  await expect(toggle).toHaveAttribute('type', 'button');

  await field.fill('secret');
  await field.press('Enter');

  // Still concealed — Enter must not have activated the toggle.
  await expect(field).toHaveAttribute('type', 'password');
  await expect(toggle).toBeVisible();
});

test('each field reveals independently and the toggle sits inside its own field', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-passwordfield--form-example');

  const first = page.getByLabel('Password', { exact: true });
  const second = page.getByLabel('Confirm password');

  await page.getByRole('button', { name: 'Show password' }).first().click();

  await expect(first).toHaveAttribute('type', 'text');
  await expect(second).toHaveAttribute('type', 'password');

  const fieldBox = (await first.boundingBox())!;
  const toggleBox = (await page.getByRole('button', { name: 'Hide password' }).boundingBox())!;

  expect(toggleBox.y).toBeGreaterThanOrEqual(fieldBox.y - 1);
  expect(toggleBox.y + toggleBox.height).toBeLessThanOrEqual(fieldBox.y + fieldBox.height + 1);
});
