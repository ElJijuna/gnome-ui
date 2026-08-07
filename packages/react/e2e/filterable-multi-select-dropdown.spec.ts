import { expect, test } from '@playwright/test';

// FilterableMultiSelectDropdown.test.tsx sets the filter value via
// `fireEvent.change`, bypassing real keystrokes entirely — it never proves
// the component's own documented divergence from `MultiSelectDropdown`:
// Space must type a literal space into the filter field (valid filter text)
// rather than toggle the active option, which only a real keyboard event
// through real DOM focus can actually verify.

test('typing a real space into the filter field types a space instead of toggling an option', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-filterablemultiselectdropdown--long-list');

  const trigger = page.getByRole('combobox', { name: 'Countries' });
  await trigger.click();

  const filterInput = page.getByPlaceholder('Filter options…');
  await expect(filterInput).toBeFocused();

  await page.keyboard.type('united states');
  await expect(filterInput).toHaveValue('united states');

  // Initial value is ['us', 'de'] — typing (including real spaces) must not
  // have toggled anything.
  await page.keyboard.press('Escape');
  await expect(trigger).toHaveText('2 selected');
});
