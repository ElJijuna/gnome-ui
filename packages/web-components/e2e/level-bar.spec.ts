import { expect, test } from '@playwright/test';

test('level bar exposes meter semantics and paints the continuous fill', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-level-bar--interactive');

  const meter = page.getByRole('meter', { name: 'Disk usage' });
  await expect(meter).toHaveAttribute('aria-valuenow', '0.4');
  await expect(meter).toHaveAttribute('aria-valuemin', '0');
  await expect(meter).toHaveAttribute('aria-valuemax', '1');

  const fillWidth = await meter.evaluate((el) => el.style.getPropertyValue('--gnome-level-value'));
  expect(fillWidth).toBe('40%');
});

test('discrete level bar derives block elements from num-blocks', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-level-bar--discrete');

  const meter = page.getByRole('meter', { name: 'Disk usage' });
  const blocks = meter.locator('[data-slot="level-block"]');
  await expect(blocks).toHaveCount(8);

  const filledCount = await blocks.evaluateAll(
    (elements) => elements.filter((element) => element.hasAttribute('data-filled')).length,
  );
  expect(filledCount).toBe(5);
});
