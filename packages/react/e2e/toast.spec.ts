import { expect, test } from '@playwright/test';

// Toast.tsx tracks remaining time across pause/resume with real `setTimeout`
// (Toast.test.tsx uses `vi.useFakeTimers` and synthetic `mouseEnter`/
// `mouseLeave` instead) — these wait on real wall-clock time and a real
// mouse hover to verify the pause/resume math holds up outside a mocked
// clock, which is exactly where off-by-one timer bugs tend to hide.

test('pauses the auto-dismiss timer on real hover and resumes it after', async ({ page }) => {
  await page.goto('/iframe.html?id=components-toast--default');
  await page.getByRole('button', { name: 'Show toast' }).click();

  const toast = page.getByRole('status').filter({ hasText: 'File saved successfully' });
  await expect(toast).toBeVisible();

  await toast.hover();
  // Stay hovered past the default 3s duration — it must not dismiss.
  await page.waitForTimeout(3500);
  await expect(toast).toBeVisible();

  // Move away and let the remaining time elapse for real.
  await page.mouse.move(0, 0);
  await expect(toast).toBeHidden({ timeout: 4000 });
});

test('auto-dismisses after the default duration when never hovered', async ({ page }) => {
  await page.goto('/iframe.html?id=components-toast--default');
  await page.getByRole('button', { name: 'Show toast' }).click();

  const toast = page.getByRole('status').filter({ hasText: 'File saved successfully' });
  await expect(toast).toBeVisible();
  await expect(toast).toBeHidden({ timeout: 4000 });
});
