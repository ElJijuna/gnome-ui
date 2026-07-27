import { expect, test } from '@playwright/test';

test('toast remains paused until pointer and focus both leave', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-toast--interactive');

  const toast = page.locator('gnome-toast');
  const action = page.getByRole('button', { name: 'Undo' });
  await toast.hover();
  await action.focus();
  await toast.evaluate((element) => {
    (element as HTMLElement & { duration: number }).duration = 250;
  });

  await page.getByRole('button', { name: 'Show notification' }).hover();
  await page.waitForTimeout(350);
  await expect(toast).toBeVisible();

  await page.getByRole('button', { name: 'Show notification' }).focus();
  await expect(toast).toBeHidden({ timeout: 1_000 });
  await expect(page.locator('.wc-story__event')).toHaveText('Toast dismissed: timeout.');
});
