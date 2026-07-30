import { expect, test } from '@playwright/test';

test('banner exposes role=status/aria-live=polite and the info variant by default', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-banner--default');

  const banner = page.locator('gnome-banner');
  await expect(banner).toHaveAttribute('role', 'status');
  await expect(banner).toHaveAttribute('aria-live', 'polite');
  await expect(banner).toBeVisible();
});

test('clicking the action button emits gnome-action without dismissing the banner', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-banner--with-action');

  const banner = page.locator('gnome-banner');
  const events: string[] = [];
  await page.exposeFunction('recordAction', (action: string) => events.push(action));
  await banner.evaluate((el) => {
    el.addEventListener('gnome-action', (event) => {
      (window as unknown as { recordAction: (action: string) => void }).recordAction(
        (event as CustomEvent<{ action: string }>).detail.action,
      );
    });
  });

  await page.locator('[data-action]').click();

  await expect.poll(() => events).toEqual(['primary']);
  await expect(banner).toBeVisible();
});

test('clicking the dismiss button hides the banner and fires gnome-dismiss', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-banner--dismissible');

  const banner = page.locator('gnome-banner');
  await expect(banner).toBeVisible();

  await page.locator('[data-dismiss]').click();

  await expect(banner).toBeHidden();
  await expect(banner).toHaveJSProperty('hidden', true);
});
