import { expect, test } from '@playwright/test';

test('toggles the panel open/closed on header click', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-expander--basic');

  const header = page.getByRole('button', { name: 'Show advanced options' });
  const panel = page.locator('gnome-expander [data-slot="expander-panel"]');

  await expect(header).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toHaveCSS('grid-template-rows', '0px');

  await header.click();

  await expect(header).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).not.toHaveCSS('grid-template-rows', '0px');
});

test('default-expanded story starts open', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-expander--default-expanded');

  const header = page.getByRole('button', { name: 'Show advanced options' });
  await expect(header).toHaveAttribute('aria-expanded', 'true');
});

test('disabled prevents toggling', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-expander--disabled');

  const header = page.getByRole('button', { name: 'Show advanced options' });
  await expect(header).toBeDisabled();
});
