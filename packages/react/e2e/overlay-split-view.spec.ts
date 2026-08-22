import { expect, test } from '@playwright/test';

// OverlaySplitView is breakpoint-driven like NavigationSplitView, but adds two
// document-level behaviours that only exist in overlay mode: a `keydown`
// listener on `document` that closes on Escape, and an effect that moves focus
// into the sidebar when it opens. jsdom has a fixed window width so the
// component never enters overlay mode there at all, which means
// OverlaySplitView.test.tsx cannot reach either behaviour without stubbing the
// breakpoint hook.

const NARROW = { width: 380, height: 720 };
const WIDE = { width: 1024, height: 720 };

test('the sidebar is permanent on a wide viewport and overlaid on a narrow one', async ({
  page,
}) => {
  await page.setViewportSize(WIDE);
  await page.goto('/iframe.html?id=adaptive-overlaysplitview--narrow-viewport');

  const home = page.getByRole('button', { name: 'Home' });
  await expect(home).toBeVisible();
  // No toggle is rendered while the sidebar is permanent.
  await expect(page.getByRole('button', { name: 'Toggle sidebar' })).toHaveCount(0);

  await page.setViewportSize(NARROW);

  const toggle = page.getByRole('button', { name: 'Toggle sidebar' });
  await expect(toggle).toBeVisible();
});

test('Escape closes the overlay sidebar through the document-level listener', async ({ page }) => {
  await page.setViewportSize(NARROW);
  await page.goto('/iframe.html?id=adaptive-overlaysplitview--narrow-viewport');

  const toggle = page.getByRole('button', { name: 'Toggle sidebar' });
  await toggle.click();

  const starred = page.getByRole('button', { name: 'Starred' });
  await expect(starred).toBeVisible();

  // The listener is bound to `document`, so this works from anywhere on the
  // page — including with focus outside the sidebar.
  await page.keyboard.press('Escape');

  await expect(starred).toBeHidden();
});

test('opening the overlay moves focus into the sidebar', async ({ page }) => {
  await page.setViewportSize(NARROW);
  await page.goto('/iframe.html?id=adaptive-overlaysplitview--narrow-viewport');

  await page.getByRole('button', { name: 'Toggle sidebar' }).click();

  await expect
    .poll(() =>
      page.evaluate(() => {
        const active = document.activeElement;
        return !!active && active.tagName === 'BUTTON' && active.textContent?.trim();
      }),
    )
    .toBeTruthy();
});

test('choosing an item closes the overlay and updates the content', async ({ page }) => {
  await page.setViewportSize(NARROW);
  await page.goto('/iframe.html?id=adaptive-overlaysplitview--narrow-viewport');

  await page.getByRole('button', { name: 'Toggle sidebar' }).click();

  const starred = page.getByRole('button', { name: 'Starred' });
  await expect(starred).toBeVisible();
  await starred.click();

  await expect(starred).toBeHidden();
  await expect(page.getByText('Starred').first()).toBeVisible();
});
