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

// `.tab` has `min-width`/`max-width` but no `flex-shrink`, so it defaults to
// `flex-shrink: 1` like any other flex child — meaning the browser actively
// shrinks every tab toward its 80px `min-width` floor rather than letting
// `.list`'s `overflow-x: auto` scroll them at their natural width.
// `.tabIcon`/`.tabBadge`/`.closeBtn` all have `flex-shrink: 0`, but
// `.tabLabel` (`flex: 1; min-width: 0`) does not — so once a tab carrying an
// icon *and* a count badge gets shrunk to 80px, there isn't enough room left
// for those two fixed-size siblings and the label at once, and the label is
// what gives: measured at 8px wide for the word "Home" before this fix (a
// sliver of one letter, not a real ellipsis-truncated label) on the
// `MobilePortraitOverflow` story at a 375px viewport — reproduced by hand
// with Playwright before writing this assertion. jsdom doesn't run a real
// flex layout at all, so this can only be caught with an actual browser.
test('a tab carrying both an icon and a count badge keeps its label legible on a narrow mobile-portrait viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/iframe.html?id=components-tabs--mobile-portrait-overflow');

  const homeTab = page.getByRole('tab', { name: 'Home' });
  await expect(homeTab).toHaveCSS('flex-shrink', '0');

  // The label span specifically — not just the tab button, which is
  // clamped to 80px by `min-width` either way and would look "fine" even
  // with a fully collapsed label inside it.
  const label = homeTab.locator('span').nth(1);
  await expect(label).toHaveText('Home');
  const box = await label.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThan(20);

  // The bar should scroll to reveal overflowing tabs rather than squeeze
  // them all into view — the real fix, not just a side effect of it.
  const tablist = page.getByRole('tablist');
  const overflows = await tablist.evaluate((el) => el.scrollWidth > el.clientWidth);
  expect(overflows).toBe(true);
});

// `Tabs.test.tsx` covers the button-visibility/sign logic against a mocked
// `scrollWidth`/`clientWidth`/`scrollBy` — this exercises the real thing:
// an actual overflowing layout, an actual native `scrollBy`, and the "next"
// button actually disappearing once there's nothing left to scroll to.
test('the "next" scroll button reveals overflowing tabs and hands off to "previous"', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/iframe.html?id=components-tabs--mobile-portrait-overflow');

  const tablist = page.getByRole('tablist');
  const next = page.getByRole('button', { name: 'Scroll to next tabs' });
  const previous = page.getByRole('button', { name: 'Scroll to previous tabs' });

  await expect(previous).toHaveCount(0);
  await expect(next).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Settings' })).not.toBeInViewport();

  // Click through to the far end — one page-scroll (80% of the bar's width)
  // isn't guaranteed to reach the last tab in a single press, and each press
  // scrolls smoothly, so give the animation time to settle before checking
  // whether another press is still needed.
  for (let guard = 0; guard < 10 && (await next.isVisible()); guard++) {
    await next.click();
    await page.waitForTimeout(400);
  }

  await expect(next).toHaveCount(0);
  await expect(previous).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Settings' })).toBeInViewport();

  const scrollLeftAtEnd = await tablist.evaluate((el) => el.scrollLeft);
  expect(scrollLeftAtEnd).toBeGreaterThan(0);

  for (let guard = 0; guard < 10 && (await previous.isVisible()); guard++) {
    await previous.click();
    await page.waitForTimeout(400);
  }

  await expect(previous).toHaveCount(0);
  const scrollLeftAtStart = await tablist.evaluate((el) => el.scrollLeft);
  expect(scrollLeftAtStart).toBe(0);
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
