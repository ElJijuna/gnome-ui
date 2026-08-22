import { expect, test } from '@playwright/test';

// TextField wires a `<label htmlFor>` to its input and hangs its error state
// on `aria-invalid` plus an `.errorInput` class. jsdom resolves neither the
// label→control activation the browser performs on click, nor the computed
// border the error class is entirely made of, so TextField.test.tsx can only
// check that the attributes are present.

test('clicking a label focuses its own field, not a sibling field', async ({ page }) => {
  await page.goto('/iframe.html?id=components-textfield--form-example');

  const email = page.getByLabel('Email');
  const fullName = page.getByLabel('Full name');

  await page.getByText('Email', { exact: true }).click();

  await expect(email).toBeFocused();
  await expect(fullName).not.toBeFocused();
});

test('the error state is actually painted and is announced through the hint', async ({ page }) => {
  await page.goto('/iframe.html?id=components-textfield--form-example');

  const healthy = page.getByLabel('Password', { exact: true });
  const broken = page.getByLabel('Confirm password');

  await expect(broken).toHaveAttribute('aria-invalid', 'true');
  await expect(healthy).not.toHaveAttribute('aria-invalid', 'true');

  const border = (locator: typeof healthy) =>
    locator.evaluate((el) => getComputedStyle(el).borderColor);
  expect(await border(broken)).not.toBe(await border(healthy));

  // aria-describedby has to resolve to the message the user can see.
  const describedBy = await broken.getAttribute('aria-describedby');
  await expect(page.locator(`#${describedBy}`)).toHaveText('Passwords do not match.');
});

test('each field is its own tab stop in document order', async ({ page }) => {
  await page.goto('/iframe.html?id=components-textfield--form-example');

  await expect(page.getByLabel('Full name')).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Full name')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Email')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Password', { exact: true })).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Confirm password')).toBeFocused();
});
