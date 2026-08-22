import { expect, test } from '@playwright/test';

// SegmentedBar sizes each segment with a percentage width and dims the rest on
// hover, with a Tooltip per segment. Percentages only become real pixels once
// something lays the bar out, and hover is a pointer state jsdom has no model
// for — so SegmentedBar.test.tsx can assert the style string but never that
// the bar renders proportionally or reacts to a pointer.

test('the rendered segment widths are proportional to the values', async ({ page }) => {
  await page.goto('/iframe.html?id=components-segmentedbar--default');

  const track = page.getByRole('img').first();
  await expect(track).toBeVisible();

  const widths = await track.evaluate((el) =>
    Array.from(el.children).map((child) => child.getBoundingClientRect().width),
  );

  expect(widths).toHaveLength(5);

  // Normalise against the painted total rather than the track box: the track
  // puts gaps between segments, so the two are not the same number.
  const painted = widths.reduce((sum, w) => sum + w, 0);

  // TypeScript 58.4 / JavaScript 22.1 / CSS 12.3 / HTML 5.8 / Shell 1.4
  const expected = [58.4, 22.1, 12.3, 5.8, 1.4];
  widths.forEach((width, i) => {
    expect(width / painted).toBeCloseTo(expected[i] / 100, 2);
  });

  // Widths are strictly descending here, which a percentage string alone
  // cannot guarantee once rounding and flex sizing get involved.
  for (let i = 1; i < widths.length; i += 1) {
    expect(widths[i]).toBeLessThan(widths[i - 1]);
  }
});

test('hovering a segment dims the others and shows its tooltip', async ({ page }) => {
  await page.goto('/iframe.html?id=components-segmentedbar--default');

  const track = page.getByRole('img').first();
  const segments = track.locator('> *');
  const opacities = () =>
    track.evaluate((el) => Array.from(el.children).map((child) => getComputedStyle(child).opacity));

  const resting = await opacities();
  expect(new Set(resting).size).toBe(1);

  await segments.first().hover();

  await expect.poll(async () => new Set(await opacities()).size).toBeGreaterThan(1);
  await expect(page.getByRole('tooltip')).toHaveText('TypeScript: 58.4%', { timeout: 2000 });

  await page.mouse.move(0, 0);
  await expect.poll(async () => new Set(await opacities()).size).toBe(1);
});

test('the bar exposes the whole breakdown as one accessible label', async ({ page }) => {
  await page.goto('/iframe.html?id=components-segmentedbar--default');

  const track = page.getByRole('img').first();
  const label = await track.getAttribute('aria-label');

  expect(label).toContain('TypeScript 58.4%');
  expect(label).toContain('Shell 1.4%');
});
