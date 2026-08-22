import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

// NavigationSplitView is driven entirely by `useBreakpoint`, which reads
// `window.innerWidth` and re-renders on the window's own `resize` event. jsdom
// has a fixed 1024px window and fires no resize of its own, so
// NavigationSplitView.test.tsx has to stub the hook — meaning the collapse
// behaviour, the aria-hidden bookkeeping, and the side-by-side layout are only
// ever checked against a fake.

test('a wide viewport shows both panes side by side', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 720 });
  await page.goto('/iframe.html?id=adaptive-navigationsplitview--narrow-viewport');

  const sidebarItem = page.getByRole('button', { name: 'Starred' });
  const detail = page.getByText('Tap an item in the sidebar list');

  await expect(sidebarItem).toBeVisible();
  await expect(detail).toBeVisible();

  // Side by side means the detail pane starts to the right of the sidebar.
  const sidebarBox = (await sidebarItem.boundingBox())!;
  const detailBox = (await detail.boundingBox())!;
  expect(detailBox.x).toBeGreaterThan(sidebarBox.x + sidebarBox.width);
});

// In collapsed mode the two panes are stacked absolutely and slid in and out
// with `transform: translateX(±100%)` — "hidden" means "translated outside the
// container", never `display: none`. Comparing each pane's rect to its
// parent's is the only way to observe that, and it needs real layout.
// The panes slide with a CSS transition; read geometry only once the browser
// says nothing is animating any more.
const settle = (page: Page) =>
  page.waitForFunction(() =>
    document.getAnimations().every((animation) => animation.playState !== 'running'),
  );

const collapsedPanes = (page: Page) =>
  page.evaluate(() => {
    const panes = Array.from(
      document.querySelectorAll<HTMLElement>('[aria-hidden="true"], [aria-hidden="false"]'),
    ).filter((el) => getComputedStyle(el).position === 'absolute');

    return panes.map((pane) => {
      const parent = pane.parentElement!.getBoundingClientRect();
      const rect = pane.getBoundingClientRect();
      return {
        ariaHidden: pane.getAttribute('aria-hidden'),
        onScreen: rect.left >= parent.left - 1 && rect.right <= parent.right + 1,
      };
    });
  });

test('crossing the 400px breakpoint collapses it to a single pane', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 720 });
  await page.goto('/iframe.html?id=adaptive-navigationsplitview--narrow-viewport');

  await expect(page.getByText('Tap an item in the sidebar list')).toBeVisible();
  // Wide mode lays the panes out in flow, so none of them is absolute.
  expect(await collapsedPanes(page)).toHaveLength(0);

  // isNarrow flips at <= 400px, and only a real resize event delivers that.
  await page.setViewportSize({ width: 380, height: 720 });

  await expect.poll(async () => (await collapsedPanes(page)).length).toBe(2);
  await settle(page);
  expect((await collapsedPanes(page)).filter((p) => p.onScreen)).toHaveLength(1);
  expect((await collapsedPanes(page)).find((p) => p.onScreen)!.ariaHidden).toBe('false');

  await page.setViewportSize({ width: 1024, height: 720 });
  await expect.poll(async () => (await collapsedPanes(page)).length).toBe(0);
});

test('drilling in and going back swaps which pane is on screen', async ({ page }) => {
  await page.setViewportSize({ width: 380, height: 720 });
  await page.goto('/iframe.html?id=adaptive-navigationsplitview--narrow-viewport');

  const starred = page.getByRole('button', { name: 'Starred' });
  await expect(starred).toBeVisible();

  // The sidebar is the first of the two stacked panes in DOM order.
  const sidebarHidden = () =>
    page.evaluate(() => {
      const panes = Array.from(
        document.querySelectorAll<HTMLElement>('[aria-hidden="true"], [aria-hidden="false"]'),
      ).filter((el) => getComputedStyle(el).position === 'absolute');
      return panes[0]?.getAttribute('aria-hidden');
    });

  expect(await sidebarHidden()).toBe('false');

  await starred.click();
  await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();

  // Sidebar slid out, detail slid in — one pane on screen either way.
  await expect.poll(sidebarHidden, { timeout: 10_000 }).toBe('true');
  await settle(page);
  expect((await collapsedPanes(page)).filter((p) => p.onScreen)).toHaveLength(1);
  expect((await collapsedPanes(page)).find((p) => p.onScreen)!.ariaHidden).toBe('false');

  await page.getByRole('button', { name: 'Back' }).click();
  await expect.poll(sidebarHidden, { timeout: 10_000 }).toBe('false');
  await settle(page);
  expect((await collapsedPanes(page)).filter((p) => p.onScreen)).toHaveLength(1);
});

// The slid-out pane keeps its `display`, so `inert` is what takes it out of
// the tab order — `aria-hidden` alone would hide it from screen readers while
// leaving a keyboard user free to tab into a pane they cannot see.
test('the slid-out sidebar is out of the tab order', async ({ page }) => {
  await page.setViewportSize({ width: 380, height: 720 });
  await page.goto('/iframe.html?id=adaptive-navigationsplitview--narrow-viewport');

  await page.getByRole('button', { name: 'Starred' }).click();
  await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();

  // `inert` leaves tabIndex untouched, so the only way to observe it is to try
  // to take focus and watch the browser refuse.
  const focusable = await page.evaluate(() => {
    const hiddenPane = document.querySelector('[aria-hidden="true"]');
    const button = hiddenPane?.querySelector('button');

    if (!button) {
      return null;
    }

    button.focus();

    return document.activeElement === button;
  });

  expect(focusable).toBe(false);
});

test('the hidden pane is hidden from assistive technology too', async ({ page }) => {
  await page.setViewportSize({ width: 380, height: 720 });
  await page.goto('/iframe.html?id=adaptive-navigationsplitview--narrow-viewport');

  await expect(page.getByRole('button', { name: 'Starred' })).toBeVisible();

  const hidden = page.locator('[aria-hidden="true"]');
  await expect(hidden.filter({ hasText: 'Tap an item in the sidebar list' })).toHaveCount(1);
});
