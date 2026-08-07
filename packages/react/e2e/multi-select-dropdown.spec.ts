import { expect, test } from '@playwright/test';

// MultiSelectDropdown.test.tsx drives Space/Enter/Escape with
// `fireEvent.keyDown` at whatever element it grabs directly, never through
// real DOM focus. This runs the real focus → keydown → focus-return
// pipeline: open, toggle two options with real Space presses (the list must
// stay open — unlike single-select `Dropdown`), then close and check the
// summary and focus return.
//
// Note: real focus never leaves the trigger button on open (see
// combo-row.spec.ts) — Space on the trigger itself just reopens the list
// rather than toggling. `listbox.press(...)` focuses the listbox first to
// reach the toggle handler, the same way it will once that's fixed.

test('toggles multiple options with real keyboard input without closing, then summarizes on close', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-multiselectdropdown--default');

  const trigger = page.getByRole('combobox', { name: 'Languages' });
  await trigger.click();

  const listbox = page.getByRole('listbox');
  await listbox.press('Space'); // toggles JavaScript (active on open)
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');

  await listbox.press('ArrowDown');
  await listbox.press('Space'); // toggles TypeScript
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');

  await listbox.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveText('2 selected');
});
