import { expect, test } from '@playwright/test';

// ToggleGroup is a roving-tabindex radiogroup: only the checked item is
// `tabIndex={0}`. ToggleGroup.test.tsx drives the arrow keys by calling
// `.focus()` on an item and then firing `keyDown` at the radiogroup, so it
// never exercises sequential focus navigation — jsdom has no Tab-key
// implementation — nor the `items[next].click()` the handler relies on to
// select, which in a real browser is a full dispatched click event.

test('a real Tab lands on the checked item and a single arrow selects across the disabled one', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-togglegroup--with-disabled');

  const a = page.getByRole('radio', { name: 'Option A' });
  const b = page.getByRole('radio', { name: 'Option B' });
  const c = page.getByRole('radio', { name: 'Option C' });

  await expect(a).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('Tab');
  await expect(a).toBeFocused();

  // `:not(:disabled)` filters Option B out of the list, so one ArrowRight has
  // to move both focus and selection two items along.
  await a.press('ArrowRight');
  await expect(c).toBeFocused();
  await expect(c).toHaveAttribute('aria-checked', 'true');
  await expect(b).toHaveAttribute('aria-checked', 'false');
  await expect(a).toHaveAttribute('aria-checked', 'false');
});

test('the group keeps a single tab stop that moves with the selection', async ({ page }) => {
  await page.goto('/iframe.html?id=components-togglegroup--with-disabled');

  const a = page.getByRole('radio', { name: 'Option A' });
  const c = page.getByRole('radio', { name: 'Option C' });

  await expect(a).toHaveAttribute('aria-checked', 'true');
  await a.press('ArrowRight');
  await expect(c).toBeFocused();

  // Re-entering the group from outside is the only way to observe a roving
  // tabindex, so give the page a focusable element that sits before it.
  await page.evaluate((selector) => {
    const group = document.querySelector(selector)!;
    const before = document.createElement('button');
    before.id = 'sentinel';
    group.parentElement!.insertBefore(before, group);
  }, '[role=radiogroup]');
  await page.locator('#sentinel').focus();
  await page.keyboard.press('Tab');
  await expect(c).toBeFocused();
  await expect(a).not.toBeFocused();
});
