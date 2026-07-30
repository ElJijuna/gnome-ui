import { expect, test } from '@playwright/test';

test('radio group cycles selection via arrow keys and reports the selected value', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-radio-group--interactive');

  const list = page.getByRole('radio', { name: 'List' });
  const grid = page.getByRole('radio', { name: 'Grid' });

  await expect(list).toBeChecked();
  await expect(page.getByText('View: list.')).toBeVisible();

  await list.focus();
  await page.keyboard.press('ArrowDown');

  await expect(grid).toBeChecked();
  await expect(list).not.toBeChecked();
  await expect(page.getByText('View: grid.')).toBeVisible();
});

test('disabled radio group disables every control', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-radio-group--disabled');

  const host = page.locator('gnome-radio-group');
  const list = page.getByRole('radio', { name: 'List' });
  const grid = page.getByRole('radio', { name: 'Grid' });

  await expect(host).toHaveAttribute('data-state', 'disabled');
  await expect(list).toBeDisabled();
  await expect(grid).toBeDisabled();

  await host.evaluate((element) => {
    element.removeAttribute('disabled');
  });

  await expect(list).toBeEnabled();
  await list.click();
  await expect(list).toBeChecked();
});
