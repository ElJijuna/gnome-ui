import { expect, test } from '@playwright/test';

// TabBar implements a roving tabindex: only the active TabItem carries
// `tabIndex={0}`, every other tab is -1. Tabs.test.tsx verifies the arrow-key
// handler by calling `.focus()` manually and firing `keyDown` at the tablist —
// it never exercises sequential focus navigation, which jsdom does not
// implement at all. Pressing the real Tab key is the only way to prove the
// roving tabindex actually collapses the whole bar into a single tab stop.

test('the Tab key enters the bar at the active tab and skips the inactive ones', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-tabs--default');

  const files = page.getByRole('tab', { name: 'Files' });
  await expect(files).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('Tab');
  await expect(files).toBeFocused();

  // Music and Photos are tabIndex=-1, so the next Tab must leave the bar
  // entirely rather than step through them.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('tab', { name: 'Music' })).not.toBeFocused();
  await expect(page.getByRole('tab', { name: 'Photos' })).not.toBeFocused();
});

test('the roving tab stop follows the selection after an arrow-key move', async ({ page }) => {
  await page.goto('/iframe.html?id=components-tabs--default');

  await page.getByRole('tab', { name: 'Files' }).press('ArrowRight');

  const music = page.getByRole('tab', { name: 'Music' });
  await expect(music).toBeFocused();

  // Arrow keys only move focus; selection needs the activation click.
  await music.press('Enter');
  await expect(music).toHaveAttribute('aria-selected', 'true');

  // Re-entering the group from outside is the only way to observe a roving
  // tabindex, so give the page a focusable element that sits before it.
  await page.evaluate((selector) => {
    const group = document.querySelector(selector)!;
    const before = document.createElement('button');
    before.id = 'sentinel';
    group.parentElement!.insertBefore(before, group);
  }, '[role=tablist]');
  await page.locator('#sentinel').focus();
  await page.keyboard.press('Tab');
  await expect(music).toBeFocused();
});

test('clicking the close button removes the tab without selecting it', async ({ page }) => {
  await page.goto('/iframe.html?id=components-tabs--closeable');

  const photos = page.getByRole('tab', { name: 'Photos' });
  await expect(page.getByText('Files panel')).toBeVisible();

  // The × lives in a <button> nested inside the tab's own <button>. Only a
  // real browser dispatches the click through both, so this is the only place
  // the handler's `stopPropagation` is genuinely under test: if the outer
  // onClick also ran, the story would select the tab it is about to delete and
  // end up showing no panel at all.
  await photos.getByRole('button', { name: 'Close tab' }).click();

  await expect(photos).toBeHidden();
  await expect(page.getByText('Files panel')).toBeVisible();
});
