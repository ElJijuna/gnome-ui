import { expect, test } from '@playwright/test';

// The `Default` story sets `playing` to `true` — these tests verify the real
// browser `prefers-reduced-motion` media query overrides that, which jsdom
// can't exercise (unit tests mock `matchMedia` instead of the real thing).

test('pauses the animation when prefers-reduced-motion is on, even though playing=true', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/iframe.html?id=components-animatedicon--default');

  await expect(page.locator('.gicon-syncing__spin')).toHaveCSS('animation-play-state', 'paused');
});

test('plays the animation when motion is allowed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/iframe.html?id=components-animatedicon--default');

  await expect(page.locator('.gicon-syncing__spin')).toHaveCSS('animation-play-state', 'running');
});
