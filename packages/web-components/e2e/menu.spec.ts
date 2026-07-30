import { expect, test } from '@playwright/test';

test('menu supports keyboard navigation and returns focus after selection', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-menu--interactive');

  const trigger = page.getByRole('button', { name: 'Project options' });
  const rename = page.getByRole('menuitem', { name: 'Rename' });
  const archive = page.getByRole('menuitem', { name: /Archive/ });

  await trigger.focus();
  await page.keyboard.press('ArrowDown');

  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(rename).toBeFocused();

  await page.keyboard.press('ArrowDown');
  await expect(archive).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
  await expect(page.getByText('Selected archive.')).toBeVisible();
});

test('menu rewires an htmx-style content replacement while open', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-menu--interactive');

  const trigger = page.getByRole('button', { name: 'Project options' });
  await trigger.click();

  await page.evaluate(() => {
    const original = document.querySelector<HTMLElement>('[data-slot="menu-content"]');
    const replacement = document.createElement('section');
    replacement.dataset.slot = 'menu-content';
    replacement.innerHTML =
      '<button type="button" data-menu-item data-value="share">Share</button>';
    original?.replaceWith(replacement);
  });

  const content = page.getByRole('menu');
  const item = page.getByRole('menuitem', { name: 'Share' });
  const contentId = await content.getAttribute('id');

  if (!contentId) {
    throw new Error('Menu content requires a generated ID.');
  }

  await expect(trigger).toHaveAttribute('aria-controls', contentId);
  await expect(item).toBeFocused();
});
