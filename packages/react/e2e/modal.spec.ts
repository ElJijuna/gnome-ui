import { expect, test } from '@playwright/test';

// Modal reads the real `prefers-reduced-motion` media query to decide
// whether to wait out its 200ms exit animation (`CLOSE_ANIM_DURATION`)
// before unmounting, or skip straight to the end state. Modal.test.tsx
// fakes `window.matchMedia` via `Object.defineProperty` — this proves the
// real media query is actually wired up, not just the branch around it.

test('closes without waiting for the exit animation when prefers-reduced-motion is on', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/iframe.html?id=components-modal--default');

  await page.getByRole('button', { name: 'Open Modal' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await page.keyboard.press('Escape');
  // Normal exit takes 200ms — reduced motion must skip that wait entirely.
  await expect(dialog).toBeHidden({ timeout: 100 });
});
