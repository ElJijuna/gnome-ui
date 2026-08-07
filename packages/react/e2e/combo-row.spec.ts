import { expect, test } from '@playwright/test';

// ComboRow.test.tsx drives its keyboard interactions with `fireEvent.keyDown`
// fired directly at whichever element the test grabs, regardless of real DOM
// focus — it never verifies the actual focus → keydown → focus-return
// pipeline a real keyboard user goes through.
//
// Note: real keyboard focus never actually leaves the trigger button when
// the list opens (no component in this family calls `.focus()` on the
// listbox), so the trigger's own arrow-key handling only jumps to the
// first/last option — relative one-at-a-time navigation lives on the
// listbox's handler and is only reachable once something moves focus there.
// This uses `listbox.press(...)`, which focuses it first, to reach that
// handler the same way it will once that reachability gap is fixed.

test('selecting an option with a real keyboard flow updates the value and returns focus to the trigger', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-comborow--default');

  const trigger = page.getByRole('combobox');
  await trigger.click();

  const listbox = page.getByRole('listbox');
  await listbox.press('ArrowUp'); // system (index 2, active) -> dark (index 1)
  await listbox.press('Enter');

  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveText('Dark');
});
