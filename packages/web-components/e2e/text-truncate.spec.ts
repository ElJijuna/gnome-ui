import { expect, test } from '@playwright/test';

test('truncated text wraps in a tooltip that reveals the full content on hover', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-text-truncate--single-line');

  const trigger = page.locator('[data-slot="tooltip-trigger"]');
  const tooltipContent = page.locator('[data-slot="tooltip-content"]');

  await expect(trigger).toHaveText(
    'A very long file name that might not fit in the available space.txt',
  );
  await expect(tooltipContent).toHaveCSS('opacity', '0');

  await trigger.hover();

  await expect(tooltipContent).toHaveCSS('opacity', '1');
  await expect(tooltipContent).toHaveText(
    'A very long file name that might not fit in the available space.txt',
  );

  const describedBy = await trigger.getAttribute('aria-describedby');
  const contentId = await tooltipContent.getAttribute('id');
  expect(describedBy).toBe(contentId);
});

test('text that fits is not wrapped in a tooltip', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-text-truncate--fits-without-truncation');

  const content = page.locator('[data-slot="text-truncate-content"]');

  await expect(content).toHaveText('Short name.txt');
  await expect(page.locator('gnome-tooltip')).toHaveCount(0);
});

test('multi-line clamp truncates and reveals a tooltip once past the configured line count', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-text-truncate--multi-line');

  const trigger = page.locator('[data-slot="tooltip-trigger"]');

  await expect(trigger).toHaveCSS('-webkit-line-clamp', '3');
  await expect(trigger).toHaveAttribute('aria-describedby');
});
