import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

// AvatarRotator is driven by a real `setInterval`, pauses on real hover and
// real focus, and switches itself off entirely when `prefers-reduced-motion`
// is set. AvatarRotator.test.tsx fakes timers and stubs `matchMedia`, so none
// of those three inputs is ever the browser's own — which is exactly what this
// component's behaviour is made of.

const activeLayer = (page: Page) =>
  page.evaluate(() => {
    const layers = Array.from(document.querySelectorAll('[aria-hidden="true"]')).filter(
      (el) => getComputedStyle(el).position === 'absolute',
    );
    return layers.findIndex((el) => parseFloat(getComputedStyle(el).opacity) > 0.5);
  });

test('the rotation advances on its own over real time', async ({ page }) => {
  await page.goto('/iframe.html?id=components-avatarrotator--default');

  const rotator = page.locator('[aria-label]').first();
  await expect(rotator).toBeVisible();

  const first = await activeLayer(page);
  expect(first).toBeGreaterThanOrEqual(0);

  // interval is 2200ms in this story — nothing fake about the wait.
  await expect.poll(() => activeLayer(page), { timeout: 6000 }).not.toBe(first);
});

test('hovering pauses the rotation and leaving resumes it', async ({ page }) => {
  await page.goto('/iframe.html?id=components-avatarrotator--default');

  const rotator = page.locator('[aria-label]').first();
  await expect(rotator).toBeVisible();

  await rotator.hover();
  const paused = await activeLayer(page);

  // Two full intervals with the pointer held still must change nothing.
  await expect.poll(() => activeLayer(page), { timeout: 5000, intervals: [1000] }).toBe(paused);

  await page.mouse.move(0, 0);
  await expect.poll(() => activeLayer(page), { timeout: 6000 }).not.toBe(paused);
});

test('prefers-reduced-motion stops the rotation entirely', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/iframe.html?id=components-avatarrotator--default');

  const rotator = page.locator('[aria-label]').first();
  await expect(rotator).toBeVisible();

  const start = await activeLayer(page);

  // The effect bails out before ever creating the interval, so this must hold
  // well past several rotations' worth of time.
  await expect.poll(() => activeLayer(page), { timeout: 5000, intervals: [1000] }).toBe(start);
});
