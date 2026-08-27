import { expect, test } from '@playwright/test';

// Carousel drives navigation through a real `el.scrollTo()` on its track and
// reads the page back from real `el.scrollLeft` on scroll. Carousel.test.tsx
// stubs `Element.prototype.scrollTo = vi.fn()` entirely — its own comment
// notes "scrollLeft is still 0 in jsdom" — so the actual scroll round-trip
// (click → real scroll → real scroll event → page state syncs back) has
// never run.

test('clicking a page tab really scrolls the track and updates the selected tab', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-carousel--with-dots');

  const track = page.getByRole('region');
  const page1Tab = page.getByRole('tab', { name: 'Page 1' });
  const page2Tab = page.getByRole('tab', { name: 'Page 2' });

  await expect(page1Tab).toHaveAttribute('aria-selected', 'true');

  await page2Tab.click();

  await expect(page2Tab).toHaveAttribute('aria-selected', 'true');
  await expect(page1Tab).toHaveAttribute('aria-selected', 'false');

  await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
});

test('dragging the track with the pointer changes the page', async ({ page }) => {
  await page.goto('/iframe.html?id=components-carousel--with-dots');

  const track = page.getByRole('region');
  const box = await track.boundingBox();
  expect(box).not.toBeNull();

  const y = box!.y + box!.height / 2;

  await page.mouse.move(box!.x + box!.width - 20, y);
  await page.mouse.down();
  await page.mouse.move(box!.x + 20, y, { steps: 10 });
  await page.mouse.up();

  await expect(page.getByRole('tab', { name: 'Page 2' })).toHaveAttribute('aria-selected', 'true');
});

test('arrow buttons page the track and disable at the ends', async ({ page }) => {
  await page.goto('/iframe.html?id=components-carousel--with-arrows');

  const track = page.getByRole('region');
  const prev = page.getByRole('button', { name: 'Previous slide' });
  const next = page.getByRole('button', { name: 'Next slide' });

  await expect(prev).toBeDisabled();
  await expect(next).toBeEnabled();

  await next.click();

  await expect(page.getByRole('tab', { name: 'Page 2' })).toHaveAttribute('aria-selected', 'true');
  await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  await expect(prev).toBeEnabled();

  await prev.click();

  await expect(page.getByRole('tab', { name: 'Page 1' })).toHaveAttribute('aria-selected', 'true');
  await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBe(0);
  await expect(prev).toBeDisabled();
});

test('arrows advance a whole group when several slides are visible', async ({ page }) => {
  await page.goto('/iframe.html?id=components-carousel--multiple-visible-slides');

  // 5 slides in groups of 2 → 3 pages.
  await expect(page.getByRole('tab')).toHaveCount(3);

  await page.getByRole('button', { name: 'Next slide' }).click();

  await expect(page.getByRole('tab', { name: 'Page 2' })).toHaveAttribute('aria-selected', 'true');
  // Third slide is now the leading one in the viewport.
  await expect(page.getByRole('group', { name: '3 of 5' })).toBeInViewport();
});
