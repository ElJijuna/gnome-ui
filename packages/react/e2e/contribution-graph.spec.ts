import { expect, test } from '@playwright/test';

// ContributionGraph measures its container with a real `ResizeObserver` and
// exposes the result as `data-cell-size`/`data-visible-weeks` on the SVG.
// ContributionGraph.test.tsx replaces the global with a hand-rolled
// `ResizeObserverMock` (jsdom has no real one) and manually triggers it —
// this resizes a real container and lets a real ResizeObserver report back.

test('recomputes visible weeks on a real container resize', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('/iframe.html?id=data-display-contributiongraph--default');

  const svg = page.getByRole('img', { name: 'Contribution graph' });
  await expect(svg).toHaveAttribute('data-visible-weeks', '52');

  await page.setViewportSize({ width: 400, height: 800 });

  await expect.poll(() => svg.getAttribute('data-visible-weeks')).not.toBe('52');
});
