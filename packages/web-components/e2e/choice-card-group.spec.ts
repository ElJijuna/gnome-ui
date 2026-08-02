import { expect, test } from '@playwright/test';

test('renders a fieldset with a legend and a role=radiogroup grid of cards', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-choice-card-group--default');

  const fieldset = page.locator('gnome-choice-card-group fieldset');
  await expect(fieldset.locator('legend')).toHaveText('Account type');

  const radiogroup = page.locator('gnome-choice-card-group [role="radiogroup"]');
  await expect(radiogroup).toHaveAttribute('aria-label', 'Account type');
  await expect(radiogroup.locator('[role="radio"]')).toHaveCount(3);
});

test('clicking a card selects it and updates the roving tabindex', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-choice-card-group--default');

  const cards = page.locator('gnome-choice-card-group [role="radio"]');
  const team = cards.nth(1);

  await team.click();

  await expect(team).toHaveAttribute('aria-checked', 'true');
  await expect(team).toHaveAttribute('tabindex', '0');
  await expect(page.locator('.wc-story__event')).toHaveText('Selected: team.');
});

test('ArrowRight moves focus and selects the next enabled card, skipping disabled ones', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-choice-card-group--with-disabled-option');

  const cards = page.locator('gnome-choice-card-group [role="radio"]');
  await cards.nth(0).focus();
  await page.keyboard.press('ArrowRight');
  await expect(cards.nth(1)).toBeFocused();
  await expect(cards.nth(1)).toHaveAttribute('aria-checked', 'true');

  // The third card is disabled in this story, so ArrowRight wraps back to the first.
  await page.keyboard.press('ArrowRight');
  await expect(cards.nth(0)).toBeFocused();
});

test('disabled disables descendant cards via native fieldset cascade', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-choice-card-group--disabled');

  const cards = page.locator('gnome-choice-card-group [role="radio"]');
  await expect(cards.first()).toBeDisabled();
});

test('error state shows the error message with role="alert"', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-choice-card-group--error-state');

  const alert = page.locator('gnome-choice-card-group [role="alert"]');
  await expect(alert).toHaveText('Choose an account type to continue.');
});
