import { expect, test } from '@playwright/test';

// ViewSwitcherSidebar is a vertical roving-tabindex radiogroup whose keyboard
// handler moves focus and then clicks the item it landed on.
// ViewSwitcherSidebar.test.tsx focuses items by hand and fires `keyDown` at the
// group, so neither the real Tab entry point nor the dispatched click is
// covered — and the vertical stacking is layout jsdom does not do.

test('the sidebar is one tab stop that sits on the active view', async ({ page }) => {
  await page.goto('/iframe.html?id=components-viewswitchersidebar--with-counts');

  const inbox = page.getByRole('radio', { name: /Inbox/ });
  const drafts = page.getByRole('radio', { name: /Drafts/ });

  await expect(inbox).toHaveAttribute('aria-checked', 'true');

  await page.keyboard.press('Tab');
  await expect(inbox).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(drafts).not.toBeFocused();
});

test('ArrowDown moves focus and selects the next view', async ({ page }) => {
  await page.goto('/iframe.html?id=components-viewswitchersidebar--with-counts');

  const inbox = page.getByRole('radio', { name: /Inbox/ });
  const drafts = page.getByRole('radio', { name: /Drafts/ });
  const trash = page.getByRole('radio', { name: /Trash/ });

  await inbox.focus();
  await page.keyboard.press('ArrowDown');

  await expect(drafts).toBeFocused();
  await expect(drafts).toHaveAttribute('aria-checked', 'true');
  await expect(inbox).toHaveAttribute('aria-checked', 'false');

  await page.keyboard.press('End');
  await expect(trash).toBeFocused();
  await expect(trash).toHaveAttribute('aria-checked', 'true');
});

test('the views stack vertically and the counts sit at the trailing edge', async ({ page }) => {
  await page.goto('/iframe.html?id=components-viewswitchersidebar--with-counts');

  const items = page.getByRole('radio');
  await expect(items).toHaveCount(4);

  const boxes = await items.evaluateAll((els) =>
    els.map((el) => {
      const rect = el.getBoundingClientRect();
      return { x: Math.round(rect.x), y: Math.round(rect.y) };
    }),
  );

  for (let i = 1; i < boxes.length; i += 1) {
    expect(boxes[i].y).toBeGreaterThan(boxes[i - 1].y);
    expect(boxes[i].x).toBe(boxes[0].x);
  }

  // The badge has to render inside its row, pushed to the right of the label.
  const inbox = items.first();
  const inboxBox = (await inbox.boundingBox())!;
  const badgeBox = (await inbox.getByText('12').boundingBox())!;
  expect(badgeBox.x).toBeGreaterThan(inboxBox.x + inboxBox.width / 2);
});
