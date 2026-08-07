import { expect, test } from '@playwright/test';

// The suggestions dropdown is positioned from a real
// `wrapperRef.current.getBoundingClientRect()` so it matches the search
// bar's actual on-screen width. jsdom always returns a zero-size rect, so
// SearchBar.test.tsx (which otherwise uses real `userEvent` keyboard input)
// has never been able to check this against real layout.

test('positions the suggestions dropdown to match the real search bar width', async ({ page }) => {
  await page.goto('/iframe.html?id=components-searchbar--autocomplete');

  const input = page.getByPlaceholder('Search cities…');
  await input.fill('a');

  const listbox = page.getByRole('listbox', { name: 'Suggestions' });
  await expect(listbox).toBeVisible();

  const wrapper = input.locator('xpath=ancestor::*[contains(@class,"wrapper")]').first();
  const wrapperBox = await wrapper.boundingBox();
  const listboxBox = await listbox.boundingBox();

  expect(wrapperBox).not.toBeNull();
  expect(listboxBox).not.toBeNull();
  expect(Math.abs(listboxBox!.width - wrapperBox!.width)).toBeLessThan(1);
});
