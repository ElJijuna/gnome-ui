import { expect, test } from '@playwright/test';

// Dropdown scrolls the active option into view with a real `scrollIntoView`
// call on real layout. Dropdown.test.tsx stubs
// `Element.prototype.scrollIntoView = vi.fn()`, so the actual scroll (and
// whether the item ends up visible inside the listbox afterward) has never
// been checked against real geometry.

test('scrolls the active option into view when navigating past the visible list', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-dropdown--many-options');

  await page.getByRole('combobox', { name: 'Timezone' }).click();

  const listbox = page.getByRole('listbox');
  await listbox.press('End');

  const lastOption = page.getByRole('option', { name: 'Pacific/Auckland' });
  await expect(lastOption).toBeVisible();

  const listBox = await listbox.boundingBox();
  const optBox = await lastOption.boundingBox();
  expect(listBox).not.toBeNull();
  expect(optBox).not.toBeNull();

  expect(optBox!.y).toBeGreaterThanOrEqual(listBox!.y);
  expect(optBox!.y + optBox!.height).toBeLessThanOrEqual(listBox!.y + listBox!.height + 2);
});
