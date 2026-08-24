import { expect, test } from '@playwright/test';

// StatusPage is an empty-state whose whole contract is optical: everything
// centred on one axis, a description clamped to 36ch so it wraps into a
// readable block, a dimmed decorative icon, and a `compact` variant that
// rescales type and padding. jsdom measures nothing and resolves no `ch`
// unit, so StatusPage.test.tsx can only assert that the text is present.

test('icon, title, description and actions share one centre line', async ({ page }) => {
  await page.goto('/iframe.html?id=components-statuspage--empty-collection');

  const container = page.locator('div[class*="page"]').first();
  await expect(container).toBeVisible();

  const centres = await container.evaluate((el) => {
    const centreOf = (node: Element) => {
      const rect = node.getBoundingClientRect();
      return rect.left + rect.width / 2;
    };

    return {
      page: centreOf(el),
      parts: Array.from(el.children).map(centreOf),
    };
  });

  expect(centres.parts.length).toBeGreaterThanOrEqual(3);
  for (const part of centres.parts) {
    expect(Math.abs(part - centres.page)).toBeLessThanOrEqual(1);
  }
});

test('the description is clamped so long copy wraps instead of spanning the page', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-statuspage--no-icon');

  const container = page.locator('div[class*="page"]').first();
  const description = page.getByText(/Items moved to Trash/);

  const containerBox = (await container.boundingBox())!;
  const descriptionBox = (await description.boundingBox())!;

  expect(descriptionBox.width).toBeLessThan(containerBox.width);

  // 36ch of body text has to break this sentence over more than one line.
  const lines = await description.evaluate((el) => {
    const style = getComputedStyle(el);
    return el.getBoundingClientRect().height / parseFloat(style.lineHeight);
  });
  expect(lines).toBeGreaterThan(1);
});

test('compact rescales the title and tightens the padding', async ({ page }) => {
  const measure = async (id: string) => {
    await page.goto(`/iframe.html?id=${id}`);

    const container = page.locator('div[class*="page"]').first();
    await expect(container).toBeVisible();

    return container.evaluate((el) => {
      const title = el.querySelector('p') as HTMLElement;

      return {
        padding: parseFloat(getComputedStyle(el).paddingTop),
        titleSize: parseFloat(getComputedStyle(title).fontSize),
      };
    });
  };

  const full = await measure('components-statuspage--no-results');
  const compact = await measure('components-statuspage--compact');

  expect(compact.titleSize).toBeLessThan(full.titleSize);
  expect(compact.padding).toBeLessThan(full.padding);
});

test('the icon is decorative: dimmed and never part of the readable text', async ({ page }) => {
  await page.goto('/iframe.html?id=components-statuspage--no-results');

  const container = page.locator('div[class*="page"]').first();
  const iconWrap = container.locator('div[class*="iconWrap"]');

  await expect(iconWrap).toHaveAttribute('aria-hidden', 'true');
  expect(await iconWrap.evaluate((el) => parseFloat(getComputedStyle(el).opacity))).toBeLessThan(1);

  const readable = await container.evaluate((el) => (el as HTMLElement).innerText.trim());
  expect(readable.startsWith('No Results')).toBe(true);
});

test('the actions row wraps onto a second line when the page gets narrow', async ({ page }) => {
  await page.goto('/iframe.html?id=components-statuspage--error-state');

  const tryAgain = page.getByRole('button', { name: 'Try Again' });
  const report = page.getByRole('button', { name: 'Report Issue' });

  await page.setViewportSize({ width: 1024, height: 720 });
  const wideTop = (await tryAgain.boundingBox())!.y;
  expect((await report.boundingBox())!.y).toBe(wideTop);

  await page.setViewportSize({ width: 320, height: 720 });
  await expect
    .poll(async () => (await report.boundingBox())!.y)
    .toBeGreaterThan((await tryAgain.boundingBox())!.y);
});
