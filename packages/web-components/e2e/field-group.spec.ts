import { expect, test } from '@playwright/test';

test('renders a fieldset with a legend and describes it with the helper text', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-field-group--default');

  const fieldset = page.locator('gnome-field-group fieldset');
  const legend = fieldset.locator('legend');
  await expect(legend).toHaveText('Notification method');

  const describedBy = await fieldset.getAttribute('aria-describedby');
  expect(describedBy).toBeTruthy();
  await expect(page.locator(`#${describedBy}`)).toHaveText('Choose how you want to be notified.');
});

test('error state shows the error message with role="alert"', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-field-group--error-state');

  const alert = page.locator('gnome-field-group [role="alert"]');
  await expect(alert).toHaveText('Select at least one notification method.');
});

test('disabled disables descendant radio inputs via native fieldset cascade', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-field-group--disabled');

  // Playwright's disabled check doesn't treat a plain <fieldset> itself as
  // "disabled" (confirmed against a bare native fieldset outside this
  // component), but it does correctly detect the browser's native cascade
  // onto descendant controls — that cascade, not the fieldset's own state,
  // is what this component exists to provide for free.
  const radios = page.locator('gnome-field-group input[type="radio"]');
  await expect(radios.first()).toBeDisabled();
  await expect(radios.last()).toBeDisabled();
});
