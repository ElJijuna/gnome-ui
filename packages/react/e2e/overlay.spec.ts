import { expect, test } from '@playwright/test';

// Overlay reads the real `prefers-reduced-motion` media query the same way
// Modal does, to skip its 200ms exit animation. Overlay.test.tsx fakes
// `window.matchMedia` — this proves the real one is wired up.

test('closes without waiting for the exit animation when prefers-reduced-motion is on', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/iframe.html?id=components-overlay--basic');

  await page.getByRole('button', { name: 'Open overlay' }).click();
  const panel = page.getByText('Custom panel');
  await expect(panel).toBeVisible();

  // Overlay has no dialog role or Escape handling by design — dismiss by
  // clicking the backdrop itself, away from the centered panel content.
  await page.mouse.click(5, 5);

  // Normal exit takes 200ms — reduced motion must skip that wait entirely.
  await expect(panel).toBeHidden({ timeout: 100 });
});
