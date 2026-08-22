import { expect, test } from '@playwright/test';

// The interactive RatingStars previews a rating on hover: `onMouseEnter` sets
// a `hovered` star that overrides the committed value until the pointer
// leaves. Hover is a pointer state jsdom does not have, so RatingStars.test.tsx
// can only fire `mouseEnter` at a node it picked itself — never the real
// enter/leave pairing the browser generates as a pointer crosses the group.

test('hovering a star previews that rating without committing it', async ({ page }) => {
  await page.goto('/iframe.html?id=components-ratingstars--interactive');

  const group = page.getByRole('radiogroup');
  const filled = () => group.locator('[data-filled="true"]').count();

  await expect(group.getByRole('radio', { name: '3 stars' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  expect(await filled()).toBe(3);

  await group.getByRole('radio', { name: '5 stars' }).hover();
  await expect.poll(filled).toBe(5);

  // Preview only — the committed value must not have moved.
  await expect(group.getByRole('radio', { name: '3 stars' })).toHaveAttribute(
    'aria-checked',
    'true',
  );

  // Leaving the group restores the committed rating.
  await page.mouse.move(0, 0);
  await expect.poll(filled).toBe(3);
});

test('clicking a star commits the previewed rating', async ({ page }) => {
  await page.goto('/iframe.html?id=components-ratingstars--interactive');

  const group = page.getByRole('radiogroup');
  const two = group.getByRole('radio', { name: '2 stars' });

  await two.click();

  await expect(two).toHaveAttribute('aria-checked', 'true');
  await page.mouse.move(0, 0);
  await expect.poll(() => group.locator('[data-filled="true"]').count()).toBe(2);
});

test('moving across the row previews each star in turn', async ({ page }) => {
  await page.goto('/iframe.html?id=components-ratingstars--interactive');

  const group = page.getByRole('radiogroup');
  const filled = () => group.locator('[data-filled="true"]').count();

  // Walk the pointer over stars 1 → 4 and check the preview tracks it. Each
  // step relies on the browser emitting a leave for the previous star before
  // the enter for the next one.
  for (const star of [1, 2, 4]) {
    await group.getByRole('radio', { name: star === 1 ? '1 star' : `${star} stars` }).hover();
    await expect.poll(filled).toBe(star);
  }
});
