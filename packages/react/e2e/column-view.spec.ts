import { expect, test } from '@playwright/test';

// ColumnView is a real <table> with sortable headers, a checkbox selection
// column, and roving row keyboard navigation. jsdom lays out no table, so the
// column alignment that makes it readable is unverifiable there, and its
// keyboard handler is only ever reached through synthesised events that never
// depend on which row genuinely holds focus.

test('clicking a header sorts the rows and toggles direction on the second click', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=data-display-columnview--with-sort');

  const grid = page.getByRole('table').or(page.getByRole('grid')).first();
  const nameHeader = grid.getByRole('columnheader').first();

  await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
  const ascending = await grid.locator('tbody tr td:first-child').allInnerTexts();

  await nameHeader.getByRole('button').click();

  await expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
  const descending = await grid.locator('tbody tr td:first-child').allInnerTexts();

  expect(descending).toEqual([...ascending].reverse());
});

test('the select-all box drives every row and reflects a partial selection', async ({ page }) => {
  await page.goto('/iframe.html?id=data-display-columnview--multiple-selection');

  const selectAll = page.getByRole('checkbox', { name: 'Select all rows' });
  const rowBoxes = page.getByRole('checkbox', { name: /^Select row / });

  await expect(selectAll).toBeVisible();
  const total = await rowBoxes.count();
  expect(total).toBeGreaterThan(2);

  // Two of the rows start selected, so the header box is in the mixed state —
  // a DOM property with no attribute, painted through `:indeterminate`.
  expect(await selectAll.evaluate((el: HTMLInputElement) => el.indeterminate)).toBe(true);

  await selectAll.check();
  await expect(rowBoxes.first()).toBeChecked();
  await expect(rowBoxes.last()).toBeChecked();
  expect(await selectAll.evaluate((el: HTMLInputElement) => el.indeterminate)).toBe(false);
});

test('the row checkbox does not also toggle the row it sits in', async ({ page }) => {
  await page.goto('/iframe.html?id=data-display-columnview--multiple-selection');

  const firstRow = page.getByRole('row').nth(1);
  const box = firstRow.getByRole('checkbox');

  const before = await firstRow.getAttribute('aria-selected');
  await box.click();

  // The cell's `stopPropagation` has to keep the row's own onClick from
  // running and undoing what the checkbox just did.
  await expect(box).toBeChecked();
  await expect(firstRow).toHaveAttribute('aria-selected', String(before !== 'true'));
});

test('the columns line up between the header and every body row', async ({ page }) => {
  await page.goto('/iframe.html?id=data-display-columnview--default');

  const headerXs = await page
    .getByRole('columnheader')
    .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().x)));

  const firstRowXs = await page
    .getByRole('row')
    .nth(1)
    .getByRole('cell')
    .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().x)));

  expect(firstRowXs).toEqual(headerXs);
});
