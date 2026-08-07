import { expect, type Locator, test } from '@playwright/test';

// handlePaste reads `e.clipboardData.getData('text')` from a real
// `ClipboardEvent`. OtpInput.test.tsx fires a synthetic `paste` event with
// `clipboardData: { getData: () => '...' }` — a plain object, never a real
// `ClipboardEvent`/`DataTransfer`. These dispatch a genuine `ClipboardEvent`
// backed by a real `DataTransfer` (the reliable, CI-safe way to test paste —
// OS-level Ctrl/Cmd+V clipboard shortcuts are flaky across environments).

async function pasteInto(cell: Locator, text: string) {
  await cell.evaluate((el, value) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text', value);
    el.dispatchEvent(
      new ClipboardEvent('paste', { clipboardData: dataTransfer, bubbles: true, cancelable: true }),
    );
  }, text);
}

test('distributes a real ClipboardEvent paste across the cells from the start', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-otpinput--default');

  await pasteInto(page.getByLabel('Digit 1 of 6'), '123456');

  await expect(page.getByLabel('Digit 1 of 6')).toHaveValue('1');
  await expect(page.getByLabel('Digit 2 of 6')).toHaveValue('2');
  await expect(page.getByLabel('Digit 6 of 6')).toHaveValue('6');
});

test('truncates a real ClipboardEvent paste that overflows the remaining cells', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-otpinput--default');

  // The joined `value` string can't represent a gap before the paste's
  // start index, so the earlier cell needs a real digit already in it —
  // matches OtpInput.test.tsx's equivalent case (`value="1"` before pasting
  // at index 1).
  await page.getByLabel('Digit 1 of 6').fill('9');
  await pasteInto(page.getByLabel('Digit 2 of 6'), '23456789');

  await expect(page.getByLabel('Digit 1 of 6')).toHaveValue('9');
  await expect(page.getByLabel('Digit 2 of 6')).toHaveValue('2');
  await expect(page.getByLabel('Digit 6 of 6')).toHaveValue('6');
});
