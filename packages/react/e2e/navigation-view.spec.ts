import { expect, test } from '@playwright/test';

// NavigationView keeps a page stack and renders only the current page, adding
// a directional enter animation that differs for a push and a pop. Which page
// is mounted is state, but the animation direction, the stack's real depth
// behaviour, and the fact that the outgoing page is gone from the layout are
// things only a browser actually performs — NavigationView.test.tsx runs
// against jsdom, where no page is ever laid out or animated.

test('pushing a page replaces the current one and offers a way back', async ({ page }) => {
  await page.goto('/iframe.html?id=components-navigationview--default');

  await expect(page.getByText('Select an item to navigate to its detail page.')).toBeVisible();
  await expect(page.getByRole('button', { name: '← Go back' })).toHaveCount(0);

  // The story's rows are plain ActionRows (no `interactive`), so they render
  // as divs and have to be reached by their text rather than by role.
  await page.getByText('Inbox', { exact: true }).click();

  await expect(page.getByText('Viewing Inbox.')).toBeVisible();
  // The home page is unmounted, not merely hidden behind the new one.
  await expect(page.getByText('Select an item to navigate to its detail page.')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '← Go back' })).toBeVisible();
});

test('popping returns to the previous page and drops the back affordance', async ({ page }) => {
  await page.goto('/iframe.html?id=components-navigationview--default');

  await page.getByText('Sent', { exact: true }).click();
  await expect(page.getByText('Viewing Sent.')).toBeVisible();

  await page.getByRole('button', { name: '← Go back' }).click();

  await expect(page.getByText('Select an item to navigate to its detail page.')).toBeVisible();
  await expect(page.getByRole('button', { name: '← Go back' })).toHaveCount(0);
});

test('a push and a pop animate in opposite directions', async ({ page }) => {
  await page.goto('/iframe.html?id=components-navigationview--default');

  const pageTransform = () =>
    page.evaluate(() => {
      const el = document.querySelector<HTMLElement>('[class*="page"]');
      return el ? getComputedStyle(el).animationName : null;
    });

  await page.getByText('Drafts', { exact: true }).click();
  await expect(page.getByText('Viewing Drafts.')).toBeVisible();
  const forward = await pageTransform();

  await page.getByRole('button', { name: '← Go back' }).click();
  await expect(page.getByText('Select an item to navigate to its detail page.')).toBeVisible();
  const back = await pageTransform();

  // `enterForward` and `enterBack` are two different keyframe animations; if
  // the direction were not tracked they would resolve to the same name.
  expect(forward).not.toBeNull();
  expect(back).not.toBe(forward);
});

test('only one page occupies the view at a time', async ({ page }) => {
  await page.goto('/iframe.html?id=components-navigationview--deep-stack');

  const visiblePages = () =>
    page.evaluate(
      () =>
        Array.from(document.querySelectorAll<HTMLElement>('[class*="pageContent"]')).filter(
          (el) => el.getBoundingClientRect().height > 0,
        ).length,
    );

  await expect.poll(visiblePages).toBe(1);
});
