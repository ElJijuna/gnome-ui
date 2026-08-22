import { expect, test } from '@playwright/test';

// Button's entire focus treatment hangs off `:focus-visible`, a pseudo class
// whose value depends on *how* the element was focused — a heuristic only the
// browser runs. jsdom does not implement it (nor computed box-shadow), so
// Button.test.tsx cannot tell a keyboard focus from a mouse focus, which is
// precisely the distinction the ring is there to make.

test('the focus ring appears on keyboard focus but not on a mouse click', async ({ page }) => {
  await page.goto('/iframe.html?id=components-button--default');

  const button = page.getByRole('button').first();
  const ring = () => button.evaluate((el) => getComputedStyle(el).boxShadow);

  await expect(button).toBeVisible();
  const resting = await ring();

  await page.keyboard.press('Tab');
  await expect(button).toBeFocused();
  await expect.poll(ring).not.toBe(resting);

  // A pointer click focuses the button too, but must not draw the ring. The
  // shadow is transitioned, so poll past the fade rather than sampling a
  // half-interpolated value.
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await button.click();
  await expect(button).toBeFocused();
  await expect.poll(ring).toBe(resting);
});

test('a disabled button takes no click and no focus', async ({ page }) => {
  await page.goto('/iframe.html?id=components-button--disabled');

  const button = page.getByRole('button').first();
  await expect(button).toBeDisabled();

  let clicked = false;
  await page.exposeFunction('__recordClick', () => {
    clicked = true;
  });
  await button.evaluate((el) =>
    el.addEventListener('click', () =>
      (window as unknown as { __recordClick: () => void }).__recordClick(),
    ),
  );

  await button.click({ force: true });
  expect(clicked).toBe(false);

  await page.keyboard.press('Tab');
  await expect(button).not.toBeFocused();
});
