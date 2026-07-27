import { expect, test } from '@playwright/test';

test('popover follows resized content and restores trigger focus', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-popover--interactive');

  const trigger = page.getByRole('button', { name: 'Project options' });
  const content = page.locator('[data-slot="popover-content"]');
  await trigger.click();

  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('button', { name: 'Rename' })).toBeFocused();
  const initialLeft = await content.evaluate((element) => element.style.left);

  await content.evaluate((element) => {
    element.style.width = '320px';
  });

  await expect
    .poll(() => content.evaluate((element) => element.style.left))
    .not.toBe(initialLeft);

  await page.keyboard.press('Escape');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
});
