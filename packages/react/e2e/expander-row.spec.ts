import { expect, test } from '@playwright/test';

// ExpanderRow uses the same `grid-template-rows: 0fr → 1fr` clip as Expander,
// but nests real rows inside the panel. jsdom has no layout, so
// ExpanderRow.test.tsx can only check `aria-expanded` and class names — it
// cannot see whether the nested rows are actually clipped away, nor whether
// they stay reachable by keyboard while the row is closed.

test('the nested rows are clipped to nothing when closed and laid out when opened', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-expanderrow--default');

  const header = page.getByRole('button').first();
  const panel = page.getByRole('region');

  await expect(header).toHaveAttribute('aria-expanded', 'false');
  expect((await panel.boundingBox())!.height).toBe(0);

  await header.click();

  await expect(header).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(async () => (await panel.boundingBox())!.height).toBeGreaterThan(20);
});

test('two expander rows open and close independently', async ({ page }) => {
  await page.goto('/iframe.html?id=components-expanderrow--multiple-expanders');

  // The story renders other buttons alongside the expanders, so anchor on the
  // toggle contract itself rather than on button order.
  const headers = page.locator('button[aria-expanded]');
  const first = headers.nth(0);
  const second = headers.nth(1);

  await first.click();
  await expect(first).toHaveAttribute('aria-expanded', 'true');
  await expect(second).toHaveAttribute('aria-expanded', 'false');

  await second.click();
  await expect(first).toHaveAttribute('aria-expanded', 'true');
  await expect(second).toHaveAttribute('aria-expanded', 'true');

  await expect
    .poll(async () => (await page.getByRole('region').nth(0).boundingBox())!.height)
    .toBeGreaterThan(20);
});

// KNOWN BUG — same clipping flaw as Expander: the closed panel is only
// `overflow: hidden`, never `hidden`/`inert`, so the rows inside it keep their
// place in the tab order at zero height.
test.fail('rows inside a closed expander are out of the tab order', async ({ page }) => {
  await page.goto('/iframe.html?id=components-expanderrow--default');

  const header = page.getByRole('button').first();
  await expect(header).toHaveAttribute('aria-expanded', 'false');

  await header.focus();
  await page.keyboard.press('Tab');

  const focusedInsidePanel = await page.evaluate(() => {
    const panel = document.querySelector('[role=region]');
    return !!panel && panel.contains(document.activeElement);
  });
  expect(focusedInsidePanel).toBe(false);
});
