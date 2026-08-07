import { expect, test } from '@playwright/test';

// `Slider` derives its value from a real `getBoundingClientRect()` on the
// track plus native `setPointerCapture()` during drag (Slider.tsx). Unit
// tests stub the bounding rect and fire synthetic pointer events directly at
// the target, which never exercises real pointer capture — these run an
// actual mouse drag against real Chromium layout instead.

test('sets the value from a real pointer click on the track', async ({ page }) => {
  await page.goto('/iframe.html?id=components-slider--default');

  const slider = page.getByRole('slider', { name: 'Volume' });
  const box = await slider.boundingBox();
  expect(box).not.toBeNull();

  await page.mouse.click(box!.x + box!.width - 2, box!.y + box!.height / 2);

  await expect(slider).toHaveAttribute('aria-valuenow', '100');
});

test('drags the thumb with the mouse, following the pointer even outside the track bounds', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-slider--default');

  const slider = page.getByRole('slider', { name: 'Volume' });
  const box = await slider.boundingBox();
  expect(box).not.toBeNull();

  const midX = box!.x + box!.width / 2;
  const y = box!.y + box!.height / 2;

  await page.mouse.move(box!.x + 2, y);
  await page.mouse.down();
  // Drag well below the track's vertical bounds — the value only keeps
  // tracking the pointer here if `setPointerCapture` is actually honored.
  await page.mouse.move(midX, y + 80, { steps: 5 });
  await page.mouse.up();

  const value = Number(await slider.getAttribute('aria-valuenow'));
  expect(value).toBeGreaterThanOrEqual(45);
  expect(value).toBeLessThanOrEqual(55);
});
