import { expect, test } from '@playwright/test';

test('dialog isolates the page, manages focus, and refreshes swapped content', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-dialog--interactive');

  const trigger = page.getByRole('button', { name: 'Delete project' });
  const dialog = page.locator('gnome-dialog');
  await trigger.click();

  await expect(dialog).toHaveAttribute('open', '');
  await expect(trigger).toHaveJSProperty('inert', true);
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();

  await dialog.evaluate((element) => {
    element.querySelector('[data-slot="dialog-surface"]')?.replaceWith(
      Object.assign(document.createElement('article'), {
        innerHTML: `
          <h2 data-slot="dialog-title">Updated dialog</h2>
          <p data-slot="dialog-description">Updated description</p>
          <button type="button">Continue</button>
        `,
      }),
    );
    element.lastElementChild?.setAttribute('data-slot', 'dialog-surface');
  });

  await expect(page.getByRole('dialog', { name: 'Updated dialog' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).not.toHaveAttribute('open', '');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveJSProperty('inert', false);
});
