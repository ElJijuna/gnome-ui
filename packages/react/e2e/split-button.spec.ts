import { expect, test } from '@playwright/test';

// SplitButton right-aligns its dropdown panel to the toggle button using
// real `getBoundingClientRect()` on both, then clamps the result to stay
// inside the viewport. There's no unit test for this positioning math at
// all — real layout is required to prove the clamp actually engages rather
// than just computing a coordinate that happens to look right.

test('clamps the dropdown panel within the viewport when it would overflow the left edge', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-splitbutton--default');

  await page.getByRole('button', { name: 'More options' }).click();

  const panel = page.getByRole('dialog', { name: 'More options' });
  await expect(panel).toBeVisible();

  const box = await panel.boundingBox();
  expect(box).not.toBeNull();
  // The button sits close to the story's left edge, so naive right-alignment
  // (trigger.right - panel.width) would go negative — proves the clamp fired.
  expect(box!.x).toBeGreaterThanOrEqual(8);
  expect(box!.x).toBeLessThan(20);
});
