import { expect, test } from '@playwright/test';

// PreferencesPage is nothing but layout: `flex: 1; min-height: 0;
// overflow-y: auto` on the scroller and an AdwClamp-style 468px centred
// column inside it. Every one of those is a computed-layout fact that jsdom
// cannot produce, so PreferencesPage.test.tsx can only assert the role and
// that children render.

test('the page scrolls its own content instead of growing the document', async ({ page }) => {
  await page.goto('/iframe.html?id=components-preferencespage--multiple-groups');

  const scroller = page.getByRole('tabpanel');
  await expect(scroller).toBeVisible();

  const overflow = await scroller.evaluate((el) => ({
    scrollable: el.scrollHeight > el.clientHeight,
    // `min-height: 0` is what stops a flex child from being sized by its
    // content: without it the page grows and the document scrolls instead.
    fitsInParent: el.clientHeight <= (el.parentElement as HTMLElement).clientHeight,
  }));
  expect(overflow.scrollable).toBe(true);
  expect(overflow.fitsInParent).toBe(true);

  const firstGroupTop = async () =>
    (await page.getByText('Network', { exact: true }).boundingBox())!.y;

  const before = await firstGroupTop();
  await scroller.evaluate((el) => el.scrollTo(0, 200));
  await expect.poll(async () => await firstGroupTop()).toBeLessThan(before);

  const documentScrolled = await page.evaluate(() => {
    const root = document.scrollingElement as HTMLElement;
    return root.scrollHeight > root.clientHeight;
  });
  expect(documentScrolled).toBe(false);
});

test('the content column is clamped and centred inside the page', async ({ page }) => {
  await page.goto('/iframe.html?id=components-preferencespage--default');

  const scroller = page.getByRole('tabpanel');
  const inner = scroller.locator('> div');

  const pageBox = (await scroller.boundingBox())!;
  const innerBox = (await inner.boundingBox())!;

  expect(innerBox.width).toBeLessThanOrEqual(468);
  expect(innerBox.width).toBeLessThan(pageBox.width);

  const leftGap = innerBox.x - pageBox.x;
  const rightGap = pageBox.x + pageBox.width - (innerBox.x + innerBox.width);
  expect(Math.abs(leftGap - rightGap)).toBeLessThanOrEqual(1);
});

test('consecutive groups are separated by an even gap', async ({ page }) => {
  await page.goto('/iframe.html?id=components-preferencespage--multiple-groups');

  const groups = page.getByRole('tabpanel').locator('> div > div');
  await expect(groups).toHaveCount(3);

  const boxes = await groups.evaluateAll((els) =>
    els.map((el) => {
      const rect = el.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    }),
  );

  const gaps = boxes.slice(1).map((box, i) => box.top - boxes[i].bottom);
  for (const gap of gaps) {
    expect(gap).toBeGreaterThan(0);
    expect(Math.abs(gap - gaps[0])).toBeLessThanOrEqual(1);
  }
});

test('the rows inside a group stretch to the clamped column width', async ({ page }) => {
  await page.goto('/iframe.html?id=components-preferencespage--default');

  const inner = page.getByRole('tabpanel').locator('> div');
  const list = page.getByRole('list').first();

  const contentWidth = await inner.evaluate((el) => {
    const style = getComputedStyle(el);
    return el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  });
  const listBox = (await list.boundingBox())!;

  expect(listBox.width).toBeGreaterThan(0);
  expect(Math.abs(listBox.width - contentWidth)).toBeLessThanOrEqual(1);
});
