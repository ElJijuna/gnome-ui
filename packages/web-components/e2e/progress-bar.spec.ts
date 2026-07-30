import { expect, test } from '@playwright/test';

test('determinate progress bar exposes aria-value* and paints the fill width', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-progress-bar--interactive');

  const bar = page.getByRole('progressbar', { name: 'Download progress' });
  await expect(bar).toHaveAttribute('aria-valuenow', '60');
  await expect(bar).toHaveAttribute('aria-valuemin', '0');
  await expect(bar).toHaveAttribute('aria-valuemax', '100');

  const fillWidth = await bar.evaluate((el) => el.style.getPropertyValue('--gnome-progress-value'));
  expect(fillWidth).toBe('60%');
});

test('indeterminate progress bar omits aria-value* and pulses', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-progress-bar--indeterminate');

  const bar = page.getByRole('progressbar', { name: 'Download progress' });
  await expect(bar).not.toHaveAttribute('aria-valuenow');
  await expect(bar).toHaveAttribute('data-indeterminate', '');

  const animationName = await bar.evaluate(
    (el) => getComputedStyle(el, '::after').animationName,
  );
  expect(animationName).toBe('gnome-progress-bar-pulse');
});
