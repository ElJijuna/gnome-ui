import { expect, test } from '@playwright/test';

// RangeSlider derives values from a real `getBoundingClientRect()` on the
// track and real `setPointerCapture()` per thumb — same category of gap as
// Slider (RangeSlider.test.tsx also stubs the bounding rect and fires
// synthetic pointer events), but with a second, RangeSlider-only behavior
// unit tests don't cover well either: clicking the bare track must jump
// whichever thumb is *nearest* the click, computed from real geometry.

test('clicking near the track edge jumps the nearer (upper) thumb, not the lower one', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-rangeslider--default');

  const minThumb = page.getByRole('slider', { name: 'Minimum value' });
  const maxThumb = page.getByRole('slider', { name: 'Maximum value' });
  const track = minThumb.locator('xpath=..');

  const box = await track.boundingBox();
  expect(box).not.toBeNull();

  await page.mouse.click(box!.x + box!.width * 0.98, box!.y + box!.height / 2);

  await expect(maxThumb).toHaveAttribute('aria-valuenow', '98');
  await expect(minThumb).toHaveAttribute('aria-valuenow', '20');
});

test('dragging the lower thumb past the upper thumb clamps instead of crossing', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-rangeslider--default');

  const minThumb = page.getByRole('slider', { name: 'Minimum value' });
  const maxThumb = page.getByRole('slider', { name: 'Maximum value' });
  const track = minThumb.locator('xpath=..');

  const trackBox = await track.boundingBox();
  const minBox = await minThumb.boundingBox();
  expect(trackBox).not.toBeNull();
  expect(minBox).not.toBeNull();

  await page.mouse.move(minBox!.x + minBox!.width / 2, minBox!.y + minBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(trackBox!.x + trackBox!.width, trackBox!.y + trackBox!.height / 2, {
    steps: 5,
  });
  await page.mouse.up();

  await expect(minThumb).toHaveAttribute('aria-valuenow', '80');
  await expect(maxThumb).toHaveAttribute('aria-valuenow', '80');
});
