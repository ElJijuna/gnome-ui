import { expect, test } from '@playwright/test';

// StepIndicator turns only the *completed* steps into buttons; the current and
// future ones render as plain spans. That split decides what a keyboard user
// can reach and what a pointer can activate, and it is re-derived on every
// change of `currentStep`. jsdom can read the tags back but never walks the
// resulting tab order or the real horizontal layout of the connector row.

test('only completed steps are focusable and the current one is marked', async ({ page }) => {
  await page.goto('/iframe.html?id=components-stepindicator--interactive');

  const nav = page.getByRole('navigation', { name: 'Progress' });
  await expect(nav).toBeVisible();

  // currentStep is 2, so Account and Profile are done and clickable.
  await expect(nav.getByRole('button', { name: 'Account' })).toBeVisible();
  await expect(nav.getByRole('button', { name: 'Profile' })).toBeVisible();
  await expect(nav.getByRole('button', { name: 'Preferences' })).toHaveCount(0);
  await expect(nav.getByRole('button', { name: 'Confirm' })).toHaveCount(0);

  await expect(nav.locator('[aria-current="step"]')).toHaveCount(1);

  await page.keyboard.press('Tab');
  await expect(nav.getByRole('button', { name: 'Account' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(nav.getByRole('button', { name: 'Profile' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(nav.getByRole('button')).toHaveCount(2);
});

test('clicking a completed step moves the marker back and re-locks the later ones', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-stepindicator--interactive');

  const nav = page.getByRole('navigation', { name: 'Progress' });
  await nav.getByRole('button', { name: 'Account' }).click();

  // Back at step 0: nothing is completed any more, so no step is a button.
  await expect(nav.getByRole('button')).toHaveCount(0);
  // The marker moved to the first circle, and its list item is Account's.
  const current = nav.locator('[aria-current="step"]');
  await expect(current).toHaveText('1');
  await expect(nav.locator('li').first()).toContainText('Account');
});

test('advancing with Next promotes the passed step to a button', async ({ page }) => {
  await page.goto('/iframe.html?id=components-stepindicator--interactive');

  const nav = page.getByRole('navigation', { name: 'Progress' });
  await expect(nav.getByRole('button')).toHaveCount(2);

  await page.getByRole('button', { name: 'Next' }).click();

  await expect(nav.getByRole('button')).toHaveCount(3);
  await expect(nav.getByRole('button', { name: 'Preferences' })).toBeVisible();
});

test('the steps are laid out in one horizontal row', async ({ page }) => {
  await page.goto('/iframe.html?id=components-stepindicator--interactive');

  const items = page.getByRole('navigation', { name: 'Progress' }).locator('li');
  await expect(items).toHaveCount(4);

  const boxes = await items.evaluateAll((els) =>
    els.map((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y };
    }),
  );

  for (let i = 1; i < boxes.length; i += 1) {
    expect(boxes[i].x).toBeGreaterThan(boxes[i - 1].x);
    expect(boxes[i].y).toBe(boxes[0].y);
  }
});
