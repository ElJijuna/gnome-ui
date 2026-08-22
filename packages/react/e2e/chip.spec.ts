import { expect, test } from '@playwright/test';

// A removable Chip nests its × button inside the chip surface and relies on
// `stopPropagation` so removing never reads as selecting. Chip.test.tsx fires
// clicks straight at whichever node it queried, so the propagation path — the
// one thing that can actually break here — is never walked. The chips also lay
// out in a WrapBox, whose wrapping only exists once there is real layout.

test('removing a chip does not toggle it and leaves its neighbours alone', async ({ page }) => {
  await page.goto('/iframe.html?id=components-chip--removable');

  const gnome = page.getByText('GNOME', { exact: true });
  await expect(gnome).toBeVisible();

  await page.getByRole('button', { name: 'Remove GNOME' }).click();

  await expect(gnome).toBeHidden();
  await expect(page.getByText('React', { exact: true })).toBeVisible();
  await expect(page.getByText('TypeScript', { exact: true })).toBeVisible();
});

test('a selectable chip toggles on click and on the Space key', async ({ page }) => {
  await page.goto('/iframe.html?id=components-chip--filter-bar');

  // A selectable chip renders as <button role="checkbox">.
  const all = page.getByRole('checkbox', { name: 'All' });
  const flagged = page.getByRole('checkbox', { name: 'Flagged' });

  await expect(page.getByText('Filter: All')).toBeVisible();

  await flagged.click();
  await expect(page.getByText('Filter: Flagged')).toBeVisible();
  await expect(flagged).toHaveAttribute('aria-checked', 'true');
  await expect(all).toHaveAttribute('aria-checked', 'false');

  // Native button activation via the keyboard — jsdom never synthesises the
  // click that Space produces.
  await all.focus();
  await page.keyboard.press(' ');
  await expect(page.getByText('Filter: All')).toBeVisible();
});

test('the chips wrap onto more than one line in a narrow container', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 600 });
  await page.goto('/iframe.html?id=components-chip--removable');

  const chips = page.locator('[aria-label^="Remove "]');
  await expect(chips.first()).toBeVisible();

  const tops = await chips.evaluateAll((els) =>
    els.map((el) => Math.round(el.getBoundingClientRect().top)),
  );

  // Real layout is the only place wrapping happens at all.
  expect(new Set(tops).size).toBeGreaterThan(1);
});
