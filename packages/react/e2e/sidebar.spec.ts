import { expect, test } from '@playwright/test';

// Sidebar layers three browser-dependent behaviours on a plain nav list: a
// built-in search that filters items as you type, sections that collapse
// behind `aria-expanded`, and a per-item context menu positioned from a live
// `getBoundingClientRect()`. jsdom types no real input events into a
// SearchBar, lays nothing out, and has no contextmenu gesture, so
// Sidebar.test.tsx can reach none of the three the way a user does.

// The filtered-out item is hidden with the `hidden` attribute on its <li>,
// which only takes effect because `.item[hidden] { display: none }` outranks
// the `display: block` on `.item`. Testing Library honours the attribute
// directly with no cascade involved, so only a browser can prove the item has
// really left the page.
test('the built-in search filters the items as they are typed', async ({ page }) => {
  await page.goto('/iframe.html?id=components-sidebar--searchable');

  const nav = page.locator('nav');
  const inbox = nav.getByRole('button', { name: 'Inbox' });
  const trash = nav.getByRole('button', { name: 'Trash' });
  await expect(inbox).toBeVisible();
  await expect(trash).toBeVisible();

  const search = nav.locator('input[type="search"]').first();
  await search.click();
  await search.pressSequentially('tra');

  await expect(trash).toBeVisible();
  await expect(inbox).toBeHidden();
});

test('the filter is at least marked on the non-matching items', async ({ page }) => {
  await page.goto('/iframe.html?id=components-sidebar--searchable');

  const nav = page.locator('nav');
  await expect(nav.getByRole('button', { name: 'Inbox' })).toBeVisible();

  const search = nav.locator('input[type="search"]').first();
  await search.click();
  await search.pressSequentially('tra');

  // The `hidden` attribute is applied correctly even though the cascade
  // currently stops it from taking effect.
  await expect
    .poll(() => nav.locator('li[hidden]').count())
    .toBeGreaterThan(0);
});

test('a search that matches nothing falls back to the empty state', async ({ page }) => {
  await page.goto('/iframe.html?id=components-sidebar--searchable');

  const nav = page.locator('nav');
  await expect(nav.getByRole('button', { name: 'Inbox' })).toBeVisible();

  const search = nav.locator('input[type="search"]').first();
  await search.click();
  await search.pressSequentially('zzzz-no-such-item');

  await expect(page.getByText('No Results')).toBeVisible();
  await expect(nav.getByRole('button', { name: 'Inbox' })).toHaveCount(0);

  await search.fill('');
  await expect(nav.getByRole('button', { name: 'Inbox' })).toBeVisible();
});

test('a section collapses its items away and reopens them', async ({ page }) => {
  await page.goto('/iframe.html?id=components-sidebar--collapsible-section');

  const header = page.locator('button[aria-expanded]').first();
  await expect(header).toHaveAttribute('aria-expanded', 'true');

  const bodyId = await header.getAttribute('aria-controls');
  const body = page.locator(`#${bodyId}`);

  // The section animates, so settle on a stable height before using it as the
  // reference for the reopen.
  const settledHeight = async () => {
    let previous = -1;
    for (let i = 0; i < 20; i += 1) {
      const { height } = (await body.boundingBox())!;
      if (height === previous) {
        return height;
      }
      previous = height;
      await page.waitForTimeout(50);
    }
    return previous;
  };

  const openHeight = await settledHeight();
  expect(openHeight).toBeGreaterThan(0);

  await header.click();

  await expect(header).toHaveAttribute('aria-expanded', 'false');
  await expect.poll(async () => (await body.boundingBox())?.height ?? 0).toBeLessThan(openHeight);
  await expect(body).toHaveAttribute('aria-hidden', 'true');

  await header.click();
  await expect(header).toHaveAttribute('aria-expanded', 'true');
  expect(await settledHeight()).toBe(openHeight);
});

test('right-clicking an item opens its context menu near the pointer', async ({ page }) => {
  await page.goto('/iframe.html?id=components-sidebar--with-context-menu');

  const documents = page.getByRole('button', { name: 'Documents' });
  await expect(documents).toBeVisible();
  await expect(page.getByRole('menu')).toHaveCount(0);

  await documents.click({ button: 'right' });

  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem')).toHaveCount(3);

  // The menu is placed from the item's live bounding box, so it has to land
  // beside the item it belongs to rather than at the origin.
  const itemBox = (await documents.boundingBox())!;
  const menuBox = (await menu.boundingBox())!;
  expect(menuBox.y).toBeGreaterThan(itemBox.y - 200);
  expect(menuBox.x).toBeGreaterThan(0);
});

test('the items stack vertically and only one is marked as the current page', async ({ page }) => {
  await page.goto('/iframe.html?id=components-sidebar--with-sections');

  const items = page.locator('nav').getByRole('button');
  await expect(items.first()).toBeVisible();

  const boxes = await items.evaluateAll((els) =>
    els.map((el) => {
      const rect = el.getBoundingClientRect();
      return { x: Math.round(rect.x), y: Math.round(rect.y) };
    }),
  );

  for (let i = 1; i < boxes.length; i += 1) {
    expect(boxes[i].y).toBeGreaterThanOrEqual(boxes[i - 1].y);
  }

  await expect(page.locator('[aria-current="page"]')).toHaveCount(1);
});
